import React, { useState, useEffect } from 'react';
import { productService, orderService } from '@services/api';

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  const fetchData = async () => {
    try {
      const [prodRes, ordRes] = await Promise.all([
        productService.getAll(),
        orderService.getAll()
      ]);

      setProducts(prodRes.data || []);
      setOrders(ordRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 5000); // auto refresh
    return () => clearInterval(interval);
  }, []);

  const updateStock = async (product: any) => {
    try {
      await fetch(`http://34.111.226.236/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });

      fetchData();
    } catch (err) {
      alert("Update failed");
    }
  };

  const deleteProduct = async (id: string) => {
    await productService.delete(id);
    fetchData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab('products')} className="bg-blue-500 text-white px-4 py-2 rounded">
          Products
        </button>
        <button onClick={() => setActiveTab('orders')} className="bg-gray-500 text-white px-4 py-2 rounded">
          Orders
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="grid gap-4">

          {products.map(p => (
            <div key={p.id} className="bg-white shadow p-4 rounded flex justify-between items-center">

              <div>
                <h2 className="font-bold">{p.name}</h2>
                <p className="text-sm text-gray-500">${p.price}</p>
              </div>

              <div className="flex items-center gap-2">

                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => {
                    const updated = { ...p, stock: p.stock - 1 };
                    setProducts(products.map(x => x.id === p.id ? updated : x));
                    updateStock(updated);
                  }}
                >
                  -
                </button>

                <span className="font-bold">{p.stock}</span>

                <button
                  className="bg-green-500 text-white px-3 py-1 rounded"
                  onClick={() => {
                    const updated = { ...p, stock: p.stock + 1 };
                    setProducts(products.map(x => x.id === p.id ? updated : x));
                    updateStock(updated);
                  }}
                >
                  +
                </button>

                <button
                  className="bg-black text-white px-3 py-1 rounded"
                  onClick={() => deleteProduct(p.id)}
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white p-4 rounded shadow">

          {orders.map(o => (
            <div key={o.id} className="border-b py-2 text-sm">
              {o.id} — {o.userEmail} — ${o.total} — {o.status}
            </div>
          ))}

        </div>
      )}

    </div>
  );
}