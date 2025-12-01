import api from './axios';

export const getAdminOverview = async () => {
  const response = await api.get('/admin/overview');
  return response.data;
};

export const getRecentActivity = async () => {
  const response = await api.get('/admin/recent-activity');
  return response.data;
};

export const exportOrdersCSV = async (params = {}) => {
  const response = await api.get('/admin/exports/orders', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

export const exportAppointmentsCSV = async (params = {}) => {
  const response = await api.get('/admin/exports/appointments', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

