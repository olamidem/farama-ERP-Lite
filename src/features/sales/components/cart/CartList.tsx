import type { CartItem as CartItemType } from "../../types/cart";
import CartItem from "./CartItem";
import EmptyCart from "./EmptyCart";

interface CartListProps {
  items: CartItemType[];
  onUpdateQuantity: (productId: string, unitId: string, delta: number) => void;
  onRemoveItem: (productId: string, unitId: string) => void;
}

export const CartList = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartListProps) => {
  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1 no-scrollbar">
      {items.map((item) => (
        <CartItem
          key={`${item.product_id}-${item.product_unit_id}`}
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </div>
  );
};

export default CartList;
