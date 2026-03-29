import { useState, useEffect } from 'react';
import { useCart } from '@store/CartContext';
import { productService } from '@services/api';
import { ShoppingCart, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    productService.getAll().then(res => setProducts(res.data));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Premium Tech Essentials
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          Curated selection of the best gadgets for your workspace.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow group"
          >
            <div className="aspect-w-4 aspect-h-3 overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">{product.description}</p>
              <p className="mt-1 text-xs font-semibold text-indigo-500">Stock left: {product.stock}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-2xl font-bold text-indigo-600">${product.price}</span>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className={`p-2 rounded-full transition-colors ${
                    product.stock > 0 
                      ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
