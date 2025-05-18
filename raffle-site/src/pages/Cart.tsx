import { TrashIcon } from "@heroicons/react/24/outline";
import QuantityControl from "../components/QuantityControl";
import { CartItem } from "../components/CartItem";
import CheckoutForm, { CheckoutFormData } from "../components/CheckoutForm";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useEvent } from "../lib/context/EventContext";
import { Link } from "react-router-dom";

function Cart({
  cartItems,
  updateCartItemQuantity,
  removeFromCart,
}: {
  cartItems: CartItem[];
  updateCartItemQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
}) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedEvent } = useEvent();
  const totalTickets = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const hasAgeRestrictedItems = cartItems.some(
    (item) => item.is_over_21 && item.quantity > 0
  );
  const handleCheckout = async (formData: CheckoutFormData) => {
    if (!selectedEvent) return;

    setIsSubmitting(true);
    try {
      // Create order record
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            event_id: selectedEvent.id,
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
            total_amount: totalPrice,
            total_tickets: totalTickets,
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

      if (itemsError) {
        // Clean up the order if items insertion fails
        const { error: deleteError } = await supabase
          .from("orders")
          .delete()
          .eq("id", order.id);

        if (deleteError) {
          console.error("Error cleaning up failed order:", deleteError);
        }

        throw itemsError;
      }

      // Clear cart and show success message
      cartItems.forEach((item) => removeFromCart(item.id));
      setShowCheckout(false);
      alert("Order placed successfully! Thank you for your purchase.");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("There was an error placing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Your cart is empty</p>
          <Link
            to="/"
            className="mt-4 inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-4 bg-white rounded-lg shadow-sm"
              >
                <div className="flex items-start space-x-4">
                  {item.image_urls && item.image_urls.length > 0 && (
                    <img
                      src={item.image_urls[0]}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                  <div className="space-y-1">
                    <h3 className="font-medium text-lg">{item.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
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
                    <p className="text-gray-900 font-medium">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <QuantityControl
                    quantity={item.quantity}
                    onIncrement={() => updateCartItemQuantity(item.id, 1)}
                    onDecrement={() => updateCartItemQuantity(item.id, -1)}
                  />
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove item"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center text-lg font-semibold mb-4">
              <span>Total Tickets: {totalTickets}</span>
              <span>Total Price: ${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : "Proceed to Checkout"}
            </button>
          </div>
        </>
      )}

      {showCheckout && (
        <CheckoutForm
          totalTickets={totalTickets}
          totalPrice={totalPrice}
          onSubmit={handleCheckout}
          onCancel={() => setShowCheckout(false)}
          hasAgeRestrictedItems={hasAgeRestrictedItems}
        />
      )}
    </div>
  );
}

export default Cart;
