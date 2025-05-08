import { TrashIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

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
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => updateCartItemQuantity(item.id, -1)}
                  className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-200"
                  disabled={item.quantity === 0}
                >
                  <MinusIcon className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center font-medium py-1 bg-white">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateCartItemQuantity(item.id, 1)}
                  className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 border-l border-gray-200"
                >
                  <PlusIcon className="h-3.5 w-3.5" />
                </button>
              </div>
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
