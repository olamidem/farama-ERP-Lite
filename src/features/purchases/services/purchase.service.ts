import { supabase } from "../../../api/supabase";
import {
  PURCHASE_STATUS,
  type PurchaseStatus,
} from "../constant/purchase.constants";
import type {
  CreatePurchaseInput,
  Purchase,
  UpdatePurchaseInput,
} from "../types/purchase";
import type { PurchaseStats } from "../types/purchaseStats";
import type { ReceivePurchaseInput } from "../types/purchaseItem";
import { calculateReceivedPercentage } from "../utils/calculatePurchaseTotal";
import { generatePurchaseNumber } from "../utils/generatePurchaseNumber";
import type { Supplier } from "../types/supplier";

export async function getPurchases() {
  const { data, error } = await supabase
    .from("purchases")
    .select(
      `
      *,
      supplier:suppliers(*),

      items:purchase_items(
        *,
        product:products(*),
        product_unit:product_units(
          *,
          unit:units(*)
        )
      )
    `,
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Purchase[];
}

export async function getPurchase(id: string) {
  const { data, error } = await supabase
    .from("purchases")
    .select(
      `
      *,
      supplier:suppliers(*),

      items:purchase_items(
        *,
        product:products(*),
        product_unit:product_units(
          *,
          unit:units(*)
        )
      )
    `,
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Purchase;
}

export async function createPurchase(input: CreatePurchaseInput) {
  const total = input.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_cost,
    0,
  );

  const purchaseNumber = await generatePurchaseNumber();

  /*
   * Resolve the authenticated staff member who is raising this purchase order.
   * We catch errors so a missing/expired session doesn't block the create —
   * the column is nullable in the schema.
   */
  let createdBy: string | null = null;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    createdBy = user?.id ?? null;
  } catch {
    // Auth unavailable — created_by will be null but we still proceed
  }

  const { data: purchase, error } = await supabase
    .from("purchases")
    .insert({
      purchase_number: purchaseNumber,
      supplier_id: input.supplier_id,
      purchase_date: input.purchase_date,
      expected_delivery_date: input.expected_delivery_date,
      remarks: input.remarks,
      total_amount: total,
      status: PURCHASE_STATUS.PENDING,
      created_by: createdBy,   // ← was missing; now always written
    })
    .select()
    .single();

  if (error) throw error;

  const items = input.items.map((item) => ({
    purchase_id: purchase.id,
    product_id: item.product_id,
    product_unit_id: item.product_unit_id,
    quantity: item.quantity,
    unit_cost: item.unit_cost,
    total_cost: item.quantity * item.unit_cost,
  }));

  const { error: itemError } = await supabase
    .from("purchase_items")
    .insert(items);
  if (itemError) throw itemError;
  return purchase;
}

export async function updatePurchase(id: string, input: UpdatePurchaseInput) {
  let total_amount = undefined;
  if (input.items) {
    total_amount = input.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_cost,
      0,
    );
  }

  const updateData: Record<string, unknown> = {
    supplier_id: input.supplier_id,
    purchase_date: input.purchase_date,
    expected_delivery_date: input.expected_delivery_date,
    remarks: input.remarks,
    status: input.status,
  };
  if (total_amount !== undefined) {
    updateData.total_amount = total_amount;
  }

  const { data: purchase, error } = await supabase
    .from("purchases")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  if (input.items) {
    const { error: deleteError } = await supabase
      .from("purchase_items")
      .delete()
      .eq("purchase_id", id);
    if (deleteError) throw deleteError;

    const itemsToInsert = input.items.map((item) => ({
      purchase_id: id,
      product_id: item.product_id,
      product_unit_id: item.product_unit_id,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
      total_cost: item.quantity * item.unit_cost,
    }));

    const { error: insertError } = await supabase
      .from("purchase_items")
      .insert(itemsToInsert);
    if (insertError) throw insertError;
  }

  return purchase;
}

export async function deletePurchase(id: string) {
  const { error } = await supabase.from("purchases").delete().eq("id", id);
  if (error) throw error;
}

