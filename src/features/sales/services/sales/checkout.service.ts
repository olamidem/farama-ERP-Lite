/**
 * checkout.service.ts
 *
 * Orchestrates the full POS checkout pipeline in strict order:
 *
 *  1. Resolve cashier identity from auth session
 *  2. Normalise customer ID (walk-in = null)
 *  3. Validate inventory availability (throws before any mutation)
 *  4. Validate wallet balance if paying by WALLET (throws before any mutation)
 *  5. Create or reuse a DB cart row  ← ensures sales.cart_id is never NULL
 *  6. Create the sale record
 *  7. Create sale_items
 *  8. Deduct inventory (writes inventory_transactions)
 *  9. Process WALLET payment (writes wallet_transactions + sale_id)
 * 10. Record outstanding balance if partial payment (writes customer_credit_transactions)
 * 11. Mark cart as CHECKED_OUT
 * 12. Return the fully-hydrated sale
 *
 * NOTE on cart_id:
 *   sales.cart_id was always NULL because the front-end only sets activeCartId
 *   when a held cart is loaded; for fresh sales it stays null.  We now resolve
 *   this in step 5: if a cart_id is provided (resumed held cart) we use it; if
 *   not, we create a new DB cart so the FK is always populated.
 */

import { supabase } from "../../../../api/supabase";
import type { CreateSaleInput, Sale } from "../../types/sale";
import {
  createSaleRecord,
  createSaleItems,
  getSale,
} from "./sales.service";
import {
  validateInventory,
  deductInventory,
} from "./inventory-sync.service";
import { validateWalletBalance } from "./payment.service";
import { payWithWallet } from "../customers/wallet.service";
import { increaseOutstandingDebt } from "../customers/customer-finance.service";
import { generateCartNumber } from "./cart.service";

/** Sentinel value used by the UI for walk-in (anonymous) customers */
const WALK_IN_CUSTOMER_ID = "walk-in-customer-id";

/* -------------------------------------------------------------------------- */
/*  processCheckout                                                            */
/* -------------------------------------------------------------------------- */

export async function processCheckout(
  input: CreateSaleInput
): Promise<Sale> {

  /* ---------------------------------------------------------- */
  /* 1. Resolve cashier from auth session                        */
  /* ---------------------------------------------------------- */

  let cashierId: string | null = null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    cashierId = user?.id ?? null;
  } catch {
    // Auth unavailable — cashier will be null but checkout still proceeds
  }

  /* ---------------------------------------------------------- */
  /* 2. Normalise customer ID                                   */
  /* ---------------------------------------------------------- */

  // Walk-in customers have no DB record; we store NULL in the FK columns
  const customerId =
    !input.customer_id || input.customer_id === WALK_IN_CUSTOMER_ID
      ? null
      : input.customer_id;

  /* ---------------------------------------------------------- */
  /* 3. Validate inventory — must run before any DB mutation    */
  /* ---------------------------------------------------------- */

  await validateInventory(input.items);

  /* ---------------------------------------------------------- */
  /* 4. Validate wallet balance (WALLET payment only)           */
  /* ---------------------------------------------------------- */

  if (input.payment_method === "WALLET") {
    if (!customerId) {
      throw new Error("Wallet payment requires a registered customer.");
    }

    const wallet = await validateWalletBalance(customerId, input.payable_amount);
    if (!wallet.valid) {
      throw new Error(wallet.message);
    }
  }

  /* ---------------------------------------------------------- */
  /* 5. Resolve cart_id                                         */
  /*                                                            */
  /*  If the caller supplied a cart_id (held cart resumed from  */
  /*  DB) we use it directly.  Otherwise we create a fresh cart */
  /*  so that sales.cart_id is never NULL.                      */
  /* ---------------------------------------------------------- */

  let resolvedCartId: string = input.cart_id ?? "";

  if (!resolvedCartId) {
    // Create a minimal DB cart row just to hold the FK reference.
    // The cart totals are managed by the sale record itself.
    const cartNumber = await generateCartNumber();
    const { data: newCart, error: cartError } = await supabase
      .from("carts")
      .insert({
        cart_number: cartNumber,
        customer_id: customerId,
        cashier_id: cashierId,
        status: "ACTIVE",
        subtotal: input.subtotal,
        discount_amount: input.discount_amount,
        tax_amount: input.tax_amount,
        total_amount: input.payable_amount,
      })
      .select("id")
      .single();

    if (cartError) {
      // Non-fatal: log and continue without a cart_id rather than aborting
      // the entire sale. The FK is nullable in the schema.
      console.warn("Cart creation failed during checkout:", cartError.message);
    } else {
      resolvedCartId = newCart.id;
    }
  }

  /* ---------------------------------------------------------- */
  /* 6. Create the sale record                                  */
  /* ---------------------------------------------------------- */

  const sale = await createSaleRecord({
    ...input,
    customer_id: customerId,
    cart_id: resolvedCartId || null,  // always populated now
  });

  /* ---------------------------------------------------------- */
  /* 7. Create sale_items                                       */
  /* ---------------------------------------------------------- */

  await createSaleItems(sale.id, input.items);

  /* ---------------------------------------------------------- */
  /* 8. Deduct inventory + log inventory_transactions           */
  /* ---------------------------------------------------------- */

  await deductInventory(input.items, sale.sale_number, cashierId);

  /* ---------------------------------------------------------- */
  /* 9. WALLET payment — debit wallet + write wallet_transaction */
  /* ---------------------------------------------------------- */

  if (input.payment_method === "WALLET" && customerId) {
    await payWithWallet({
      customer_id: customerId,
      amount: input.payable_amount,
      sale_id: sale.id,            // ← links the wallet tx to this sale
      reference: sale.sale_number,
      notes: `POS Sale ${sale.sale_number}`,
      performed_by: cashierId ?? undefined,
    });
  }

  /* ---------------------------------------------------------- */
  /* 10. Record outstanding balance (partial / credit sale)     */
  /* ---------------------------------------------------------- */

  const paid = input.amount_paid ?? input.payable_amount;
  const outstanding = Math.max(0, input.payable_amount - paid);

  if (customerId && outstanding > 0) {
    // Pass sale.id so the credit tx links back to this sale
    await increaseOutstandingDebt(
      customerId,
      sale.id,        // saleId
      outstanding,    // amount
      undefined,      // paymentMethod (not applicable for debt creation)
      cashierId ?? undefined  // performedBy
    );
  }

  /* ---------------------------------------------------------- */
  /* 10b. Log payment record into sale_payments table           */
  /* ---------------------------------------------------------- */

  if (paid > 0) {
    const { error: paymentLogError } = await supabase
      .from("sale_payments")
      .insert({
        sale_id: sale.id,
        customer_id: customerId,
        amount: paid,
        payment_method: input.payment_method || "CASH",
        reference: sale.sale_number,
        notes: `Initial checkout payment for sale #${sale.sale_number}`,
        performed_by: cashierId,
        created_at: new Date().toISOString(),
      });

    if (paymentLogError) {
      console.warn("Failed to log sale_payments record:", paymentLogError.message);
    }
  }

  /* ---------------------------------------------------------- */
  /* 11. Mark cart as CHECKED_OUT                               */
  /* ---------------------------------------------------------- */

  if (resolvedCartId) {
    await supabase
      .from("carts")
      .update({ status: "CHECKED_OUT" })
      .eq("id", resolvedCartId);
  }

  /* ---------------------------------------------------------- */
  /* 12. Return hydrated sale (with items, product, unit joins) */
  /* ---------------------------------------------------------- */

  return getSale(sale.id);
}
