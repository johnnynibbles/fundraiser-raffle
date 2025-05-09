import { TrashIcon } from "@heroicons/react/24/outline";
import QuantityControl from "../components/QuantityControl";

function Cart({
  cartItems,
  updateCartItemQuantity,
  removeFromCart,
}: {
  cartItems: { id: number; name: string; price: number; quantity: number }[];
  updateCartItemQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
}) {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      <ul className="space-y-4">
        {cartItems.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between border-b border-gray-100 pb-2"
          >
            <div>
              <span className="font-semibold">{item.name}</span> - ${item.price}
            </div>
            <div className="flex items-center gap-4">
              <QuantityControl
                quantity={item.quantity}
                onUpdate={(delta) => updateCartItemQuantity(item.id, delta)}
              />
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Remove item"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {cartItems.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Items: {totalItems}</span>
            <span>Total Price: ${totalPrice.toFixed(2)}</span>
          </div>
        </div>
      )}
      <button
        disabled={cartItems.length === 0}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Proceed to Checkout
      </button>
    </div>
  );
}

export default Cart;