export async function receivePurchaseGoods({
  purchaseId,
  receivedItems,
}: ReceivePurchaseInput) {
  if (!receivedItems.length) {
    throw new Error("No items supplied.");
  }

  /**
   * Fetch purchase order details first to get the purchase order number
   */
  const { data: purchase, error: purchaseGetError } = await supabase
    .from("purchases")
    .select("purchase_number")
    .eq("id", purchaseId)
    .single();

  if (purchaseGetError) throw purchaseGetError;
  const purchaseNumber =
    purchase?.purchase_number || `PO-${purchaseId.substring(0, 8)}`;

  /**
   * Get current authenticated user
   */
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const createdBy = user ? user.id : null;

  /**
   * Update received quantity for each purchase item
   */
  for (const item of receivedItems) {
    if (item.received_quantity <= 0) {
      throw new Error("Received quantity must be greater than zero.");
    }

    const { data: purchaseItem, error } = await supabase
      .from("purchase_items")
      .select(`id,product_id,quantity,product_unit_id,received_quantity`)
      .eq("id", item.purchase_item_id)
      .single();

    if (error) throw error;

    const currentReceived = purchaseItem.received_quantity ?? 0;
    const newReceived = currentReceived + item.received_quantity;

    if (newReceived > purchaseItem.quantity) {
      throw new Error("Received quantity cannot exceed ordered quantity.");
    }

    const { error: updateError } = await supabase
      .from("purchase_items")
      .update({
        received_quantity: newReceived,
      })
      .eq("id", item.purchase_item_id);

    if (updateError) throw updateError;

    /**
     * Automatically update stock quantity on the product table
     */
    // 1. Fetch the product unit's conversion factor
    const { data: productUnit, error: puErr } = await supabase
      .from("product_units")
      .select("conversion_factor")
      .eq("id", purchaseItem.product_unit_id)
      .single();

    if (puErr) throw puErr;
    const conversionFactor = productUnit?.conversion_factor || 1;

    // 2. Compute the base unit stock change
    const baseStockChange = item.received_quantity * conversionFactor;

    // 3. Fetch the product's current stock
    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("stock")
      .eq("id", purchaseItem.product_id)
      .single();

    if (prodErr) throw prodErr;
    const currentStock = product?.stock || 0;
    const newStock = currentStock + baseStockChange;

    // 4. Update the stock quantity on the product table
    const { error: updateProductError } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", purchaseItem.product_id);

    if (updateProductError) throw updateProductError;

    // 5. Insert an inventory transaction log entry
    try {
      const transactionPayload: {
        product_id: string;
        product_unit_id: string;
        quantity: number;
        balance_after: number;
        transaction_type: string;
        reference: string;
        remarks: string;
        created_by?: string | null;
      } = {
        product_id: purchaseItem.product_id,
        product_unit_id: purchaseItem.product_unit_id,
        quantity: baseStockChange,
        balance_after: newStock,
        transaction_type: "PURCHASE",
        reference: purchaseNumber,
        remarks: `Goods received for PO ${purchaseNumber}`,
      };

      if (createdBy) {
        transactionPayload.created_by = createdBy;
      }

      const { error: txErr } = await supabase
        .from("inventory_transactions")
        .insert(transactionPayload);

      if (txErr) {
        console.warn(
          "Failed to log inventory transaction due to RLS or constraints:",
          txErr,
        );
      }
    } catch (err) {
      console.warn("Error logging inventory transaction:", err);
    }
  }

  /**
   * Fetch all purchase items again
   */
  const { data: items, error: itemsError } = await supabase
    .from("purchase_items")
    .select("quantity, received_quantity")
    .eq("purchase_id", purchaseId);

  if (itemsError) throw itemsError;

  /**
   * Calculate overall received percentage
   */
  const receivedPercentage = calculateReceivedPercentage(items);

  /**
   * Determine purchase status
   */
  let status: PurchaseStatus = PURCHASE_STATUS.ORDERED;
  if (receivedPercentage > 0 && receivedPercentage < 100) {
    status = PURCHASE_STATUS.PARTIALLY_RECEIVED;
  }
  if (receivedPercentage === 100) {
    status = PURCHASE_STATUS.RECEIVED;
  }

  /**
   * Update purchase summary
   */
  const { error: purchaseError } = await supabase
    .from("purchases")
    .update({
      received_percentage: receivedPercentage,
      status,
    })
    .eq("id", purchaseId);
  if (purchaseError) throw purchaseError;

  return await getPurchase(purchaseId);
}

export async function closePurchase(id: string) {
  const { data, error } = await supabase
    .from("purchases")
    .update({ status: PURCHASE_STATUS.CLOSED })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Purchase;
}

export async function getPurchaseStats(): Promise<PurchaseStats> {
  const purchases = await getPurchases();

  const pendingStatuses: PurchaseStatus[] = [
    PURCHASE_STATUS.PARTIALLY_RECEIVED,
    PURCHASE_STATUS.PENDING,
    PURCHASE_STATUS.APPROVED,
    PURCHASE_STATUS.ORDERED,
  ];

  return {
    totalOrders: purchases.length,

    pendingOrders: purchases.filter((purchase) =>
      pendingStatuses.includes(purchase.status),
    ).length,

    receivedOrders: purchases.filter(
      (purchase) => purchase.status === PURCHASE_STATUS.RECEIVED,
    ).length,

    partiallyReceivedOrders: purchases.filter(
      (purchase) => purchase.status === PURCHASE_STATUS.PARTIALLY_RECEIVED,
    ).length,

    totalPurchaseValue: purchases.reduce(
      (total, purchase) => total + purchase.total_amount,
      0,
    ),
  };
}

export async function getSuppliers() {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data as Supplier[];
}
