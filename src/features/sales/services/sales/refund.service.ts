import { getSale } from "./sales.service";
import { restoreInventory } from "./inventory-sync.service";
import { supabase } from "../../../../api/supabase";
import type { SaleItem } from "../../types/sale";
import { refundToWallet, reduceOutstandingDebt } from "../customers/customer-finance.service";

/* -------------------------------------------------------------------------- */
/* Refund Sale                                                                */
/* -------------------------------------------------------------------------- */

export async function refundSale(saleId: string) {
  const sale = await getSale(saleId);

  if (!sale) {
    throw new Error("Sale not found.");
  }

  if (sale.status === "REFUNDED") {
    throw new Error("Sale has already been refunded.");
  }

  let cashierId: string | null = null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    cashierId = user?.id ?? null;
  } catch {
    // Optional auth check fallback
  }

  /* ---------------------------------------------------------------------- */
  /* Restore Inventory                                                      */
  /* ---------------------------------------------------------------------- */

  const items = (sale.items ?? []).map((item: SaleItem) => ({
    product_id: item.product_id,
    product_unit_id: item.product_unit_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    cost_price: item.cost_price,
  }));

  await restoreInventory(items, sale.sale_number, cashierId);

  /* ---------------------------------------------------------------------- */
  /* Refund Wallet                                                          */
  /* ---------------------------------------------------------------------- */

  if (sale.payment_method === "WALLET" && sale.customer_id) {
    await refundToWallet({
      customer_id: sale.customer_id,
      amount: sale.payable_amount,
      reference: `REF-${sale.sale_number}`,
      notes: `Refund for ${sale.sale_number}`,
      performed_by: cashierId ?? undefined,
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Reduce Outstanding Debt                                                */
  /* ---------------------------------------------------------------------- */

  if (sale.customer_id && sale.amount_paid < sale.payable_amount) {
    const debt = sale.payable_amount - sale.amount_paid;

    await reduceOutstandingDebt({
      customer_id: sale.customer_id,
      amount: debt,
      payment_method: "WALLET",
      notes: `Debt reduction for refunded sale ${sale.sale_number}`,
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Update Sale                                                            */
  /* ---------------------------------------------------------------------- */

  const { error } = await supabase
    .from("sales")
    .update({
      status: "REFUNDED",
      updated_at: new Date().toISOString(),
    })
    .eq("id", sale.id);

  if (error) throw error;

  return getSale(sale.id);
}
