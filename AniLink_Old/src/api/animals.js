import api from './axios';

export const createAnimal = async (data) => {
  const response = await api.post('/animals', data);
  return response.data;
};

export const getAnimals = async (params = {}) => {
  const response = await api.get('/animals', { params });
  return response.data;
};

export const getAnimalById = async (id) => {
  const response = await api.get(`/animals/${id}`);
  return response.data;
};

export const updateAnimal = async (id, data) => {
  const response = await api.put(`/animals/${id}`, data);
  return response.data;
};

export const deleteAnimal = async (id) => {
  const response = await api.delete(`/animals/${id}`);
  return response.data;
};

