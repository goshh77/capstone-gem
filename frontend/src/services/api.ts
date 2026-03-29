import axios from 'axios';

const api = axios.create({
  baseURL: 'http://34.111.226.236/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  signup: (credentials: any) => api.post('/auth/signup', credentials),
  verifyOtp: (data: any) => api.post('/auth/verify-otp', data),
};

export const productService = {
  getAll: () => api.get('/products'),
  create: (data: any) => api.post('/products', data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const orderService = {
  getAll: () => api.get('/orders'),
  getByUser: (userId: string) => api.get(`/orders/user/${userId}`),
  checkout: (data: any) => api.post('/orders/checkout', data),
};

export default api;
