import api from './axios';

export const updateProfile = async (data) => {
  const response = await api.put('/users/profile', data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.patch('/users/password', data);
  return response.data;
};

