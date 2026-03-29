import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@store/AuthContext';
import { useCart } from '@store/CartContext';
import { ShoppingCart, LogOut, User, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-bold text-indigo-600">OrderStream</Link>

          <div className="flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium">Products</Link>

            {user ? (
              <>
                <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600">
                  <ShoppingCart size={24} />
                  {items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </Link>

                {user.role === 'admin' ? (
                  <Link to="/admin" className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
                    <ShieldCheck size={20} />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                ) : (
                  <Link to="/dashboard" className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600">
                    <User size={20} />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-600"
                >
                  <LogOut size={20} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium">Login</Link>
                <Link
                  to="/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
