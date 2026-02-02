import api from './axios';

export const listVets = async (params = {}) => {
  const response = await api.get('/vets', { params });
  return response.data;
};

export const getNearbyVets = async (params) => {
  const response = await api.get('/vets/nearby', { params });
  return response.data;
};

export const upsertVetProfile = async (payload) => {
  const response = await api.post('/vets', payload);
  return response.data;
};

