import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Search, 
  Zap, 
  Clock, 
  Globe, 
  User, 
  CreditCard, 
  Activity,
  Users, 
  ArrowRight,
  FileText,
  Lock,
  Cpu,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  RiskAssessmentInput, 
  RiskDecisionResponse,
  SubjectType,
  ActionType,
  Currency,
  Channel
} from '../types';
import { riskApi } from '../services/api';

const PRESET_SCENARIOS: Record<string, RiskAssessmentInput> = {
  low_risk: {
    subject_id: 'USER_8821',
    subject_type: 'user',
    trust_score: 0.95,
    total_transactions: 1240,
    flagged_count: 0,
    action_type: 'payment',
    description: 'Monthly subscription for cloud services',
    amount: 49.99,
    currency: 'USD',
    geo_location: 'US-NY',
    channel: 'web',
    recent_transaction_count: 2,
    recent_transaction_amount: 150.00,
    trace_context: 'Regular recurring payment from known device.'
  },
  high_risk_sanction: {
    subject_id: 'AGENT_X_99',
    subject_type: 'agent',
    trust_score: 0.12,
    total_transactions: 5,
    flagged_count: 2,
    action_type: 'transfer',
    description: 'Bulk asset transfer to offshore entity',
    amount: 50000.00,
    currency: 'USD',
    geo_location: 'KP-PY',
    channel: 'api',
    recent_transaction_count: 12,
    recent_transaction_amount: 250000.00,
    trace_context: 'High velocity transfer from sanctioned region.'
  },
  aml_splitting: {
    subject_id: 'USER_4402',
    subject_type: 'user',
    trust_score: 0.45,
    total_transactions: 45,
    flagged_count: 0,
    action_type: 'withdrawal',
    description: 'Cash-out request',
    amount: 9500.00,
    currency: 'USD',
    geo_location: 'US-CA',
    channel: 'mobile',
    recent_transaction_count: 8,
    recent_transaction_amount: 76000.00,
    trace_context: 'Multiple withdrawals just below 10k threshold detected.'
  },
  challenge_flow: {
    subject_id: 'USER_7712',
    subject_type: 'user',
    trust_score: 0.78,
    total_transactions: 150,
    flagged_count: 0,
    action_type: 'credit_application',
    description: 'New credit line request',
    amount: 5000.00,
    currency: 'USD',
    geo_location: 'UK-LDN',
    channel: 'web',
    recent_transaction_count: 1,
    recent_transaction_amount: 0,
    trace_context: 'First time credit application from this region.'
  }
};

