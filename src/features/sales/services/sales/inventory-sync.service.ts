import { supabase } from "../../../api/supabase";

export type InventoryTransactionType =
  | "SALE"
  | "REFUND"
  | "PURCHASE"
  | "ADJUSTMENT"
  | "DAMAGE"
  | "EXPIRED";

interface InventorySyncInput {
  productId: string;
  productUnitId: string;
  quantity: number;
  transactionType: InventoryTransactionType;
  reference: string;
  remarks?: string;
  createdBy?: string | null;
}

/* -------------------------------------------------------------------------- */
/* Convert selling unit to base unit                                          */
/* -------------------------------------------------------------------------- */

async function getBaseQuantity(
  productUnitId: string,
  quantity: number
): Promise<number> {
  const { data, error } = await supabase
    .from("product_units")
    .select("conversion_factor")
    .eq("id", productUnitId)
    .single();

  if (error) throw error;

  return quantity * Number(data.conversion_factor || 1);
}

/* -------------------------------------------------------------------------- */
/* Read Current Stock                                                         */
/* -------------------------------------------------------------------------- */

async function getCurrentStock(
  productId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("products")
    .select("stock")
    .eq("id", productId)
    .single();

  if (error) throw error;

  return Number(data.stock || 0);
}

/* -------------------------------------------------------------------------- */
/* Update Product Stock                                                       */
/* -------------------------------------------------------------------------- */

async function updateProductStock(
  productId: string,
  stock: number
) {
  const { error } = await supabase
    .from("products")
    .update({
      stock,
    })
    .eq("id", productId);

  if (error) throw error;
}

/* -------------------------------------------------------------------------- */
/* Log Inventory Transaction                                                  */
/* -------------------------------------------------------------------------- */

async function logInventoryTransaction(
  input: {
    productId: string;
    productUnitId: string;
    quantity: number;
    balanceAfter: number;
    transactionType: InventoryTransactionType;
    reference: string;
    remarks?: string;
    createdBy?: string | null;
  }
) {
  const { error } = await supabase
    .from("inventory_transactions")
    .insert({
      product_id: input.productId,
      product_unit_id: input.productUnitId,
      quantity: input.quantity,
      balance_after: input.balanceAfter,
      transaction_type: input.transactionType,
      reference: input.reference,
      remarks: input.remarks,
      created_by: input.createdBy,
    });

  if (error) {
    console.warn(
      "Inventory transaction logging failed",
      error
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export async function decreaseInventory(
  input: InventorySyncInput
) {
  const baseQty = await getBaseQuantity(
    input.productUnitId,
    input.quantity
  );

  const currentStock = await getCurrentStock(
    input.productId
  );

  if (currentStock < baseQty) {
    throw new Error(
      "Insufficient stock available."
    );
  }

  const newStock = currentStock - baseQty;

  await updateProductStock(
    input.productId,
    newStock
  );

  await logInventoryTransaction({
    productId: input.productId,
    productUnitId: input.productUnitId,
    quantity: -baseQty,
    balanceAfter: newStock,
    transactionType: input.transactionType,
    reference: input.reference,
    remarks: input.remarks,
    createdBy: input.createdBy,
  });

  return newStock;
}

/* -------------------------------------------------------------------------- */

export async function increaseInventory(
  input: InventorySyncInput
) {
  const baseQty = await getBaseQuantity(
    input.productUnitId,
    input.quantity
  );

  const currentStock = await getCurrentStock(
    input.productId
  );

  const newStock = currentStock + baseQty;

  await updateProductStock(
    input.productId,
    newStock
  );

  await logInventoryTransaction({
    productId: input.productId,
    productUnitId: input.productUnitId,
    quantity: baseQty,
    balanceAfter: newStock,
    transactionType: input.transactionType,
    reference: input.reference,
    remarks: input.remarks,
    createdBy: input.createdBy,
  });

  return newStock;
}