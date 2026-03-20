export type SubjectType = 'user' | 'agent' | 'transaction';
export type ActionType = 'payment' | 'withdrawal' | 'credit_application' | 'transfer';
export type Currency = 'USD' | 'CNY' | 'EUR';
export type Channel = 'web' | 'mobile' | 'api';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type Decision = 'APPROVE' | 'REJECT' | 'CHALLENGE' | 'REVIEW';
export type Complexity = 'SIMPLE' | 'MEDIUM' | 'HARD';

export interface RiskAssessmentInput {
  subject_id: string;
  subject_type: SubjectType;
  trust_score: number;
  total_transactions: number;
  flagged_count: number;
  action_type: ActionType;
  description: string;
  amount: number;
  currency: Currency;
  geo_location: string;
  channel: Channel;
  recent_transaction_count: number;
  recent_transaction_amount: number;
  trace_context?: string;
}

export interface ValidatorResult {
  name: string;
  risk: RiskLevel;
  confidence: number;
  reasoning: string;
  icon?: string;
}

export interface RiskAssessmentResult {
  id: string;
  decision: Decision;
  riskLevel: RiskLevel;
  confidence: number;
  latency: number;
  complexity: Complexity;
  validators: ValidatorResult[];
  indicators: string[];
  ttl: number;
  challengeMaterials?: string[];
}
