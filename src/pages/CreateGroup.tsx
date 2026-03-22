import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Info,
  CheckCircle2,
  Cpu,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { agentService, groupService } from '../services/api';
import { Agent } from '../types';
import { cn } from '../lib/utils';

interface CreateGroupProps {
  onSuccess: (groupId: string) => void;
}

const CreateGroup: React.FC<CreateGroupProps> = ({ onSuccess }) => {
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'consensus' | 'collaboration' | 'hybrid'>('consensus');
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await agentService.getAgents();
        setAvailableAgents(data?.agents || []);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      }
    };
    fetchAgents();
  }, []);

  const toggleAgent = (agent: Agent) => {
    if (selectedAgents.find(a => a.agent_id === agent.agent_id)) {
      setSelectedAgents(selectedAgents.filter(a => a.agent_id !== agent.agent_id));
    } else {
      setSelectedAgents([...selectedAgents, agent]);
    }
  };

  const updateWeight = (agentId: string, weight: number) => {
    setSelectedAgents(selectedAgents.map(a => 
      a.agent_id === agentId ? { ...a, capability_weight: weight } : a
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName || selectedAgents.length === 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        group_name: groupName,
        description,
        mode,
        created_by: 'user_123', // Mock user
        initial_members: selectedAgents.map(a => ({
          agent_id: a.agent_id,
          role: a.role,
          capability_weight: a.capability_weight,
          specialization: a.specialization
        }))
      };
      
      const result = await groupService.createGroup(payload);
      onSuccess(result.group_id);
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center border border-brand-accent/20">
          <Users className="w-6 h-6 text-brand-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create New Orchestration Group</h2>
          <p className="text-slate-400 text-sm mt-1 font-mono uppercase tracking-wider">Define consensus parameters and agent roles</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Group Identity</label>
              <input 
                type="text" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g., Financial Risk Team"
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent/50 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the purpose of this group..."
                className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent/50 transition-all h-24 resize-none"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Orchestration Mode</label>
              <div className="grid grid-cols-3 gap-4">
                {(['consensus', 'collaboration', 'hybrid'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={cn(
                      "p-4 rounded-xl border transition-all text-left group",
                      mode === m 
                        ? "bg-brand-accent/10 border-brand-accent text-brand-accent" 
                        : "bg-brand-bg border-brand-border text-slate-400 hover:border-brand-accent/30"
                    )}
                  >
                    <div className="text-xs font-bold uppercase mb-1">{m}</div>
                    <div className="text-[9px] opacity-60 leading-tight">
                      {m === 'consensus' && "Weighted voting for final decision"}
                      {m === 'collaboration' && "Sequential task processing"}
                      {m === 'hybrid' && "Mixed consensus and collaboration"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Member Selection */}
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Agents</label>
              <span className="text-[10px] font-mono text-slate-500">{selectedAgents.length} SELECTED</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {availableAgents.map((agent) => {
                const isSelected = selectedAgents.find(a => a.agent_id === agent.agent_id);
                return (
                  <button
                    key={agent.agent_id}
                    type="button"
                    onClick={() => toggleAgent(agent)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                      isSelected 
                        ? "bg-brand-accent/5 border-brand-accent/30" 
                        : "bg-brand-bg border-brand-border hover:border-brand-accent/20"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded flex items-center justify-center",
                      isSelected ? "bg-brand-accent text-black" : "bg-brand-border text-slate-500"
                    )}>
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{agent.agent_id}</span>
                      <span className="text-[9px] text-slate-500 uppercase font-mono">{agent.role.replace('_', ' ')}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-accent ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Configuration & Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 flex flex-col h-full">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4 text-brand-accent" />
              Member Configuration
            </h3>

            <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {selectedAgents.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-40 text-slate-500 text-center"
                  >
                    <Info className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-xs">Select agents from the list to configure their weights and roles.</p>
                  </motion.div>
                ) : (
                  selectedAgents.map((agent) => (
                    <motion.div 
                      key={agent.agent_id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 rounded-lg bg-brand-bg border border-brand-border space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-white">{agent.agent_id}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded border border-brand-border text-slate-500 uppercase font-mono">{agent.role}</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => toggleAgent(agent)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {mode === 'consensus' && (
                        <div className="space-y-2">
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
                            onChange={(e) => updateWeight(agent.agent_id, parseFloat(e.target.value))}
                            className="w-full accent-brand-accent h-1 bg-brand-border rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <div className="mt-8 pt-6 border-t border-brand-border space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Weight</span>
                <span className="text-white font-mono">
                  {selectedAgents.reduce((acc, a) => acc + a.capability_weight, 0).toFixed(2)}
                </span>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting || !groupName || selectedAgents.length === 0}
                className="w-full bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    CREATE GROUP
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateGroup;
