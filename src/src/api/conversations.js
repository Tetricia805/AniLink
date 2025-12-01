import api from './axios';

export const createConversation = async (data) => {
  const response = await api.post('/conversations', data);
  return response.data;
};

export const getConversations = async () => {
  const response = await api.get('/conversations');
  return response.data;
};

export const getConversationMessages = async (conversationId) => {
  const response = await api.get(`/conversations/${conversationId}/messages`);
  return response.data;
};

export const sendMessage = async (conversationId, data) => {
  const response = await api.post(`/conversations/${conversationId}/messages`, data);
  return response.data;
};

export const markMessagesRead = async (conversationId) => {
  const response = await api.post(`/conversations/${conversationId}/messages/read`);
  return response.data;
};

