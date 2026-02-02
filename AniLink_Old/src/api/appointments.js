import api from './axios';

export const createAppointment = async (data) => {
  const response = await api.post('/appointments', data);
  return response.data;
};

export const getMyAppointments = async () => {
  const response = await api.get('/appointments');
  return response.data;
};

export const getOpenSlots = async (vetId, date) => {
  const response = await api.get('/availability/slots/open', {
    params: { vetId, date }
  });
  return response.data;
};

