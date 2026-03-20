import axios from 'axios';

const BASE_URL = 'http://173.249.5.203:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const riskApi = {
  evaluate: (data: any) => api.post('/api/v1/risk/evaluate', data),
  respondChallenge: (id: string, data: any) => api.post(`/api/v1/risk/challenge/${id}/respond`, data),
  getSession: (id: string) => api.get(`/api/v1/risk/sessions/${id}`),
  getSessions: () => api.get('/api/v1/risk/sessions'),
};

export const groupApi = {
  createGroup: (data: any) => api.post('/api/v1/groups', data),
  getGroups: () => api.get('/api/v1/groups'),
  getGroup: (id: string) => api.get(`/api/v1/groups/${id}`),
  addMember: (groupId: string, data: any) => api.post(`/api/v1/groups/${groupId}/members`, data),
  getMembers: (groupId: string) => api.get(`/api/v1/groups/${groupId}/members`),
  sendMessage: (groupId: string, data: any) => api.post(`/api/v1/groups/${groupId}/messages`, data),
  getMessages: (groupId: string) => api.get(`/api/v1/groups/${groupId}/messages`),
  runConsensus: (groupId: string, data: any) => api.post(`/api/v1/groups/${groupId}/consensus`, data),
  getConsensusHistory: (groupId: string) => api.get(`/api/v1/groups/${groupId}/consensus/history`),
};

export default api;
