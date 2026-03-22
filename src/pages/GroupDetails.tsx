import React, { useState, useEffect } from 'react';
import { 
  Users, 
  History, 
  Settings, 
  Play, 
  Plus, 
  Save, 
  Trash2, 
  ChevronRight,
  Target,
  Activity,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { groupService, agentService } from '../services/api';
import { GroupWeightsSummary, Agent } from '../types';
import { cn } from '../lib/utils';

interface GroupDetailsProps {
  groupId: string;
  onExecuteConsensus: (groupId: string) => void;
}

const GroupDetails: React.FC<GroupDetailsProps> = ({ groupId, onExecuteConsensus }) => {
  const [summary, setSummary] = useState<GroupWeightsSummary | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState<{ agent_id: string; role: string; weight: number }>({
    agent_id: '',
    role: '',
    weight: 0.5
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, historyData, agentsData] = await Promise.all([
          groupService.getWeightsSummary(groupId),
          groupService.getConsensusHistory(groupId),
          agentService.getAgents()
        ]);
        setSummary(summaryData);
        setHistory(historyData);
        setAvailableAgents(agentsData.agents);
      } catch (error) {
        console.error('Failed to fetch group details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId]);

  const handleWeightChange = (agentId: string, weight: number) => {
    if (!summary) return;
    setSummary({
      ...summary,
      agents: summary.agents.map(a => 
        a.agent_id === agentId ? { ...a, capability_weight: weight } : a
      )
    });
  };

  const saveWeights = async () => {
    if (!summary) return;
    setIsSaving(true);
    try {
      const promises = summary.agents.map(a => 
        groupService.updateMemberWeight(groupId, a.agent_id, a.capability_weight)
      );
      await Promise.all(promises);
      // Refresh summary
      const updatedSummary = await groupService.getWeightsSummary(groupId);
      setSummary(updatedSummary);
    } catch (error) {
      console.error('Failed to save weights:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addMember = async () => {
    if (!newMember.agent_id || !newMember.role) return;
    try {
      await groupService.addMember(groupId, {
        agent_id: newMember.agent_id,
        role: newMember.role,
        capability_weight: newMember.weight
      });
      // Refresh
      const updatedSummary = await groupService.getWeightsSummary(groupId);
      setSummary(updatedSummary);
      setShowAddMember(false);
      setNewMember({ agent_id: '', role: '', weight: 0.5 });
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center border border-brand-accent/20">
            <Users className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{summary.group_name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded bg-brand-accent/10 text-brand-accent border border-brand-accent/20 font-mono uppercase">
                {summary.mode} MODE
              </span>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                {summary.agent_count} AGENTS ACTIVE
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => onExecuteConsensus(groupId)}
            className="bg-brand-accent hover:bg-brand-accent/90 text-black font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,255,136,0.2)]"
          >
            <Play className="w-4 h-4 fill-current" />
            EXECUTE CONSENSUS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Weight Management */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Settings className="w-4 h-4 text-brand-accent" />
                Weight Management
              </h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowAddMember(true)}
                  className="text-[10px] font-bold text-brand-accent hover:text-brand-accent/80 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  ADD AGENT
                </button>
                <button 
                  onClick={saveWeights}
                  disabled={isSaving}
                  className="text-[10px] font-bold text-white hover:text-brand-accent flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {isSaving ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3 h-3" />}
                  SAVE CHANGES
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {summary.agents.map((agent) => (
                <div key={agent.agent_id} className="p-4 rounded-lg bg-brand-bg border border-brand-border group hover:border-brand-accent/30 transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-card border border-brand-border flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-brand-accent" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{agent.agent_id}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-mono">{agent.role}</span>
                      </div>
                    </div>

                    <div className="md:col-span-4 space-y-2">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-slate-500">CAPABILITY WEIGHT</span>
                        <span className="text-brand-accent">{agent.capability_weight.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01"
                        value={agent.capability_weight}
                        onChange={(e) => handleWeightChange(agent.agent_id, parseFloat(e.target.value))}
                        className="w-full accent-brand-accent h-1 bg-brand-border rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="md:col-span-4 grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-slate-500 uppercase font-mono">Accuracy</span>
                        <span className="text-xs font-bold text-white">{(agent.historical_accuracy * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-slate-500 uppercase font-mono">Evaluations</span>
                        <span className="text-xs font-bold text-white">{agent.total_evaluations}</span>
                      </div>
                    </div>
                  </div>
                  {agent.note && (
                    <div className="mt-4 pt-4 border-t border-brand-border/50 flex items-start gap-2">
                      <Info className="w-3 h-3 text-blue-400 mt-0.5" />
                      <p className="text-[10px] text-slate-500 italic">{agent.note}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Consensus History */}
          <div className="glass-panel p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-8">
              <History className="w-4 h-4 text-brand-accent" />
              Consensus History
            </h3>
            
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="text-sm">No consensus history found for this group.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.consensus_id} className="flex items-center justify-between p-4 rounded-lg bg-brand-bg border border-brand-border hover:bg-white/[0.02] transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.success ? "bg-brand-accent" : "bg-red-500"
                      )} />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white">ID: {item.consensus_id.slice(0, 8)}...</span>
                        <span className="text-[10px] text-slate-500 font-mono">{new Date(item.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-slate-500 uppercase font-mono">Confidence</span>
                        <span className="text-xs font-bold text-white">{(item.final_solution.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-slate-500 uppercase font-mono">Rounds</span>
                        <span className="text-xs font-bold text-white">{item.rounds_used}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-brand-accent transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Summary & Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 space-y-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-accent" />
              Group Analytics
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-brand-bg border border-brand-border flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-mono mb-1">Avg Accuracy</span>
                <span className="text-xl font-bold text-brand-accent">
                  {(summary.agents.reduce((acc, a) => acc + a.historical_accuracy, 0) / summary.agents.length * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-4 rounded-xl bg-brand-bg border border-brand-border flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-mono mb-1">Total Evals</span>
                <span className="text-xl font-bold text-white">
                  {summary.agents.reduce((acc, a) => acc + a.total_evaluations, 0)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Voting Weight Distribution</h4>
              <div className="space-y-3">
                {summary.agents.map((agent) => {
                  const totalWeight = summary.agents.reduce((acc, a) => acc + a.capability_weight, 0);
                  const percentage = (agent.capability_weight / totalWeight) * 100;
                  return (
                    <div key={agent.agent_id} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-slate-400">{agent.agent_id}</span>
                        <span className="text-white">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1 bg-brand-border rounded-full overflow-hidden">
                        <div className="h-full bg-brand-accent" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 flex gap-3">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-400 leading-relaxed">
                Voting weights are calculated based on capability weight and historical accuracy. Higher weights give agents more influence during the consensus process.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddMember(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-panel p-8 space-y-6"
            >
              <h3 className="text-xl font-bold text-white">Add Agent to Group</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Agent</label>
                  <select 
                    value={newMember.agent_id}
                    onChange={(e) => setNewMember({ ...newMember, agent_id: e.target.value })}
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent/50"
                  >
                    <option value="">Choose an agent...</option>
                    {availableAgents
                      .filter(a => !summary.agents.find(m => m.agent_id === a.agent_id))
                      .map(a => (
                        <option key={a.agent_id} value={a.agent_id}>{a.agent_id} ({a.role})</option>
                      ))
                    }
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role in Group</label>
                  <input 
                    type="text" 
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    placeholder="e.g., Primary Validator"
                    className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent/50"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-500">INITIAL WEIGHT</span>
                    <span className="text-brand-accent">{newMember.weight.toFixed(2)}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={newMember.weight}
                    onChange={(e) => setNewMember({ ...newMember, weight: parseFloat(e.target.value) })}
                    className="w-full accent-brand-accent h-1 bg-brand-border rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 px-4 py-3 rounded-lg border border-brand-border text-slate-400 hover:text-white transition-all"
                >
                  CANCEL
                </button>
                <button 
                  onClick={addMember}
                  disabled={!newMember.agent_id || !newMember.role}
                  className="flex-1 bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-black font-bold py-3 rounded-lg transition-all"
                >
                  ADD MEMBER
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupDetails;
