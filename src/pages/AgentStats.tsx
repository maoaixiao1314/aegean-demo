import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  ChevronDown, 
  ChevronUp, 
  BarChart3, 
  Target, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { agentService } from '../services/api';
import { Agent, AgentGlobalStats } from '../types';
import { cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const AgentStats: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [globalStats, setGlobalStats] = useState<Record<string, AgentGlobalStats>>({});
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const data = await agentService.getAgents();
        const agentsList = data?.agents || [];
        setAgents(agentsList);
        
        // Fetch global stats for each agent
        const statsPromises = agentsList.map(agent => 
          agentService.getAgentGlobalStats(agent.agent_id)
        );
        const statsResults = await Promise.all(statsPromises);
        const statsMap: Record<string, AgentGlobalStats> = {};
        statsResults.forEach(stat => {
          statsMap[stat.agent_id] = stat;
        });
        setGlobalStats(statsMap);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  const toggleExpand = (agentId: string) => {
    setExpandedAgentId(expandedAgentId === agentId ? null : agentId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Agent Global Performance</h2>
          <p className="text-slate-400 text-sm mt-1 font-mono uppercase tracking-wider">Across all orchestration groups</p>
        </div>
        <div className="flex gap-4">
          <div className="glass-panel px-4 py-2 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
            <span className="text-xs font-mono text-slate-300">SYSTEM SYNCED</span>
          </div>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-border text-[10px] text-slate-500 uppercase font-mono">
                <th className="px-6 py-4 font-medium">Agent ID</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium text-center">Weight</th>
                <th className="px-6 py-4 font-medium text-center">Global Accuracy</th>
                <th className="px-6 py-4 font-medium text-center">Evaluations</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50">
              {agents.map((agent) => {
                const stats = globalStats[agent.agent_id];
                const isExpanded = expandedAgentId === agent.agent_id;
                
                return (
                  <React.Fragment key={agent.agent_id}>
                    <tr className={cn(
                      "group hover:bg-white/[0.02] transition-colors",
                      isExpanded && "bg-brand-accent/5"
                    )}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center group-hover:border-brand-accent/50 transition-colors">
                            <Cpu className="w-4 h-4 text-brand-accent" />
                          </div>
                          <span className="text-sm font-bold text-white">{agent.agent_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-slate-400 uppercase">{agent.role.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-mono text-white">{agent.capability_weight.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-bold text-white">{( (stats?.global_accuracy || 0) * 100).toFixed(1)}%</span>
                          <div className="w-20 h-1 bg-brand-border rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-brand-accent" 
                              style={{ width: `${(stats?.global_accuracy || 0) * 100}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-mono text-slate-400">{stats?.total_evaluations || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => toggleExpand(agent.agent_id)}
                          className={cn(
                            "p-2 rounded-lg transition-all",
                            isExpanded ? "bg-brand-accent text-black" : "bg-brand-bg border border-brand-border text-slate-400 hover:text-white"
                          )}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                    
                    <AnimatePresence>
                      {isExpanded && stats && (
                        <tr>
                          <td colSpan={6} className="p-0 border-b border-brand-border">
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-brand-bg/50"
                            >
                              <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-4 space-y-6">
                                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Target className="w-3 h-3 text-brand-accent" />
                                    Specialization Matrix
                                  </h4>
                                  <div className="space-y-3">
                                    {Object.entries(agent.specialization || {}).map(([key, val]) => (
                                      <div key={key} className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400 capitalize">{key}</span>
                                        <div className="flex items-center gap-3">
                                          <div className="w-24 h-1 bg-brand-border rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${(val as number) * 100}%` }} />
                                          </div>
                                          <span className="text-[10px] font-mono text-white">{((val as number) * 100).toFixed(0)}%</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div className="pt-4 border-t border-brand-border">
                                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                                      <span>LAST UPDATED</span>
                                      <span>{stats.last_updated ? new Date(stats.last_updated).toLocaleString() : 'N/A'}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="lg:col-span-8 flex flex-col">
                                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                                    <BarChart3 className="w-3 h-3 text-brand-accent" />
                                    Group Accuracy Breakdown
                                  </h4>
                                  <div className="flex-1 h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={stats.group_breakdown || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                        <XAxis 
                                          dataKey="group_id" 
                                          stroke="#555" 
                                          fontSize={10} 
                                          tickLine={false} 
                                          axisLine={false} 
                                        />
                                        <YAxis 
                                          stroke="#555" 
                                          fontSize={10} 
                                          tickLine={false} 
                                          axisLine={false} 
                                          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                                        />
                                        <Tooltip 
                                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                          contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px' }}
                                          itemStyle={{ fontSize: '12px' }}
                                        />
                                        <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                                          {stats.group_breakdown.map((entry, index) => (
                                            <Cell 
                                              key={`cell-${index}`} 
                                              fill={entry.accuracy > 0.9 ? '#00ff88' : entry.accuracy > 0.8 ? '#3b82f6' : '#f59e0b'} 
                                            />
                                          ))}
                                        </Bar>
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentStats;
