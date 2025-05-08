import { Link } from "react-router-dom";
import CartNav from "./CartNav";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Login from "./Login";
import "../App.css";
import { CartItem } from "./CartItem";

interface NavbarProps {
  cartItems: CartItem[];
}

function Navbar({ cartItems }: NavbarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <>
      <nav className="bg-gray-800 text-gray-100 p-4 fixed top-0 left-0 w-full shadow-md z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            <Link to="/" className="text-white hover:text-gray-300">
              Fundraising Raffle Site
            </Link>
          </h1>
          <ul className="flex items-center space-x-4">
            <li>
              <Link to="/" className="text-gray-100 hover:text-gray-300">
                Store
              </Link>
            </li>
            <li>
              <CartNav cartItems={cartItems} />
            </li>
            {!isLoggedIn ? (
              <>
                <li>
                  <Link
                    to="/join"
                    className="text-gray-100 hover:text-gray-300"
                  >
                    Join
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLoginClick}
                    className="text-gray-100 hover:text-gray-300"
                  >
                    Login
                  </button>
                </li>
              </>
            ) : (
              <>
                {isAdmin && (
                  <li>
                    <Link
                      to="/admin"
                      className="text-gray-100 hover:text-gray-300"
                    >
                      Admin
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={onLogout}
                    className="text-gray-100 hover:text-gray-300"
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </>
  );
}

export default Navbar;
