import axios from 'axios';
import { 
  Agent, 
  AgentGlobalStats, 
  Group, 
  GroupWeightsSummary, 
  ConsensusResult, 
  RiskEvaluationRequest, 
  RiskEvaluationResponse 
} from '../types';

const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const agentService = {
  getAgents: async (): Promise<{ agents: Agent[] }> => {
    try {
      const response = await api.get('/groups/agents');
      return {
        agents: Array.isArray(response.data?.agents) ? response.data.agents : []
      };
    } catch (error) {
      console.error('API Error: getAgents', error);
      return { agents: [] };
    }
  },
  getAgentGlobalStats: async (agentId: string): Promise<AgentGlobalStats> => {
    try {
      const response = await api.get(`/groups/agents/${agentId}/global-stats`);
      return response.data;
    } catch (error) {
      console.error(`API Error: getAgentGlobalStats for ${agentId}`, error);
      throw error;
    }
  },
};

export const groupService = {
  createGroup: async (data: any): Promise<Group> => {
    const response = await api.post('/groups', data);
    return response.data;
  },
  getWeightsSummary: async (groupId: string): Promise<GroupWeightsSummary> => {
    const response = await api.get(`/groups/${groupId}/weights-summary`);
    return response.data;
  },
  updateMemberWeight: async (groupId: string, agentId: string, weight: number): Promise<any> => {
    const response = await api.put(`/groups/${groupId}/members/${agentId}`, { capability_weight: weight });
    return response.data;
  },
  addMember: async (groupId: string, data: any): Promise<any> => {
    const response = await api.post(`/groups/${groupId}/members`, data);
    return response.data;
  },
  executeConsensus: async (groupId: string, data: any): Promise<ConsensusResult> => {
    const response = await api.post(`/groups/${groupId}/consensus`, data);
    return response.data;
  },
  getConsensusHistory: async (groupId: string, limit = 20): Promise<any[]> => {
    const response = await api.get(`/groups/${groupId}/consensus/history?limit=${limit}`);
    return response.data;
  },
};

export const riskService = {
  evaluate: async (data: RiskEvaluationRequest): Promise<RiskEvaluationResponse> => {
    const response = await api.post('/risk/evaluate', data);
    return response.data;
  },
  respondToChallenge: async (challengeId: string, data: any): Promise<RiskEvaluationResponse> => {
    const response = await api.post(`/risk/challenge/${challengeId}/respond`, data);
    return response.data;
  },
};

export default api;
