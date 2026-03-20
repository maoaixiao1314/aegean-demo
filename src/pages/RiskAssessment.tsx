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
  RiskAssessmentResult, 
  ValidatorResult,
  Decision, 
  RiskLevel, 
  Complexity,
  SubjectType,
  ActionType,
  Currency,
  Channel
} from '../types';

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
  const [result, setResult] = useState<RiskAssessmentResult | null>(null);
  const [ttl, setTtl] = useState(0);
  const [showProofForm, setShowProofForm] = useState(false);
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

  const runAssessment = () => {
    setIsAssessing(true);
    setResult(null);
    setShowProofForm(false);

    // Simulate VAN logic
    setTimeout(() => {
      const complexity: Complexity = formData.amount > 10000 || formData.geo_location.startsWith('KP') ? 'HARD' : 
                          formData.amount > 1000 ? 'MEDIUM' : 'SIMPLE';
      
      let decision: Decision = 'APPROVE';
      let riskLevel: RiskLevel = 'low';
      let indicators: string[] = [];
      let challengeMaterials: string[] | undefined;

      // Logic simulation
      if (formData.geo_location.startsWith('KP')) {
        decision = 'REJECT';
        riskLevel = 'critical';
        indicators.push('sanctioned_region_KP');
      } else if (formData.amount > 9000 && formData.recent_transaction_count > 5) {
        decision = 'REVIEW';
        riskLevel = 'high';
        indicators.push('aml_structuring_detected', 'high_velocity');
      } else if (formData.trust_score < 0.3) {
        decision = 'CHALLENGE';
        riskLevel = 'medium';
        indicators.push('low_trust_score');
        challengeMaterials = ['Government ID', 'Proof of Address', 'Selfie Verification'];
      } else if (formData.amount > 5000 && formData.total_transactions < 10) {
        decision = 'CHALLENGE';
        riskLevel = 'medium';
        indicators.push('new_account_high_value');
        challengeMaterials = ['Bank Statement', 'Source of Wealth Declaration'];
      }

      const validators: ValidatorResult[] = [
        {
          name: 'Amount Validator',
          risk: (formData.amount > 10000 ? 'high' : formData.amount > 1000 ? 'medium' : 'low') as RiskLevel,
          confidence: 94,
          reasoning: formData.amount > 10000 ? 'Transaction amount exceeds standard individual limits.' : 'Amount within normal operating parameters.',
          icon: '💰'
        },
        {
          name: 'Identity Validator',
          risk: (formData.trust_score < 0.2 ? 'critical' : formData.trust_score < 0.5 ? 'medium' : 'low') as RiskLevel,
          confidence: 88,
          reasoning: `Trust score of ${formData.trust_score} indicates ${formData.trust_score < 0.5 ? 'elevated' : 'minimal'} identity risk.`,
          icon: '🆔'
        },
        {
          name: 'Anomaly Validator',
          risk: (formData.geo_location.startsWith('KP') ? 'critical' : 'low') as RiskLevel,
          confidence: 99,
          reasoning: formData.geo_location.startsWith('KP') ? 'Geographic location matches OFAC sanctioned territory.' : 'Location verified as non-sanctioned.',
          icon: '🌐'
        }
      ];

      if (complexity !== 'SIMPLE') {
        validators.push({
          name: 'Compliance Validator',
          risk: (formData.recent_transaction_amount > 50000 ? 'high' : 'low') as RiskLevel,
          confidence: 92,
          reasoning: 'Velocity check against AML thresholds complete.',
          icon: '⚖️'
        });
      }

      if (complexity === 'HARD') {
        validators.push({
          name: 'Context Validator',
          risk: (formData.trace_context?.includes('bulk') ? 'high' : 'low') as RiskLevel,
          confidence: 85,
          reasoning: 'Deep analysis of transaction intent and trace context.',
          icon: '🧠'
        });
      }

      const newResult: RiskAssessmentResult = {
        id: `VAN-${Math.floor(Math.random() * 900000) + 100000}`,
        decision,
        riskLevel,
        confidence: Math.floor(Math.random() * 15) + 85,
        latency: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
        complexity,
        validators,
        indicators,
        ttl: 300,
        challengeMaterials
      };

      setResult(newResult);
      setTtl(newResult.ttl);
      setIsAssessing(false);
    }, 2000);
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
            {result ? (
              <motion.div 
                key={result.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar"
              >
                {/* Decision Card */}
                <div className={cn(
                  "p-8 rounded-2xl border-2 flex items-center justify-between relative overflow-hidden",
                  result.decision === 'APPROVE' ? "bg-green-500/10 border-green-500/30" :
                  result.decision === 'REJECT' ? "bg-red-500/10 border-red-500/30" :
                  result.decision === 'CHALLENGE' ? "bg-orange-500/10 border-orange-500/30" :
                  "bg-yellow-500/10 border-yellow-500/30"
                )}>
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    {result.decision === 'APPROVE' && <CheckCircle2 className="w-32 h-32 text-green-500" />}
                    {result.decision === 'REJECT' && <XCircle className="w-32 h-32 text-red-500" />}
                    {result.decision === 'CHALLENGE' && <HelpCircle className="w-32 h-32 text-orange-500" />}
                    {result.decision === 'REVIEW' && <AlertTriangle className="w-32 h-32 text-yellow-500" />}
                  </div>

                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-20 h-20 rounded-2xl flex items-center justify-center text-4xl",
                      result.decision === 'APPROVE' ? "bg-green-500/20 text-green-500" :
                      result.decision === 'REJECT' ? "bg-red-500/20 text-red-500" :
                      result.decision === 'CHALLENGE' ? "bg-orange-500/20 text-orange-500" :
                      "bg-yellow-500/20 text-yellow-500"
                    )}>
                      {result.decision === 'APPROVE' && <CheckCircle2 className="w-12 h-12" />}
                      {result.decision === 'REJECT' && <XCircle className="w-12 h-12" />}
                      {result.decision === 'CHALLENGE' && <HelpCircle className="w-12 h-12" />}
                      {result.decision === 'REVIEW' && <AlertTriangle className="w-12 h-12" />}
                    </div>
                    <div>
                      <div className="text-4xl font-black tracking-tighter mb-1">
                        {result.decision}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          result.riskLevel === 'low' ? "bg-green-500/20 text-green-400" :
                          result.riskLevel === 'medium' ? "bg-yellow-500/20 text-yellow-400" :
                          result.riskLevel === 'high' ? "bg-orange-500/20 text-orange-400" :
                          "bg-red-500/20 text-red-400"
                        )}>
                          {result.riskLevel} Risk
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{result.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">Confidence Level</div>
                    <div className="text-3xl font-bold font-mono text-white mb-2">{result.confidence}%</div>
                    <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        className={cn(
                          "h-full rounded-full",
                          result.confidence > 90 ? "bg-brand-accent" : "bg-yellow-500"
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
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Latency</div>
                      <div className="text-lg font-bold text-white">{result.latency}s</div>
                    </div>
                  </div>
                  <div className="bg-brand-card border border-brand-border rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Complexity</div>
                      <div className={cn(
                        "text-lg font-bold",
                        result.complexity === 'HARD' ? "text-red-400" : 
                        result.complexity === 'MEDIUM' ? "text-yellow-400" : "text-brand-accent"
                      )}>
                        {result.complexity}
                      </div>
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

                {/* Validator Committee */}
                <div className="space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    Validator Committee Voting
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.validators.map((v, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-brand-card border border-brand-border rounded-xl p-4 hover:border-brand-accent/30 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{v.icon}</span>
                            <span className="text-sm font-bold text-white">{v.name}</span>
                          </div>
                          <div className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                            v.risk === 'low' ? "bg-green-500/10 text-green-400" :
                            v.risk === 'medium' ? "bg-yellow-500/10 text-yellow-400" :
                            "bg-red-500/10 text-red-400"
                          )}>
                            {v.risk}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-slate-500 uppercase">Confidence</span>
                          <span className="text-[10px] font-mono text-brand-accent">{v.confidence}%</span>
                        </div>
                        <p className="text-xs text-slate-400 italic leading-relaxed">
                          "{v.reasoning}"
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Indicators */}
                {result.indicators.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500">Risk Indicators</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.indicators.map((ind, idx) => (
                        <span key={idx} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-mono rounded-full">
                          [{ind}]
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenge Section */}
                {result.decision === 'CHALLENGE' && (
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
                      The system requires additional proof materials to proceed with this high-value or unusual transaction.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {result.challengeMaterials?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-brand-bg border border-brand-border rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          <span className="text-sm text-slate-200">{item}</span>
                        </div>
                      ))}
                    </div>

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
                        <div className="p-8 border-2 border-dashed border-orange-500/20 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-orange-500/40 transition-all cursor-pointer">
                          <RefreshCw className="w-8 h-8 mb-2 opacity-50" />
                          <p className="text-sm">Drag and drop files or click to upload</p>
                          <p className="text-[10px] mt-1">PDF, JPG, PNG (Max 10MB)</p>
                        </div>
                        <button 
                          onClick={() => {
                            setIsAssessing(true);
                            setTimeout(() => {
                              setIsAssessing(false);
                              setResult({
                                ...result,
                                decision: 'APPROVE',
                                riskLevel: 'low',
                                indicators: ['challenge_resolved_verified']
                              });
                              setShowProofForm(false);
                            }, 1500);
                          }}
                          className="w-full py-3 bg-brand-accent text-black font-bold rounded-xl hover:bg-brand-accent/80 transition-all"
                        >
                          UPLOAD AND RE-EVALUATE
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
