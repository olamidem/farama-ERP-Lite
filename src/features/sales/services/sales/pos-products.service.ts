import { supabase } from "../../../../api/supabase";
import type { POSProduct } from "../../types/sale";

export async function getPOSProducts(): Promise<POSProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(
        id,
        name
      ),
      units:product_units(
        *,
        unit:units(*)
      )
    `)
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  return (data ?? []) as POSProduct[];
}

export async function getProductByBarcode(
  barcode: string
): Promise<POSProduct | null> {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(
        id,
        name
      ),
      units:product_units(
        *,
        unit:units(*)
      )
    `)
    .eq("barcode", barcode)
    .maybeSingle();

  if (error) throw error;

  return data as POSProduct | null;
}

export async function searchPOSProducts(
  keyword: string
): Promise<POSProduct[]> {
  if (!keyword.trim()) return [];

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(
        id,
        name
      ),
      units:product_units(
        *,
        unit:units(*)
      )
    `)
    .or(`name.ilike.%${keyword}%,barcode.ilike.%${keyword}%`)
    .eq("is_active", true)
    .limit(20);

  if (error) throw error;

  return (data ?? []) as POSProduct[];
}

export async function updateProductStock(
  productId: string,
  newStock: number
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({
      stock: newStock,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) throw error;
}