const RiskAssessment: React.FC = () => {
  const [formData, setFormData] = useState<RiskAssessmentInput>(PRESET_SCENARIOS.low_risk);
  const [isAssessing, setIsAssessing] = useState(false);
  const [apiResult, setApiResult] = useState<RiskDecisionResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [ttl, setTtl] = useState(0);
  const [showProofForm, setShowProofForm] = useState(false);
  const [challengeEvidence, setChallengeEvidence] = useState('');
  const [challengeEvidenceType, setChallengeEvidenceType] = useState('purpose_proof');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (ttl > 0) {
      timerRef.current = setInterval(() => {
        setTtl(prev => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ttl]);

  const handleQuickFill = (scenario: keyof typeof PRESET_SCENARIOS) => {
    setFormData(PRESET_SCENARIOS[scenario]);
    setResult(null);
    setShowProofForm(false);
  };

  const runAssessment = async () => {
    setIsAssessing(true);
    setErrorMsg('');
    setApiResult(null);
    setShowProofForm(false);
    try {
      const payload = {
        ...formData,
        priority: 'normal',
        debug_mode: false,
      };
      const { data } = await riskApi.evaluate(payload);
      setApiResult(data);
      setTtl(data.ttl || 0);
      if (data.decision === 'CHALLENGE' && data.challenge_id) {
        setShowProofForm(true);
      }
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.detail || e?.message || 'Risk evaluate failed');
    } finally {
      setIsAssessing(false);
    }
  };

  const submitChallengeResponse = async () => {
    if (!apiResult?.challenge_id || !challengeEvidence.trim()) return;
    setIsAssessing(true);
    setErrorMsg('');
    try {
      const { data } = await riskApi.respondChallenge(apiResult.challenge_id, {
        evidence_type: challengeEvidenceType,
        evidence_content: challengeEvidence,
        submitted_by: formData.subject_id,
      });
      setApiResult(data);
      setTtl(data.ttl || 0);
      setShowProofForm(false);
      setChallengeEvidence('');
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.detail || e?.message || 'Challenge response failed');
    } finally {
      setIsAssessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        
        {/* Left Side: Assessment Form */}
        <div className="lg:col-span-5 bg-brand-card border border-brand-border rounded-2xl p-6 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-accent/20 rounded-xl flex items-center justify-center">
              <Shield className="text-brand-accent w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">VAN Assessment</h2>
              <p className="text-sm text-slate-400">Verification Agent Network Input</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
            {/* Quick Fill Buttons */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleQuickFill('low_risk')} className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-lg hover:bg-green-500/20 transition-all">
                Low Risk Example
              </button>
              <button onClick={() => handleQuickFill('high_risk_sanction')} className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg hover:bg-red-500/20 transition-all">
                Sanctioned Region
              </button>
              <button onClick={() => handleQuickFill('aml_splitting')} className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs rounded-lg hover:bg-yellow-500/20 transition-all">
                AML Structuring
              </button>
              <button onClick={() => handleQuickFill('challenge_flow')} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs rounded-lg hover:bg-blue-500/20 transition-all">
                Challenge Flow
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500">Subject ID</label>
                <input 
                  type="text" 
                  value={formData.subject_id}
                  onChange={e => setFormData({...formData, subject_id: e.target.value})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500">Subject Type</label>
                <select 
                  value={formData.subject_type}
                  onChange={e => setFormData({...formData, subject_type: e.target.value as SubjectType})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50"
                >
                  <option value="user">User</option>
                  <option value="agent">Agent</option>
                  <option value="transaction">Transaction</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono uppercase text-slate-500">Trust Score</label>
                <span className="text-xs font-mono text-brand-accent">{(formData.trust_score * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01"
                value={formData.trust_score}
                onChange={e => setFormData({...formData, trust_score: parseFloat(e.target.value)})}
                className="w-full accent-brand-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500">Total Transactions</label>
                <input 
                  type="number" 
                  value={formData.total_transactions}
                  onChange={e => setFormData({...formData, total_transactions: parseInt(e.target.value)})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500">Flagged Count</label>
                <input 
                  type="number" 
                  value={formData.flagged_count}
                  onChange={e => setFormData({...formData, flagged_count: parseInt(e.target.value)})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500">Action Type</label>
                <select 
                  value={formData.action_type}
                  onChange={e => setFormData({...formData, action_type: e.target.value as ActionType})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50"
                >
                  <option value="payment">Payment</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="credit_application">Credit Application</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500">Channel</label>
                <select 
                  value={formData.channel}
                  onChange={e => setFormData({...formData, channel: e.target.value as Channel})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50"
                >
                  <option value="web">Web</option>
                  <option value="mobile">Mobile</option>
                  <option value="api">API</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500">Amount</label>
                <input 
                  type="number" 
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500">Currency</label>
                <select 
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value as Currency})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50"
                >
                  <option value="USD">USD</option>
                  <option value="CNY">CNY</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-500">Geo Location</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="e.g. US-NY, KP-PY"
                  value={formData.geo_location}
                  onChange={e => setFormData({...formData, geo_location: e.target.value})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500">Recent Tx Count (1h)</label>
                <input 
                  type="number" 
                  value={formData.recent_transaction_count}
                  onChange={e => setFormData({...formData, recent_transaction_count: parseInt(e.target.value)})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase text-slate-500">Recent Tx Amount (1h)</label>
                <input 
                  type="number" 
                  value={formData.recent_transaction_amount}
                  onChange={e => setFormData({...formData, recent_transaction_amount: parseFloat(e.target.value)})}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-500">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50 min-h-[80px] resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-500">Trace Context (Optional)</label>
              <textarea 
                value={formData.trace_context}
                onChange={e => setFormData({...formData, trace_context: e.target.value})}
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50 min-h-[60px] resize-none font-mono text-[10px]"
              />
            </div>
          </div>

          <button 
            onClick={runAssessment}
            disabled={isAssessing}
            className={cn(
              "w-full mt-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
              isAssessing 
                ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                : "bg-brand-accent text-black hover:scale-[1.02] active:scale-[0.98] shadow-brand-accent/20"
            )}
          >
            {isAssessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                ASSESSING RISK...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                SUBMIT ASSESSMENT
              </>
            )}
          </button>
        </div>

        {/* Right Side: Assessment Results */}
        <div className="lg:col-span-7 flex flex-col gap-6 overflow-hidden">
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {errorMsg}
              </motion.div>
            )}
            {apiResult ? (
              <motion.div 
                key={apiResult.decision_id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar"
              >
                {/* Decision Card */}
                <div className={cn(
                  "p-8 rounded-2xl border-2 flex items-center justify-between relative overflow-hidden",
                  apiResult.decision === 'APPROVE' ? "bg-green-500/10 border-green-500/30" :
                  apiResult.decision === 'REJECT' ? "bg-red-500/10 border-red-500/30" :
                  apiResult.decision === 'CHALLENGE' ? "bg-orange-500/10 border-orange-500/30" :
                  "bg-yellow-500/10 border-yellow-500/30"
                )}>
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    {apiResult.decision === 'APPROVE' && <CheckCircle2 className="w-32 h-32 text-green-500" />}
                    {apiResult.decision === 'REJECT' && <XCircle className="w-32 h-32 text-red-500" />}
                    {apiResult.decision === 'CHALLENGE' && <HelpCircle className="w-32 h-32 text-orange-500" />}
                    {apiResult.decision === 'REVIEW' && <AlertTriangle className="w-32 h-32 text-yellow-500" />}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-20 h-20 rounded-2xl flex items-center justify-center text-4xl",
                      apiResult.decision === 'APPROVE' ? "bg-green-500/20 text-green-500" :
                      apiResult.decision === 'REJECT' ? "bg-red-500/20 text-red-500" :
                      apiResult.decision === 'CHALLENGE' ? "bg-orange-500/20 text-orange-500" :
                      "bg-yellow-500/20 text-yellow-500"
                    )}>
                      {apiResult.decision === 'APPROVE' && <CheckCircle2 className="w-12 h-12" />}
                      {apiResult.decision === 'REJECT' && <XCircle className="w-12 h-12" />}
                      {apiResult.decision === 'CHALLENGE' && <HelpCircle className="w-12 h-12" />}
                      {apiResult.decision === 'REVIEW' && <AlertTriangle className="w-12 h-12" />}
                    </div>
                    <div>
                      <div className="text-4xl font-black tracking-tighter mb-1">
                        {apiResult.decision}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          apiResult.risk_level === 'low' ? "bg-green-500/20 text-green-400" :
                          apiResult.risk_level === 'medium' ? "bg-yellow-500/20 text-yellow-400" :
                          apiResult.risk_level === 'high' ? "bg-orange-500/20 text-orange-400" :
                          "bg-red-500/20 text-red-400"
                        )}>
                          {apiResult.risk_level} Risk
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{apiResult.decision_id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">Confidence Level</div>
                    <div className="text-3xl font-bold font-mono text-white mb-2">{Math.round(apiResult.confidence * 100)}%</div>
                    <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${apiResult.confidence * 100}%` }}
                        className={cn(
                          "h-full rounded-full",
                          apiResult.confidence > 0.9 ? "bg-brand-accent" : "bg-yellow-500"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Execution Time</div>
                      <div className="text-lg font-bold text-white">{apiResult.execution_time}ms</div>
                    </div>
                  </div>
                  <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Users className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Validators</div>
                      <div className="text-lg font-bold text-white">{apiResult.participating_validators?.length || 0}</div>
                    </div>
                  </div>
                  <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Decision TTL</div>
                      <div className="text-lg font-bold text-white font-mono">
                        {Math.floor(ttl / 60)}:{(ttl % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rationale */}
                <div className="bg-brand-card border border-brand-border rounded-xl p-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-3">Decision Rationale</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{apiResult.rationale}</p>
                </div>

                {/* Risk Indicators */}
                {apiResult.risk_indicators && apiResult.risk_indicators.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500">Risk Indicators</h3>
                    <div className="flex flex-wrap gap-2">
                      {apiResult.risk_indicators.map((ind, idx) => (
                        <span key={idx} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono rounded-full">
                          [{ind}]
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenge Section */}
                {apiResult.decision === 'CHALLENGE' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-6 bg-orange-500/5 border border-orange-500/20 rounded-2xl"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="text-orange-500 w-6 h-6" />
                      <h3 className="text-lg font-bold text-white">Verification Required</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-6">
                      {apiResult.challenge_instructions || 'The system requires additional proof materials to proceed with this transaction.'}
                    </p>
                    
                    {apiResult.required_evidence && apiResult.required_evidence.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {apiResult.required_evidence.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-brand-bg border border-brand-border rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-sm text-slate-200">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {!showProofForm ? (
                      <button 
                        onClick={() => setShowProofForm(true)}
                        className="w-full py-3 bg-orange-500 text-black font-bold rounded-xl hover:bg-orange-400 transition-all flex items-center justify-center gap-2"
                      >
                        SUBMIT PROOF MATERIALS
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-4 border-t border-orange-500/20"
                      >
                        <div className="space-y-3">
                          <label className="text-[10px] font-mono uppercase text-slate-500">Evidence Type</label>
                          <select 
                            value={challengeEvidenceType}
                            onChange={e => setChallengeEvidenceType(e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50"
                          >
                            <option value="purpose_proof">Purpose Proof</option>
                            <option value="identity_verification">Identity Verification</option>
                            <option value="source_of_funds">Source of Funds</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-mono uppercase text-slate-500">Evidence Content</label>
                          <textarea 
                            value={challengeEvidence}
                            onChange={e => setChallengeEvidence(e.target.value)}
                            placeholder="Provide evidence details or upload description..."
                            className="w-full bg-brand-bg border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50 min-h-[100px] resize-none"
                          />
                        </div>
                        <button 
                          onClick={submitChallengeResponse}
                          disabled={isAssessing || !challengeEvidence.trim()}
                          className="w-full py-3 bg-brand-accent text-black font-bold rounded-xl hover:bg-brand-accent/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAssessing ? 'PROCESSING...' : 'SUBMIT EVIDENCE'}
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-brand-border rounded-2xl bg-brand-card/30 text-slate-600">
                <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-6">
                  <Activity className="w-10 h-10 opacity-20" />
                </div>
                <h3 className="text-xl font-bold opacity-50 mb-2">Awaiting Assessment</h3>
                <p className="text-sm opacity-40 max-w-xs text-center">
                  Fill out the verification form on the left and submit to trigger the VAN parallel analysis.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default RiskAssessment;
