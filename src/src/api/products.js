import api from './axios';

export const createProduct = async (data) => {
  const response = await api.post('/products', data);
  return response.data;
};

export const getProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const updateProduct = async (id, data) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};

export const toggleProductStatus = async (id) => {
  const response = await api.patch(`/products/${id}/toggle`);
  return response.data;
};

