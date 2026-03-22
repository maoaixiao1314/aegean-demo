import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Search, 
  ArrowRight,
  Info,
  FileText,
  Upload,
  ChevronRight,
  Activity,
  Target,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { riskService } from '../services/api';
import { RiskEvaluationRequest, RiskEvaluationResponse, Decision, RiskLevel } from '../types';
import { cn } from '../lib/utils';

const RiskAssessment: React.FC = () => {
  const [input, setInput] = useState<RiskEvaluationRequest>({
    subject_id: 'SUB-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    subject_type: 'user',
    trust_score: 0.85,
    total_transactions: 120,
    flagged_count: 0,
    jurisdiction: 'US',
    action_type: 'payment',
    description: '',
    amount: 0,
    currency: 'USD',
    counterparty_id: 'CP-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
    geo_location: 'New York, US',
    channel: 'web',
    trace_context: 'TX-' + Date.now(),
    recent_transaction_count: 5,
    recent_transaction_amount: 1200,
    priority: 'high',
    debug_mode: true
  });

  const [response, setResponse] = useState<RiskEvaluationResponse | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isChallenging, setIsChallenging] = useState(false);
  const [evidence, setEvidence] = useState('');
  const [challengeResponse, setChallengeResponse] = useState<RiskEvaluationResponse | null>(null);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEvaluating(true);
    try {
      const data = await riskService.evaluate(input);
      setResponse(data);
    } catch (error) {
      console.error('Risk evaluation failed:', error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleChallenge = async () => {
    if (!response?.challenge_id || !evidence) return;
    setIsChallenging(true);
    try {
      const data = await riskService.respondToChallenge(response.challenge_id, {
        evidence,
        timestamp: new Date().toISOString()
      });
      setChallengeResponse(data);
    } catch (error) {
      console.error('Challenge response failed:', error);
    } finally {
      setIsChallenging(false);
    }
  };

  const reset = () => {
    setResponse(null);
    setChallengeResponse(null);
    setEvidence('');
    setInput({
      ...input,
      subject_id: 'SUB-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      trace_context: 'TX-' + Date.now()
    });
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'low': return 'text-brand-accent';
      case 'medium': return 'text-blue-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-500';
      default: return 'text-slate-400';
    }
  };

  const getDecisionIcon = (decision: Decision) => {
    switch (decision) {
      case 'approve': return <CheckCircle2 className="w-8 h-8 text-brand-accent" />;
      case 'challenge': return <AlertTriangle className="w-8 h-8 text-orange-400" />;
      case 'reject': return <XCircle className="w-8 h-8 text-red-500" />;
      default: return <Activity className="w-8 h-8 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center border border-brand-accent/20">
            <Shield className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Risk Assessment Engine</h2>
            <p className="text-slate-400 text-sm mt-1 font-mono uppercase tracking-wider">Real-time multi-agent validation network</p>
          </div>
        </div>
        
        {response && (
          <button 
            onClick={reset}
            className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-2"
          >
            <Activity className="w-3 h-3" />
            NEW EVALUATION
          </button>
        )}
      </div>

      {!response ? (
        <form onSubmit={handleEvaluate} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-8 space-y-6">
            <div className="glass-panel p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject ID</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                    <input 
                      type="text" 
                      value={input.subject_id}
                      onChange={(e) => setInput({ ...input, subject_id: e.target.value })}
                      className="w-full bg-brand-bg border border-brand-border rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-accent/50 transition-all font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Action Type</label>
                  <select 
                    value={input.action_type}
                    onChange={(e) => setInput({ ...input, action_type: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent/50 transition-all"
                  >
                    <option value="payment">Payment</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="transfer">Transfer</option>
                    <option value="credit_application">Credit Application</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</label>
                  <input 
                    type="number" 
                    value={input.amount}
                    onChange={(e) => setInput({ ...input, amount: parseFloat(e.target.value) })}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent/50 transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Currency</label>
                  <select 
                    value={input.currency}
                    onChange={(e) => setInput({ ...input, currency: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent/50 transition-all"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="CNY">CNY</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jurisdiction</label>
                  <input 
                    type="text" 
                    value={input.jurisdiction}
                    onChange={(e) => setInput({ ...input, jurisdiction: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                <textarea 
                  value={input.description}
                  onChange={(e) => setInput({ ...input, description: e.target.value })}
                  placeholder="Provide context for the evaluation..."
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent/50 transition-all h-24 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Context Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 space-y-6">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3 text-brand-accent" />
                Subject Context
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Trust Score</span>
                  <span className="text-xs font-bold text-brand-accent">{(input.trust_score * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1 bg-brand-border rounded-full overflow-hidden">
                  <div className="h-full bg-brand-accent" style={{ width: `${input.trust_score * 100}%` }} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase font-mono">Total Trans</span>
                    <span className="text-sm font-bold text-white">{input.total_transactions}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase font-mono">Flagged</span>
                    <span className="text-sm font-bold text-red-500">{input.flagged_count}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-brand-border">
                <button 
                  type="submit"
                  disabled={isEvaluating}
                  className="w-full bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,255,136,0.2)]"
                >
                  {isEvaluating ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      EXECUTE EVALUATION
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 flex gap-3">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-400 leading-relaxed">
                Evaluation will be processed by the VAN Agent Network. Multiple specialized agents will validate the request against global risk patterns.
              </p>
            </div>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Results Panel */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel overflow-hidden"
            >
              <div className={cn(
                "p-8 flex items-center justify-between border-b border-brand-border",
                response.decision === 'approve' ? "bg-brand-accent/5" : 
                response.decision === 'challenge' ? "bg-orange-400/5" : "bg-red-500/5"
              )}>
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center border",
                    response.decision === 'approve' ? "bg-brand-accent/10 border-brand-accent/20" : 
                    response.decision === 'challenge' ? "bg-orange-400/10 border-orange-400/20" : "bg-red-500/10 border-red-500/20"
                  )}>
                    {getDecisionIcon(response.decision)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{response.decision}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={cn("text-xs font-bold uppercase", getRiskColor(response.risk_level))}>
                        {response.risk_level} RISK
                      </span>
                      <span className="text-xs text-slate-500 font-mono">CONFIDENCE: {(response.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-mono uppercase">Decision ID</div>
                  <div className="text-sm font-bold text-white font-mono">{response.decision_id.slice(0, 12)}</div>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rationale</h4>
                  <p className="text-slate-300 leading-relaxed">{response.rationale}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Indicators</h4>
                    <div className="space-y-2">
                      {response.risk_indicators.map((indicator, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-brand-bg border border-brand-border">
                          <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                          <span className="text-xs text-slate-300">{indicator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Participating Validators</h4>
                    <div className="flex flex-wrap gap-2">
                      {response.participating_validators?.map((v, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-brand-card border border-brand-border text-[10px] font-mono text-slate-400">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Challenge Response Section */}
            {response.decision === 'challenge' && !challengeResponse && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-8 space-y-6 border-orange-400/30"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-orange-400" />
                  <h3 className="text-lg font-bold text-white">Challenge Evidence Submission</h3>
                </div>
                
                <div className="p-4 rounded-lg bg-orange-400/5 border border-orange-400/20 space-y-2">
                  <p className="text-xs text-orange-400 font-bold uppercase tracking-wider">Instructions</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{response.challenge_instructions}</p>
                  <div className="pt-2 flex flex-wrap gap-2">
                    {response.required_evidence?.map((e, i) => (
                      <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-orange-400/10 text-orange-400 border border-orange-400/20 font-mono">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Evidence / Response</label>
                  <textarea 
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    placeholder="Provide the required evidence or explanation..."
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-400/50 transition-all h-32 resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 bg-brand-bg border border-brand-border text-white font-bold py-3 rounded-lg hover:bg-white/5 transition-all flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    UPLOAD DOCUMENTS
                  </button>
                  <button 
                    onClick={handleChallenge}
                    disabled={isChallenging || !evidence}
                    className="flex-1 bg-orange-400 hover:bg-orange-400/90 disabled:opacity-50 text-black font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isChallenging ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        SUBMIT EVIDENCE
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Challenge Result */}
            {challengeResponse && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-8 border-brand-accent/30 bg-brand-accent/5"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-brand-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase">Challenge Resolved</h3>
                    <p className="text-xs text-slate-500">New Decision: <span className="text-brand-accent font-bold uppercase">{challengeResponse.decision}</span></p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic">"{challengeResponse.rationale}"</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar Stats */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 space-y-8">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-3 h-3 text-brand-accent" />
                Network Performance
              </h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-400">Execution Time</span>
                  </div>
                  <span className="text-xs font-bold text-white">{response.execution_time}ms</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-400">Confidence</span>
                  </div>
                  <span className="text-xs font-bold text-brand-accent">{(response.confidence * 100).toFixed(1)}%</span>
                </div>

                <div className="pt-6 border-t border-brand-border">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Validators</span>
                  </div>
                  <div className="space-y-3">
                    {['Credit_Agent', 'Fraud_Agent', 'Compliance_Agent'].map((agent) => (
                      <div key={agent} className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">{agent}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-accent/10 text-brand-accent border border-brand-accent/20 font-mono">ACTIVE</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAssessment;
