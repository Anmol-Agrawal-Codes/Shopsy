import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHeart, FiMenu, FiShoppingCart, FiX } from "react-icons/fi";
import { useAuth } from "../../context/authContext";
import { useCart } from "../../context/cartContext";

const AppHeader = () => {
  const { isAuthenticated, profile, role, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Shop" },
    ...(isAuthenticated
      ? [
          { to: "/wishlist", label: "Wishlist" },
          { to: "/orders", label: "My Orders" },
        ]
      : []),
    ...(role === "admin" ? [{ to: "/admin/dashboard", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          CommerceKit
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <>
              <Link to="/wishlist" className="relative text-gray-700 hover:text-primary dark:text-gray-200">
                <FiHeart size={20} />
              </Link>
              <Link to="/cart" className="relative text-gray-700 hover:text-primary dark:text-gray-200">
                <FiShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="hidden rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:border-primary md:inline-block dark:border-gray-600"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/auth"
              className="hidden rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-white hover:bg-secondary md:inline-block"
            >
              Login
            </Link>
          )}

          {/* Mobile toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="border-t border-gray-200 bg-white px-4 pb-4 pt-2 dark:border-gray-700 dark:bg-gray-900 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-200"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="mt-2 text-sm font-medium text-red-500">
              Logout ({profile?.email})
            </button>
          ) : (
            <Link to="/auth" onClick={() => setMenuOpen(false)} className="mt-2 block text-sm font-semibold text-primary">
              Login
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default AppHeader;
