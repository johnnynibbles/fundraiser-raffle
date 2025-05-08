import { Link } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartNavProps {
  cartItems: CartItem[];
}

function CartNav({ cartItems }: CartNavProps) {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <Link
      to="/cart"
      className="flex items-center text-gray-100 hover:text-gray-300 group relative"
    >
      <ShoppingCartIcon className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="ml-2 bg-blue-500 text-white px-2 py-0.5 rounded-full text-sm">
          {totalItems} (${totalPrice.toFixed(2)})
        </span>
      )}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        View Cart
      </span>
    </Link>
  );
}

export default CartNav;
