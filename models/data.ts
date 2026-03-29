export interface User {
  id: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped';
  createdAt: string;
}

export const users: User[] = [
  { id: '1', email: 'admin@orderstream.com', password: 'admin', role: 'admin', isVerified: true },
  { id: '2', email: 'user@orderstream.com', password: 'user', role: 'user', isVerified: true }
];

export const products: Product[] = [
  { id: '1', name: 'Premium Wireless Headphones', description: 'High-quality sound with noise cancellation.', price: 299, image: 'https://picsum.photos/seed/headphones/400/300', stock: 10 },
  { id: '2', name: 'Smart Watch Series 5', description: 'Track your fitness and stay connected.', price: 199, image: 'https://picsum.photos/seed/watch/400/300', stock: 10 },
  { id: '3', name: 'Mechanical Keyboard', description: 'RGB backlit with tactile switches.', price: 129, image: 'https://picsum.photos/seed/keyboard/400/300', stock: 10 },
  { id: '4', name: 'Ultra-wide Monitor', description: '34-inch curved display for productivity.', price: 499, image: 'https://picsum.photos/seed/monitor/400/300', stock: 10 },
];

export const orders: Order[] = [];

export const otps: Record<string, string> = {};
