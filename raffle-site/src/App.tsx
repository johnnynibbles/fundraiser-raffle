import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
import Join from "./pages/Join";
import Navbar from "./components/Navbar"; // Import the Navbar component
import { CartItem } from "./components/CartItem";
import { useState } from "react";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import Events from "./pages/admin/Events";
import Orders from "./pages/admin/Orders";
import AdminRaffleItems from "./pages/admin/RaffleItems";
import { EventProvider } from "./lib/context/EventContext";

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        // Increment the quantity if the item already exists in the cart
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      // Add the item to the cart with a quantity of 1 if it doesn't exist
      return [...prev, { ...item, quantity: 1 }];
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

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="events" element={<Events />} />
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
