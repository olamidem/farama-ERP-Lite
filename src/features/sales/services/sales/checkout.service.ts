import { supabase } from "../../../../api/supabase";
import type {
  CreateSaleInput,
  Sale,
} from "../../types/sale";
import {
  createSaleRecord,
  createSaleItems,
  getSale,
} from "../sale.service";
import {
  validateInventory,
  deductInventory,
} from "./inventory-sync.service";
import {
  validateWalletBalance,
} from "./payment.service";
import {
  payWithWallet,
} from "../../../customers/services/wallet.service";
import { increaseOutstandingDebt } from "../customers/customer-finance.service";

const WALK_IN_CUSTOMER_ID = "walk-in-customer-id";

export async function processCheckout(
  input: CreateSaleInput
): Promise<Sale> {

  /* ---------------------------------------------------------- */
  /* Cashier                                                    */
  /* ---------------------------------------------------------- */

  let cashierId: string | null = null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    cashierId = user?.id ?? null;
  } catch {}

  /* ---------------------------------------------------------- */
  /* Customer                                                   */
  /* ---------------------------------------------------------- */

  const customerId =
    !input.customer_id ||
    input.customer_id === WALK_IN_CUSTOMER_ID
      ? null
      : input.customer_id;

  /* ---------------------------------------------------------- */
  /* Inventory Validation                                       */
  /* ---------------------------------------------------------- */

  await validateInventory(input.items);

  /* ---------------------------------------------------------- */
  /* Wallet Validation                                          */
  /* ---------------------------------------------------------- */

  if (input.payment_method === "WALLET") {
    if (!customerId) {
      throw new Error(
        "Wallet payment requires a registered customer."
      );
    }

    const wallet = await validateWalletBalance(
      customerId,
      input.payable_amount
    );

    if (!wallet.valid) {
      throw new Error(wallet.message);
    }
  }

  /* ---------------------------------------------------------- */
  /* Create Sale                                                */
  /* ---------------------------------------------------------- */

  const sale = await createSaleRecord({
    ...input,
    customer_id: customerId,
  });

  /* ---------------------------------------------------------- */
  /* Sale Items                                                 */
  /* ---------------------------------------------------------- */

  await createSaleItems(
    sale.id,
    input.items
  );

  /* ---------------------------------------------------------- */
  /* Inventory                                                  */
  /* ---------------------------------------------------------- */

  await deductInventory(
    input.items,
    sale.sale_number,
    cashierId
  );

  /* ---------------------------------------------------------- */
  /* Wallet Payment                                             */
  /* ---------------------------------------------------------- */

  if (
    input.payment_method === "WALLET" &&
    customerId
  ) {
    await payWithWallet({
      customer_id: customerId,
      amount: input.payable_amount,
      sale_id: sale.id,
      reference: sale.sale_number,
      notes: `POS Sale ${sale.sale_number}`,
      performed_by: cashierId ?? undefined,
    });
  }

  /* ---------------------------------------------------------- */
  /* Outstanding Balance                                        */
  /* ---------------------------------------------------------- */

  const paid =
    input.amount_paid ??
    input.payable_amount;

const outstanding = Math.max(
    0,
    input.payable_amount - paid
);

if (customerId && outstanding > 0) {
    await increaseOutstandingDebt(
        customerId,
        outstanding
    );
}

  /* ---------------------------------------------------------- */
  /* Complete Cart                                              */
  /* ---------------------------------------------------------- */

  if (input.cart_id) {
    await supabase
      .from("carts")
      .update({
        status: "COMPLETED",
      })
      .eq("id", input.cart_id);
  }

  /* ---------------------------------------------------------- */
  /* Return                                                     */
  /* ---------------------------------------------------------- */

  return getSale(sale.id);
}