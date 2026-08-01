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
      ),
      payments:sale_payments(
        *,
        performer:profiles(full_name, email)
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    // Fallback: If PostgREST schema cache has not picked up the FK to profiles yet
    const { data: fallbackData, error: fallbackError } = await supabase
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
        ),
        payments:sale_payments(*)
      `)
      .order("created_at", {
        ascending: false,
      });

    if (fallbackError) throw fallbackError;
    return (fallbackData ?? []) as Sale[];
  }

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
      ),
      payments:sale_payments(
        *,
        performer:profiles(full_name, email)
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    // Fallback if PostgREST schema cache is refreshing
    const { data: fallbackData, error: fallbackError } = await supabase
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
        ),
        payments:sale_payments(*)
      `)
      .eq("id", id)
      .single();

    if (fallbackError) throw fallbackError;
    return fallbackData as Sale;
  }

  return data as Sale;
}

/* -------------------------------------------------------------------------- */
/* Update Sale                                                                */
/* -------------------------------------------------------------------------- */

export async function updateSale(
  id: string,
  updates: Partial<Sale>
): Promise<Sale> {
  // Only pick actual DB columns — never spread joined/computed fields like `items` or `balance_due`
  const {
    customer_id,
    customer_name,
    customer_phone,
    subtotal,
    discount_amount,
    tax_amount,
    total_amount,
    payable_amount,
    amount_paid,
    payment_method,
    status,
    remarks,
    cart_id,
  } = updates;

  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (customer_id !== undefined) payload.customer_id = customer_id;
  if (customer_name !== undefined) payload.customer_name = customer_name;
  if (customer_phone !== undefined) payload.customer_phone = customer_phone;
  if (subtotal !== undefined) payload.subtotal = subtotal;
  if (discount_amount !== undefined) payload.discount_amount = discount_amount;
  if (tax_amount !== undefined) payload.tax_amount = tax_amount;
  if (total_amount !== undefined) payload.total_amount = total_amount;
  if (payable_amount !== undefined) payload.payable_amount = payable_amount;
  if (amount_paid !== undefined) payload.amount_paid = amount_paid;
  if (payment_method !== undefined) payload.payment_method = payment_method;
  if (status !== undefined) payload.status = status;
  if (remarks !== undefined) payload.remarks = remarks;
  if (cart_id !== undefined) payload.cart_id = cart_id;

  const { error } = await supabase
    .from("sales")
    .update(payload)
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

  let cashierId: string | null = null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    cashierId = user?.id ?? null;
  } catch {
    // Auth check fallback
  }

  if (sale.customer_id) {
    const { reduceOutstandingDebt } = await import("../customers/customer-finance.service");
    await reduceOutstandingDebt({
      customer_id: sale.customer_id,
      amount: additionalAmount,
      payment_method: paymentMethod,
      notes: notes || `Installment payment for Sale #${sale.sale_number}`,
      performed_by: cashierId ?? undefined,
      sale_id: saleId,
    });
  }

  return getSale(saleId);
}