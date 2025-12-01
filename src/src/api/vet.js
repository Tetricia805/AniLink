import api from './axios';

export const getMyVetProfile = async () => {
  const response = await api.get('/vets/me');
  return response.data;
};

export const upsertVetProfile = async (data) => {
  const response = await api.post('/vets', data);
  return response.data;
};

export const listVets = async (params = {}) => {
  const response = await api.get('/vets', { params });
  return response.data;
};

