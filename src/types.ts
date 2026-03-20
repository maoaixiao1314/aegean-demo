export type SubjectType = 'user' | 'agent' | 'transaction';
export type ActionType = 'payment' | 'withdrawal' | 'credit_application' | 'transfer';
export type Currency = 'USD' | 'CNY' | 'EUR';
export type Channel = 'web' | 'mobile' | 'api';

export interface RiskAssessmentInput {
  subject_id: string;
  subject_type: SubjectType;
  trust_score: number;
  total_transactions: number;
  flagged_count: number;
  jurisdiction?: string;
  registered_at?: string;
  action_type: ActionType;
  description: string;
  amount?: number;
  currency?: Currency;
  counterparty_id?: string;
  geo_location?: string;
  ip_address?: string;
  device_id?: string;
  channel?: Channel;
  trace_context?: string;
  recent_transaction_count: number;
  recent_transaction_amount: number;
  session_id?: string;
  priority?: string;
  debug_mode?: boolean;
  metadata?: Record<string, any>;
}

export interface RiskDecisionResponse {
  decision_id: string;
  request_id: string;
  session_id: string;
  decision: string; // APPROVE/REJECT/CHALLENGE/REVIEW
  risk_level: string; // low/medium/high/critical
  confidence: number;
  ttl: number;
  rationale: string;
  risk_indicators: string[];
  challenge_eligible: boolean;
  difficulty_level: string;
  participating_validators: string[];
  execution_time: number;
  timestamp: string;
  challenge_id?: string;
  challenge_instructions?: string;
  required_evidence?: string[];
}

export interface RiskSessionSummary {
  session_id: string;
  subject_id: string;
  status: string;
  created_at: string;
  expires_at: string;
  challenge_count: number;
  decision_count: number;
  current_decision_id?: string;
  decisions: Array<{
    decision_id: string;
    decision: string;
    risk_level: string;
    confidence: number;
    timestamp: string;
  }>;
}
