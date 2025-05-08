import { Link } from "react-router-dom";
import CartNav from "./CartNav";
import "../App.css"; // Import the CSS file for styling

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface NavbarProps {
  cartItems: CartItem[];
}

function Navbar({ cartItems }: NavbarProps) {
  const isLoggedIn = false; // Replace with actual authentication logic
  const isAdmin = false; // Replace with actual admin check logic
  const onLogout = () => {}; // Replace with actual logout logic
  const handleLoginClick = () => {}; // Replace with actual login logic

  return (
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
                <Link to="/join" className="text-gray-100 hover:text-gray-300">
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
  );
}

export default Navbar;
