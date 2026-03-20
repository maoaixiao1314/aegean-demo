import axios from 'axios';

const BASE_URL = import.meta.env.VITE_AEGEAN_API_BASE_URL || 'http://173.249.5.203:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

export const systemApi = {
  health: () => api.get('/health'),
  root: () => api.get('/'),
};

export const riskApi = {
  evaluate: (data: any) => api.post('/api/v1/risk/evaluate', data),
  respondChallenge: (challengeId: string, data: any) =>
    api.post(`/api/v1/risk/challenge/${challengeId}/respond`, data),
  getSession: (sessionId: string) => api.get(`/api/v1/risk/sessions/${sessionId}`),
  getSessions: (params?: { subject_id?: string; status?: string; limit?: number }) =>
    api.get('/api/v1/risk/sessions', { params }),
};

export const groupApi = {
  getAvailableAgents: () => api.get('/api/v1/groups/agents'),
  createGroup: (data: any) => api.post('/api/v1/groups/', data),
  getGroups: () => api.get('/api/v1/groups/'),
  getGroup: (id: string) => api.get(`/api/v1/groups/${id}`),
  deleteGroup: (id: string) => api.delete(`/api/v1/groups/${id}`),
  addMember: (groupId: string, data: any) => api.post(`/api/v1/groups/${groupId}/members`, data),
  getMembers: (groupId: string, activeOnly?: boolean) =>
    api.get(`/api/v1/groups/${groupId}/members`, { params: { active_only: !!activeOnly } }),
  sendMessage: (groupId: string, data: any) => api.post(`/api/v1/groups/${groupId}/messages`, data),
  getMessages: (groupId: string, limit?: number) =>
    api.get(`/api/v1/groups/${groupId}/messages`, { params: { limit } }),
  runConsensus: (groupId: string, data: any) => api.post(`/api/v1/groups/${groupId}/consensus`, data),
};

export default api;
