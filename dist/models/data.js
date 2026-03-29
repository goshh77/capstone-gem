"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otps = exports.orders = exports.products = exports.users = void 0;
exports.users = [
    { id: '1', email: 'admin@orderstream.com', password: 'admin', role: 'admin', isVerified: true },
    { id: '2', email: 'user@orderstream.com', password: 'user', role: 'user', isVerified: true }
];
exports.products = [
    { id: '1', name: 'Premium Wireless Headphones', description: 'High-quality sound with noise cancellation.', price: 299, image: 'https://picsum.photos/seed/headphones/400/300', stock: 10 },
    { id: '2', name: 'Smart Watch Series 5', description: 'Track your fitness and stay connected.', price: 199, image: 'https://picsum.photos/seed/watch/400/300', stock: 10 },
    { id: '3', name: 'Mechanical Keyboard', description: 'RGB backlit with tactile switches.', price: 129, image: 'https://picsum.photos/seed/keyboard/400/300', stock: 10 },
    { id: '4', name: 'Ultra-wide Monitor', description: '34-inch curved display for productivity.', price: 499, image: 'https://picsum.photos/seed/monitor/400/300', stock: 10 },
];
exports.orders = [];
exports.otps = {};
