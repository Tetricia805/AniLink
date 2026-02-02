import api from './axios';

export const createOrder = async (data) => {
  const response = await api.post('/orders', data);
  return response.data;
};

export const getOrders = async (params = {}) => {
  const response = await api.get('/orders', { params });
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id, data) => {
  const response = await api.patch(`/orders/${id}/status`, data);
  return response.data;
};

export const markOrderPaid = async (id, comment) => {
  const response = await api.post(`/orders/${id}/payments/mark-paid`, { comment });
  return response.data;
};

