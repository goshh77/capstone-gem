import { useState, useEffect } from 'react';
import { useAuth } from '@store/AuthContext';
import { orderService } from '@services/api';
import { Package, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ Handle user + fetch orders safely
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    orderService.getByUser(user.id)
      .then(res => setOrders(res.data || []))
      .catch(err => console.error(err));

  }, [user]);

  // ✅ Prevent crash on first load
  if (!user) {
    return <div className="text-center mt-20 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500">Welcome back, {user.email}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Package className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div>
                  <span className="text-sm text-gray-500">Order ID</span>
                  <p className="font-mono font-bold text-gray-900">{order.id}</p>
                </div>

                <div className="text-right">
                  <span className="text-sm text-gray-500">Date</span>
                  <p className="font-medium text-gray-900">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">

                  {/* ✅ FIXED: safe items handling */}
                  {Array.isArray(order.items) && order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="text-gray-600">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium text-gray-900">
                        ${item.price * item.quantity}
                      </span>
                    </div>
                  ))}

                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-bold">
                    <CheckCircle size={16} />
                    <span>{order.status?.toUpperCase() || 'PLACED'}</span>
                  </div>

                  <div className="text-2xl font-bold text-indigo-600">
                    Total: ${order.total || 0}
                  </div>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}