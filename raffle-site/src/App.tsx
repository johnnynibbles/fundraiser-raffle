import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
import Join from "./pages/Join";
import Navbar from "./components/Navbar"; // Import the Navbar component
import { useState } from "react";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import Events from "./pages/admin/Events";
import Orders from "./pages/admin/Orders";
import AdminRaffleItems from "./pages/admin/RaffleItems";
import { EventProvider } from "./lib/context/EventContext";
import OrderConfirmation from "./pages/OrderConfirmation";
import EventSettings from "./pages/admin/EventSettings";
import { CartItem, RaffleItem } from "./types/store";

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: RaffleItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (cartItem) => cartItem.id === parseInt(item.id)
      );
      if (existingItem) {
        // Increment the quantity if the item already exists in the cart
        return prev.map((cartItem) =>
          cartItem.id === parseInt(item.id)
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      // Add the item to the cart with a quantity of 1 if it doesn't exist
      const cartItem: CartItem = {
        id: parseInt(item.id),
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: 1,
        image_urls: item.image_urls,
        item_value: item.item_value,
        is_over_21: item.is_over_21,
        is_local_pickup_only: item.is_local_pickup_only,
        item_number: item.id, // Using id as item_number since it's not in RaffleItem
      };
      return [...prev, cartItem];
    });
  };

  const updateCartItemQuantity = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + delta } : item
      )
    );
  };

  const removeFromCart = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Router>
      <EventProvider>
        <Navbar cartItems={cartItems} />
        <div className="container mx-auto mt-20">
          <Routes>
            <Route path="/" element={<Store addToCart={addToCart} />} />
            <Route
              path="/cart"
              element={
                <Cart
                  cartItems={cartItems}
                  updateCartItemQuantity={updateCartItemQuantity}
                  removeFromCart={removeFromCart}
                />
              }
            />
            <Route path="/join" element={<Join />} />
            <Route
              path="/order-confirmation/:orderNumber"
              element={<OrderConfirmation />}
            />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="events" element={<Events />} />
              <Route path="event-settings" element={<EventSettings />} />
              <Route path="items" element={<AdminRaffleItems />} />
              <Route path="orders" element={<Orders />} />
              <Route path="users" element={<div>Users Management</div>} />
            </Route>
          </Routes>
        </div>
      </EventProvider>
    </Router>
  );
}

export default App;
