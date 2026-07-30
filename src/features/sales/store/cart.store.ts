import { create } from "zustand";
import type { CartItem, Cart } from "../types/cart";
import type { PaymentMethod } from "../types/payment";
import type { POSProduct, POSProductUnit } from "../types/sale";
import { DEFAULT_TAX_RATE, WALK_IN_CUSTOMER_ID } from "../constants";

interface CartState {
  items: CartItem[];
  selectedCustomerId: string;
  discountVal: number;
  discountType: "percentage" | "fixed";
  taxRate: number;
  paymentMethod: PaymentMethod;
  remarks: string;
  heldCarts: Cart[];
  activeCartId: string | null;

  // Actions
  addItem: (product: POSProduct, unitId?: string, quantity?: number) => void;
  removeItem: (productId: string, unitId: string) => void;
  updateQuantity: (productId: string, unitId: string, deltaOrValue: number, isDirectSet?: boolean) => void;
  setSelectedCustomerId: (customerId: string) => void;
  setDiscount: (value: number, type?: "percentage" | "fixed") => void;
  setTaxRate: (rate: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setRemarks: (remarks: string) => void;
  clearCart: () => void;
  loadHeldCart: (cart: Cart) => void;
  setHeldCarts: (carts: Cart[]) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  selectedCustomerId: WALK_IN_CUSTOMER_ID,
  discountVal: 0,
  discountType: "percentage",
  taxRate: DEFAULT_TAX_RATE,
  paymentMethod: "CASH",
  remarks: "",
  heldCarts: [],
  activeCartId: null,

  addItem: (product: POSProduct, unitId?: string, quantityToAdd = 1) => {
    set((state) => {
      const availableUnits = product.units || [];
      const chosenUnit =
        availableUnits.find((u: POSProductUnit) => u.id === unitId) ||
        availableUnits.find((u: POSProductUnit) => u.is_default) ||
        availableUnits[0];

      const chosenUnitId = chosenUnit?.id || product.id;
      const unitName = chosenUnit?.unit?.symbol || chosenUnit?.unit?.name || "Unit";
      const unitPrice = Number(chosenUnit?.selling_price ?? product.selling_price ?? 0);
      const costPrice = Number(chosenUnit?.cost_price ?? product.cost_price ?? 0);
      const conversionFactor = Number(chosenUnit?.conversion_factor || 1);

      const existingIndex = state.items.findIndex(
        (i) => i.product_id === product.id && i.product_unit_id === chosenUnitId
      );

      let updatedItems: CartItem[];

      if (existingIndex > -1) {
        updatedItems = state.items.map((item, index) => {
          if (index === existingIndex) {
            return {
              ...item,
              quantity: item.quantity + quantityToAdd,
            };
          }
          return item;
        });
      } else {
        const newItem: CartItem = {
          product_id: product.id,
          product_unit_id: chosenUnitId,
          name: product.name,
          unit_name: unitName,
          quantity: quantityToAdd,
          unit_price: unitPrice,
          cost_price: costPrice,
          max_stock: product.stock || 0,
          conversion_factor: conversionFactor,
        };
        updatedItems = [...state.items, newItem];
      }

      return { items: updatedItems };
    });
  },

  removeItem: (productId: string, unitId: string) => {
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.product_id === productId && i.product_unit_id === unitId)
      ),
    }));
  },

  updateQuantity: (
    productId: string,
    unitId: string,
    deltaOrValue: number,
    isDirectSet = false
  ) => {
    set((state) => ({
      items: state.items
        .map((item) => {
          if (item.product_id === productId && item.product_unit_id === unitId) {
            const newQty = isDirectSet ? deltaOrValue : item.quantity + deltaOrValue;
            return {
              ...item,
              quantity: Math.max(0, newQty),
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    }));
  },

  setSelectedCustomerId: (customerId: string) => set({ selectedCustomerId: customerId }),
  setDiscount: (value: number, type = "percentage") =>
    set({ discountVal: Math.max(0, value), discountType: type }),
  setTaxRate: (rate: number) => set({ taxRate: Math.max(0, rate) }),
  setPaymentMethod: (method: PaymentMethod) => set({ paymentMethod: method }),
  setRemarks: (remarks: string) => set({ remarks }),

  clearCart: () =>
    set({
      items: [],
      discountVal: 0,
      paymentMethod: "CASH",
      remarks: "",
      activeCartId: null,
    }),

  loadHeldCart: (cart: Cart) => {
    set({
      activeCartId: cart.id || null,
      items: cart.items || [],
      selectedCustomerId: cart.customer_id || WALK_IN_CUSTOMER_ID,
      discountVal: cart.discount_amount || 0,
      discountType: "fixed",
      taxRate: cart.tax_amount ? (cart.tax_amount / (cart.subtotal || 1)) * 100 : DEFAULT_TAX_RATE,
      paymentMethod: (cart.payment_method as PaymentMethod) || "CASH",
      remarks: cart.notes || "",
    });
  },

  setHeldCarts: (carts: Cart[]) => set({ heldCarts: carts }),
}));
