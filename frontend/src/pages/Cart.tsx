import { useCart } from '@store/CartContext';
import { useAuth } from '@store/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { orderService } from '@services/api';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Cart() {
  const { items, removeFromCart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // ✅ Local stock check
    for (const item of items) {
      if (item.quantity > item.stock) {
        alert(`Not enough stock for ${item.name}`);
        return;
      }
    }

    try {
      await orderService.checkout({
        userId: user.id,
        userEmail: user.email,

        // 🔥 FINAL FIX HERE
        items: items.map(item => ({
          productId: Number(item.id),   // ✅ IMPORTANT FIX
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),

        total
      });

      clearCart();
      navigate('/dashboard');

    } catch (err: any) {
      console.error('Checkout failed', err);
      alert(err.response?.data?.message || 'Checkout failed');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="text-gray-400" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="mt-2 text-gray-500">Looks like you haven't added anything yet.</p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
        >
          <span>Start Shopping</span>
          <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <div key={item.id} className="p-6 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                <p className="text-gray-500">
                  Qty: {item.quantity} × ${item.price}
                </p>
              </div>

              <div className="flex items-center space-x-6">
                <span className="text-xl font-bold text-gray-900">
                  ${item.price * item.quantity}
                </span>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-8">
          <div className="flex justify-between items-center mb-6">
            <span className="text-lg text-gray-600">Total Amount</span>
            <span className="text-3xl font-bold text-indigo-600">
              ${total}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}