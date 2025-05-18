import { useState } from "react";
import { CartItem } from "../components/CartItem";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import CheckoutForm, { CheckoutFormData } from "../components/CheckoutForm";

interface CartProps {
  cartItems: CartItem[];
  updateCartItemQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
}

export default function Cart({
  cartItems,
  updateCartItemQuantity,
  removeFromCart,
}: CartProps) {
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const handleCheckout = async (formData: CheckoutFormData) => {
    setIsCheckingOut(true);
    setError(null);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            customer_name: `${formData.firstName} ${formData.lastName}`,
            customer_email: formData.email,
            customer_phone: formData.phone,
            customer_address: formData.address,
            customer_city: formData.city,
            customer_state: formData.state,
            customer_zip: formData.zipCode,
            customer_country: formData.country,
            is_international: formData.isInternational,
            age_confirmed: formData.ageConfirmed,
            total_amount: cartItems.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            ),
            total_tickets: cartItems.reduce(
              (sum, item) => sum + item.quantity,
              0
            ),
            status: "pending",
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        item_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      cartItems.forEach((item) => removeFromCart(item.id));

      // Redirect to confirmation page
      navigate(`/order-confirmation/${order.order_number}`);
    } catch (err) {
      console.error("Error during checkout:", err);
      setError("There was an error processing your order. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const hasAgeRestrictedItems = cartItems.some(
    (item) => item.is_over_21 && item.quantity > 0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-purple-900 mb-8">Your Cart</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-purple-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-purple-600 mb-8">
            Browse our items and add some to your cart to get started.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-purple-900 truncate">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-purple-600">
                          Item #{item.item_number}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartItemQuantity(item.id, -1)}
                            className="p-1 rounded-full text-purple-600 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          >
                            <span className="sr-only">Decrease quantity</span>
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <span className="text-lg font-medium text-purple-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItemQuantity(item.id, 1)}
                            className="p-1 rounded-full text-purple-600 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          >
                            <span className="sr-only">Increase quantity</span>
                            <svg
                              className="h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-medium text-purple-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-purple-600">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-4 p-1 rounded-full text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <span className="sr-only">Remove item</span>
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {showCheckoutForm && (
              <div className="mt-8 bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-purple-900 mb-6">
                    Checkout Information
                  </h3>
                  <CheckoutForm
                    onSubmit={handleCheckout}
                    onCancel={() => setShowCheckoutForm(false)}
                    isSubmitting={isCheckingOut}
                    hasAgeRestrictedItems={hasAgeRestrictedItems}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-purple-900">
                  Order Summary
                </h3>
                <div className="mt-6">
                  <div className="flex justify-between text-base font-medium text-purple-900">
                    <p>Total</p>
                    <p>${totalPrice.toFixed(2)}</p>
                  </div>
                  <p className="mt-1 text-sm text-purple-600">
                    The total is the recommended donation amount for the tickets.
                  </p>
                  <div className="mt-6">
                    {!showCheckoutForm ? (
                      <button
                        onClick={() => setShowCheckoutForm(true)}
                        className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Proceed to Checkout
                      </button>
                    ) : (
                      <p className="text-sm text-purple-600">
                        Please fill out the checkout form to complete your
                        order.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
