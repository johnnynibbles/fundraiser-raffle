import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
import Join from "./pages/Join";
import Navbar from "./components/Navbar"; // Import the Navbar component
import { useState } from "react";
import { EventProvider } from "./lib/context/EventContext";
import OrderConfirmation from "./pages/OrderConfirmation";
import { CartItem, RaffleItem } from "./types/store";
import { adminRoutes } from "./admin/routes";

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: RaffleItem) => {
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
      const cartItem: CartItem = {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: 1,
        image_urls: item.image_urls,
        item_value: item.item_value,
        is_over_21: item.is_over_21,
        is_local_pickup_only: item.is_local_pickup_only,
        item_number: item.item_number,
      };
      return [...prev, cartItem];
    });
  };

  const updateCartItemQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + delta } : item
      )
    );
  };

  const removeFromCart = (id: string) => {
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
            {adminRoutes}
          </Routes>
        </div>
      </EventProvider>
    </Router>
  );
}

export default App;
