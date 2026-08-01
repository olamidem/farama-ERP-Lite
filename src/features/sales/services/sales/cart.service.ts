import { supabase } from "../../../../api/supabase";
import type {
  Cart,
  CartItem,
} from "../../types/cart";

/* -------------------------------------------------------------------------- */
/* Cart Number                                                                */
/* -------------------------------------------------------------------------- */

export async function generateCartNumber(): Promise<string> {
  const { count, error } = await supabase
    .from("carts")
    .select("*", {
      count: "exact",
      head: true,
    });

  if (error) {
    return `CRT-${Date.now()}`;
  }

  const year = new Date().getFullYear();
  const next = (count ?? 0) + 1;

  return `CRT-${year}-${String(next).padStart(6, "0")}`;
}

/* -------------------------------------------------------------------------- */
/* Create Cart                                                                */
/* -------------------------------------------------------------------------- */

export async function createCart(
  customerId?: string | null,
  cashierId?: string | null
): Promise<Cart> {
  const cartNumber = await generateCartNumber();

  const { data, error } = await supabase
    .from("carts")
    .insert({
      cart_number: cartNumber,
      customer_id: customerId,
      cashier_id: cashierId,
      status: "ACTIVE",
      subtotal: 0,
      discount_amount: 0,
      tax_amount: 0,
      total_amount: 0,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    ...(data as Cart),
    items: [],
  };
}

/* -------------------------------------------------------------------------- */
/* Get Cart                                                                   */
/* -------------------------------------------------------------------------- */

export async function getCart(cartId: string): Promise<Cart> {
  const { data, error } = await supabase
    .from("carts")
    .select(
      `
      *,
      items:cart_items(
        *,
        product:products(*),
        product_unit:product_units(
          *,
          unit:units(*)
        )
      )
      `
    )
    .eq("id", cartId)
    .single();

  if (error) throw error;

  return data as Cart;
}

/* -------------------------------------------------------------------------- */
/* Get Active Cart                                                            */
/* -------------------------------------------------------------------------- */

export async function getActiveCart(
  cashierId: string
): Promise<Cart | null> {
  const { data } = await supabase
    .from("carts")
    .select(
      `
      *,
      items:cart_items(
        *,
        product:products(*),
        product_unit:product_units(
          *,
          unit:units(*)
        )
      )
      `
    )
    .eq("cashier_id", cashierId)
    .eq("status", "ACTIVE")
    .maybeSingle();

  return (data as Cart) ?? null;
}

/* -------------------------------------------------------------------------- */
/* Held Carts                                                                 */
/* -------------------------------------------------------------------------- */

export async function getHeldCarts(): Promise<Cart[]> {
  const { data, error } = await supabase
    .from("carts")
    .select(
      `
      *,
      items:cart_items(
        *,
        product:products(*),
        product_unit:product_units(
          *,
          unit:units(*)
        )
      )
      `
    )
    .eq("status", "HELD")
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return (data ?? []) as Cart[];
}

/* -------------------------------------------------------------------------- */
/* Add Item                                                                   */
/* -------------------------------------------------------------------------- */

export async function addItem(
  cartId: string,
  item: CartItem
): Promise<void> {
  const subtotal = item.quantity * item.unit_price;

  await supabase
    .from("cart_items")
    .insert({
      cart_id: cartId,
      product_id: item.product_id,
      product_unit_id: item.product_unit_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount ?? 0,
      tax: item.tax ?? 0,
      subtotal,
      total:
        subtotal -
        (item.discount ?? 0) +
        (item.tax ?? 0),
    });

  await syncCartTotals(cartId);
}

/* -------------------------------------------------------------------------- */
/* Update Quantity                                                            */
/* -------------------------------------------------------------------------- */

export async function updateItemQuantity(
  itemId: string,
  quantity: number
): Promise<void> {
  const { data } = await supabase
    .from("cart_items")
    .select("*")
    .eq("id", itemId)
    .single();

  if (!data) return;

  const subtotal = quantity * data.unit_price;

  await supabase
    .from("cart_items")
    .update({
      quantity,
      subtotal,
      total:
        subtotal -
        (data.discount ?? 0) +
        (data.tax ?? 0),
    })
    .eq("id", itemId);

  await syncCartTotals(data.cart_id);
}

/* -------------------------------------------------------------------------- */
/* Remove Item                                                                */
/* -------------------------------------------------------------------------- */

export async function removeItem(
  itemId: string
): Promise<void> {
  const { data } = await supabase
    .from("cart_items")
    .select("cart_id")
    .eq("id", itemId)
    .single();

  await supabase
    .from("cart_items")
    .delete()
    .eq("id", itemId);

  if (data?.cart_id) {
    await syncCartTotals(data.cart_id);
  }
}

/* -------------------------------------------------------------------------- */
/* Empty Cart                                                                 */
/* -------------------------------------------------------------------------- */

export async function clearCart(
  cartId: string
): Promise<void> {
  await supabase
    .from("cart_items")
    .delete()
    .eq("cart_id", cartId);

  await syncCartTotals(cartId);
}

/* -------------------------------------------------------------------------- */
/* Hold Cart                                                                  */
/* -------------------------------------------------------------------------- */

export async function holdCart(
  cartId: string,
  notes?: string
): Promise<void> {
  await supabase
    .from("carts")
    .update({
      status: "HELD",
      notes,
    })
    .eq("id", cartId);
}

/* -------------------------------------------------------------------------- */
/* Resume Cart                                                                */
/* -------------------------------------------------------------------------- */

export async function resumeCart(
  cartId: string
): Promise<void> {
  await supabase
    .from("carts")
    .update({
      status: "ACTIVE",
    })
    .eq("id", cartId);
}

/* -------------------------------------------------------------------------- */
/* Complete Cart                                                              */
/* -------------------------------------------------------------------------- */

export async function completeCart(
  cartId: string
): Promise<void> {
  await supabase
    .from("carts")
    .update({
      status: "CHECKED_OUT",
    })
    .eq("id", cartId);
}

/* -------------------------------------------------------------------------- */
/* Cancel Cart                                                                */
/* -------------------------------------------------------------------------- */

export async function cancelCart(
  cartId: string
): Promise<void> {
  await supabase
    .from("carts")
    .update({
      status: "CANCELLED",
    })
    .eq("id", cartId);
}

export async function saveHeldCart(
  cartData: Partial<Cart> & { payment_method?: string },
  items: CartItem[] = []
): Promise<Cart> {
  const cartNumber = await generateCartNumber();
  const { data, error } = await supabase
    .from("carts")
    .insert({
      cart_number: cartNumber,
      customer_id: cartData.customer_id,
      status: "HELD",
      notes: cartData.notes,
      subtotal: cartData.subtotal ?? 0,
      discount_amount: cartData.discount_amount ?? 0,
      tax_amount: cartData.tax_amount ?? 0,
      total_amount: cartData.total_amount ?? 0,
    })
    .select()
    .single();

  if (error) throw error;

  if (items.length > 0 && data?.id) {
    const payload = items.map((item) => ({
      cart_id: data.id,
      product_id: item.product_id,
      product_unit_id: item.product_unit_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount ?? 0,
      tax: item.tax ?? 0,
      subtotal: item.subtotal ?? item.quantity * item.unit_price,
      total: item.total ?? item.quantity * item.unit_price,
    }));
    await supabase.from("cart_items").insert(payload);
  }

  return data as Cart;
}

export async function deleteHeldCart(cartId: string): Promise<void> {
  await supabase.from("cart_items").delete().eq("cart_id", cartId);
  await supabase.from("carts").delete().eq("id", cartId);
}

/* -------------------------------------------------------------------------- */
/* Calculate Totals                                                           */
/* -------------------------------------------------------------------------- */

export function calculateTotals(items: CartItem[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.subtotal ?? 0),
    0
  );

  const discount = items.reduce(
    (sum, item) => sum + (item.discount ?? 0),
    0
  );

  const tax = items.reduce(
    (sum, item) => sum + (item.tax ?? 0),
    0
  );

  return {
    subtotal,
    discount_amount: discount,
    tax_amount: tax,
    total_amount: subtotal - discount + tax,
  };
}

/* -------------------------------------------------------------------------- */
/* Sync Cart Totals                                                           */
/* -------------------------------------------------------------------------- */

export async function syncCartTotals(
  cartId: string
): Promise<void> {
  const { data } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", cartId);

  const totals = calculateTotals(
    (data ?? []) as CartItem[]
  );

  await supabase
    .from("carts")
    .update({
      ...totals,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cartId);
}