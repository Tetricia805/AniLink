import api from './axios';

export const symptomCheck = async (data) => {
  const response = await api.post('/ai/symptom-checker', data);
  return response.data;
};

export const fmdRiskCheck = async (data) => {
  const response = await api.post('/ai/fmd-risk', data);
  return response.data;
};

