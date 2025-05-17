import { TrashIcon } from "@heroicons/react/24/outline";
import QuantityControl from "../components/QuantityControl";
import { CartItem } from "../components/CartItem";

function Cart({
  cartItems,
  updateCartItemQuantity,
  removeFromCart,
}: {
  cartItems: CartItem[];
  updateCartItemQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
}) {
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <div className="space-y-6">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex gap-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100"
          >
            {/* Item Image */}
            <div className="w-32 h-32 flex-shrink-0">
              {item.image_urls && item.image_urls.length > 0 ? (
                <img
                  src={item.image_urls[0]}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                  No Image
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.name}
                </h3>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Remove item"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {item.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {item.item_value !== null && (
                  <span className="bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-xs">
                    Value: ${item.item_value}
                  </span>
                )}
                {item.is_over_21 && (
                  <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs">
                    21+ Only
                  </span>
                )}
                {item.is_local_pickup_only && (
                  <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded text-xs">
                    Local Pickup
                  </span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <QuantityControl
                    quantity={item.quantity}
                    onUpdate={(delta) => updateCartItemQuantity(item.id, delta)}
                  />
                  <span className="text-gray-600">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cartItems.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Items: {totalItems}</span>
            <span>Total Price: ${totalPrice.toFixed(2)}</span>
          </div>
          <button className="mt-4 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors font-medium text-lg shadow-sm hover:shadow-md">
            Proceed to Checkout
          </button>
        </div>
      )}

      {cartItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Your cart is empty</p>
        </div>
      )}
    </div>
  );
}

export default Cart;
