import { Link } from "react-router-dom";
import { useEvent } from "../lib/context/useEvent";
import CartNav from "../store/components/CartNav";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Login from "./Login";
import "../App.css";
import { CartItem } from "../store/types/cartItem";

interface NavbarProps {
  cartItems: CartItem[];
}

function Navbar({ cartItems }: NavbarProps) {
  const { selectedEvent } = useEvent();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    checkAdminStatus();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
      checkAdminStatus();
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

  const checkAdminStatus = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return;
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profileError) throw profileError;

    setIsAdmin(profile?.role === "admin");
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 fixed top-0 left-0 w-full shadow-md z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            <Link
              to="/"
              className="text-white hover:text-pink-100 cursor-pointer"
            >
              {selectedEvent ? selectedEvent.name : "Raffle Fundraising"}
            </Link>
          </h1>
          <ul className="flex items-center space-x-4">
            <li>
              <Link
                to="/"
                className="text-white hover:text-pink-100 cursor-pointer"
              >
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
                    className="text-white hover:text-pink-100 cursor-pointer"
                  >
                    Join
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLoginClick}
                    className="text-white hover:text-pink-100 cursor-pointer"
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
                      className="text-white hover:text-pink-100 cursor-pointer"
                    >
                      Admin
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={onLogout}
                    className="text-white hover:text-pink-100 cursor-pointer"
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
