import { supabase } from "../../../../api/supabase";
import type {
  CreateSaleInput,
  Sale,
  SaleStatus,
} from "../../types/sale";
import type { PaymentMethod } from "../../types/payment";
export { processCheckout as createSale } from "./checkout.service";
export { refundSale } from "./refund.service";
export { getSalesStatistics as getSalesStats } from "./sales-statistics.service";
export { getPOSProducts } from "./pos-products.service";

/* -------------------------------------------------------------------------- */
/* Sale Number                                                                */
/* -------------------------------------------------------------------------- */

export async function generateSaleNumber(): Promise<string> {
  const { count, error } = await supabase
    .from("sales")
    .select("*", {
      count: "exact",
      head: true,
    });

  if (error) throw error;

  const next = (count ?? 0) + 1;
  const year = new Date().getFullYear();

  return `SL-${year}-${String(next).padStart(6, "0")}`;
}

/* -------------------------------------------------------------------------- */
/* Create Sale                                                                */
/* -------------------------------------------------------------------------- */

export async function createSaleRecord(
  payload: CreateSaleInput
): Promise<Sale> {
  let createdBy: string | null = null;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    createdBy = user?.id ?? null;
  } catch {
    // optional auth check
  }

  const saleNumber = await generateSaleNumber();

  const { data, error } = await supabase
    .from("sales")
    .insert({
      sale_number: saleNumber,
      cart_id: payload.cart_id ?? null,
      customer_id: payload.customer_id ?? null,
      customer_name:
        payload.customer_name ?? "Walk-in Customer",
      customer_phone:
        payload.customer_phone ?? null,
      subtotal:
        payload.subtotal ?? payload.total_amount,
      total_amount: payload.total_amount,
      discount_amount: payload.discount_amount,
      tax_amount: payload.tax_amount,
      payable_amount: payload.payable_amount,
      amount_paid:
        payload.amount_paid ??
        payload.payable_amount,
      payment_method: payload.payment_method,
      remarks: payload.remarks ?? null,
      status: "COMPLETED",
      created_by: createdBy,
    })
    .select()
    .single();

  if (error) throw error;

  return data as Sale;
}

/* -------------------------------------------------------------------------- */
/* Sale Items                                                                 */
/* -------------------------------------------------------------------------- */

export async function createSaleItems(
  saleId: string,
  items: CreateSaleInput["items"]
): Promise<void> {
  const payload = items.map((item) => ({
    sale_id: saleId,

    product_id: item.product_id,

    product_unit_id: item.product_unit_id,

    quantity: item.quantity,

    unit_price: item.unit_price,

    cost_price: item.cost_price,

    discount: item.discount ?? 0,

    tax: item.tax ?? 0,

    total_price:
      item.total_price ??
      item.quantity * item.unit_price,
  }));

  const { error } = await supabase
    .from("sale_items")
    .insert(payload);

  if (error) throw error;
}

/* -------------------------------------------------------------------------- */
/* Get All Sales                                                              */
/* -------------------------------------------------------------------------- */

export async function getSales(): Promise<Sale[]> {
  const { data, error } = await supabase
    .from("sales")
    .select(`
      *,
      items:sale_items(
        *,
        product:products(*),
        product_unit:product_units(
          *,
          unit:units(*)
        )
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return (data ?? []) as Sale[];
}

/* -------------------------------------------------------------------------- */
/* Get Single Sale                                                            */
/* -------------------------------------------------------------------------- */

export async function getSale(
  id: string
): Promise<Sale> {
  const { data, error } = await supabase
    .from("sales")
    .select(`
      *,
      items:sale_items(
        *,
        product:products(*),
        product_unit:product_units(
          *,
          unit:units(*)
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;

  return data as Sale;
}

/* -------------------------------------------------------------------------- */
/* Update Sale                                                                */
/* -------------------------------------------------------------------------- */

export async function updateSale(
  id: string,
  updates: Partial<Sale>
): Promise<Sale> {
  const { error } = await supabase
    .from("sales")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;

  return getSale(id);
}

/* -------------------------------------------------------------------------- */
/* Update Status                                                              */
/* -------------------------------------------------------------------------- */

export async function updateSaleStatus(
  id: string,
  status: SaleStatus
): Promise<Sale> {
  return updateSale(id, { status });
}

/* -------------------------------------------------------------------------- */
/* Delete Sale                                                                */
/* -------------------------------------------------------------------------- */

export async function deleteSale(
  id: string
): Promise<void> {
  await supabase
    .from("sale_items")
    .delete()
    .eq("sale_id", id);

  const { error } = await supabase
    .from("sales")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/* -------------------------------------------------------------------------- */
/* Update Sale Payment                                                        */
/* -------------------------------------------------------------------------- */

export async function updateSalePayment(
  saleId: string,
  additionalAmount: number,
  paymentMethod: PaymentMethod = "CASH",
  notes?: string
): Promise<Sale> {
  const sale = await getSale(saleId);
  const currentPaid = Number(sale.amount_paid ?? sale.payable_amount ?? 0);
  const newAmountPaid = Math.min(sale.payable_amount, currentPaid + additionalAmount);

  const remarkText = notes
    ? `${sale.remarks ? sale.remarks + " | " : ""}Payment +${additionalAmount} via ${paymentMethod} (${notes})`
    : sale.remarks;

  const { data, error } = await supabase
    .from("sales")
    .update({
      amount_paid: newAmountPaid,
      payment_method: paymentMethod || sale.payment_method,
      remarks: remarkText,
      updated_at: new Date().toISOString(),
    })
    .eq("id", saleId)
    .select()
    .single();

  if (error) throw error;

  if (sale.customer_id) {
    try {
      const { reduceOutstandingDebt } = await import("../customers/customer-finance.service");
      await reduceOutstandingDebt({
        customer_id: sale.customer_id,
        amount: additionalAmount,
        payment_method: paymentMethod,
        notes: notes || `Payment update for Sale #${sale.sale_number}`,
      });
    } catch (e) {
      console.warn("Customer debt update skipped or failed:", e);
    }
  }

  return data as Sale;
}