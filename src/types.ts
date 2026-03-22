export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type Decision = 'approve' | 'challenge' | 'reject';

export interface Agent {
  agent_id: string;
  role: string;
  capability_weight: number;
  specialization: Record<string, number>;
}

export interface AgentGlobalStats {
  agent_id: string;
  global_accuracy: number;
  total_evaluations: number;
  correct_count: number;
  group_breakdown: {
    group_id: string;
    accuracy: number;
    evaluations: number;
    correct_count: number;
  }[];
  last_updated: string;
}

export interface Group {
  group_id: string;
  group_name: string;
  description: string;
  mode: 'consensus' | 'collaboration' | 'hybrid';
  created_by: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface GroupWeightsSummary {
  group_id: string;
  group_name: string;
  mode: string;
  agent_count: number;
  agents: {
    agent_id: string;
    role: string;
    capability_weight: number;
    historical_accuracy: number;
    total_evaluations: number;
    correct_count: number;
    is_active: boolean;
    note: string;
  }[];
}

export interface ConsensusResult {
  consensus_id: string;
  group_id: string;
  mode: string;
  success: boolean;
  final_solution: {
    agent_id: string;
    answer: string;
    reasoning: string;
    confidence: number;
  };
  agent_responses: {
    agent_id: string;
    answer: string;
    confidence: number;
    reasoning: string;
  }[];
  discussion_rounds: {
    round_number: number;
    consensus_status: string;
    candidate_answer: string;
    candidate_confidence: number;
    stability_counter: number;
    agent_responses: Record<string, {
      answer: string;
      confidence: number;
      reasoning: string;
    }>;
  }[];
  consensus_path: string[];
  agent_graph: {
    nodes: { id: string; label: string }[];
    edges: {
      source: string;
      target: string;
      influence_weight: number;
      trust_score: number;
      agreement_count: number;
      disagreement_count: number;
    }[];
    key_agents: [string, number][];
  };
  knowledge_graph: {
    graph_id: string;
    source_type: string;
    nodes: {
      id: string;
      label: string;
      type: string;
      attributes: Record<string, any>;
    }[];
    links: {
      source: string;
      target: string;
      type: string;
      properties: Record<string, any>;
    }[];
  };
  weighted_votes: Record<string, number>;
  total_weight: number;
  rounds_used: number;
  participating_agents: string[];
  execution_time: number;
  consensus_reached: boolean;
  timestamp: string;
}

export interface RiskEvaluationRequest {
  subject_id: string;
  subject_type: string;
  trust_score: number;
  total_transactions: number;
  flagged_count: number;
  jurisdiction: string;
  action_type: string;
  description: string;
  amount: number;
  currency: string;
  counterparty_id: string;
  geo_location: string;
  channel: string;
  trace_context: string;
  recent_transaction_count: number;
  recent_transaction_amount: number;
  priority: string;
  debug_mode: boolean;
}

export interface RiskEvaluationResponse {
  decision_id: string;
  request_id: string;
  session_id: string;
  decision: Decision;
  risk_level: RiskLevel;
  confidence: number;
  ttl: number;
  rationale: string;
  risk_indicators: string[];
  challenge_eligible: boolean;
  challenge_id?: string;
  challenge_instructions?: string;
  required_evidence?: string[];
  difficulty_level?: string;
  participating_validators?: string[];
  execution_time: number;
  timestamp: string;
}
