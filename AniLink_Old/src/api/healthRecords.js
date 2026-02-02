import api from './axios';

export const createHealthRecord = async (data) => {
  const response = await api.post('/health-records', data);
  return response.data;
};

export const getHealthRecords = async (params = {}) => {
  const response = await api.get('/health-records', { params });
  return response.data;
};

export const getHealthRecordById = async (id) => {
  const response = await api.get(`/health-records/${id}`);
  return response.data;
};

export const updateHealthRecord = async (id, data) => {
  const response = await api.put(`/health-records/${id}`, data);
  return response.data;
};

export const deleteHealthRecord = async (id) => {
  const response = await api.delete(`/health-records/${id}`);
  return response.data;
};

