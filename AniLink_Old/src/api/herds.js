import api from './axios';

export const createHerd = async (data) => {
  const response = await api.post('/herds', data);
  return response.data;
};

export const getHerds = async () => {
  const response = await api.get('/herds');
  return response.data;
};

export const getHerdById = async (id) => {
  const response = await api.get(`/herds/${id}`);
  return response.data;
};

export const updateHerd = async (id, data) => {
  const response = await api.put(`/herds/${id}`, data);
  return response.data;
};

export const deleteHerd = async (id) => {
  const response = await api.delete(`/herds/${id}`);
  return response.data;
};

