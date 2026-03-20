import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Clock,
  Shield,
  AlertTriangle,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  Layers,
  Terminal,
  Server
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { systemApi, riskApi, groupApi } from '../services/api';

const AGENT_STATS = [
  { name: 'Security Auditor', weight: 0.88, count: 124, accuracy: 96, trend: 'up' },
  { name: 'Risk Analyst', weight: 0.90, count: 98, accuracy: 94, trend: 'up' },
  { name: 'Strategy Optimizer', weight: 0.85, count: 76, accuracy: 93, trend: 'down' },
  { name: 'Compliance Bot', weight: 0.95, count: 112, accuracy: 97, trend: 'up' },
  { name: 'Execution Engine', weight: 0.80, count: 145, accuracy: 91, trend: 'up' },
];

const PERFORMANCE_DATA = [
  { time: '00:00', latency: 0.45, throughput: 12 },
  { time: '04:00', latency: 0.52, throughput: 8 },
  { time: '08:00', latency: 0.88, throughput: 45 },
  { time: '12:00', latency: 1.24, throughput: 82 },
  { time: '16:00', latency: 0.95, throughput: 64 },
  { time: '20:00', latency: 0.62, throughput: 28 },
  { time: '23:59', latency: 0.48, throughput: 15 },
];

const STATUS_DISTRIBUTION = [
  { name: 'Synthesized', value: 65, color: '#00ff88' },
  { name: 'Rejected', value: 15, color: '#ef4444' },
  { name: 'Processing', value: 12, color: '#f59e0b' },
  { name: 'Idle', value: 8, color: '#6366f1' },
];

const RECENT_FLOW = [
  { id: 'TASK-8821', subject: 'Cross-Chain Liquidity', status: 'synthesized', type: 'consensus', confidence: 0.94, latency: 0.34, time: '2m ago' },
  { id: 'TASK-8819', subject: 'HFT Strategy Alpha', status: 'rejected', type: 'hybrid', confidence: 0.99, latency: 1.56, time: '5m ago' },
  { id: 'TASK-8822', subject: 'Smart Contract Audit', status: 'synthesized', type: 'collaboration', confidence: 0.62, latency: 0.88, time: '12m ago' },
  { id: 'TASK-8823', subject: 'Market Depth Analysis', status: 'synthesized', type: 'consensus', confidence: 0.91, latency: 0.42, time: '15m ago' },
  { id: 'TASK-8824', subject: 'Regulatory Compliance', status: 'processing', type: 'hybrid', confidence: 0.75, latency: 1.12, time: '22m ago' },
];

export default function Dashboard() {
  const [systemHealth, setSystemHealth] = useState('Operational');
  const [groupCount, setGroupCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [challengeRate, setChallengeRate] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check system health
        await systemApi.health();
        setSystemHealth('Operational');
      } catch (e) {
        setSystemHealth('Degraded');
      }

      try {
        // Load groups
        const { data: groupsData } = await groupApi.getGroups();
        setGroupCount(Array.isArray(groupsData) ? groupsData.length : 0);
      } catch (e) {
        // silent
      }

      try {
        // Load sessions
        const { data: sessionsData } = await riskApi.getSessions({ limit: 20 });
        if (Array.isArray(sessionsData)) {
          setSessionCount(sessionsData.length);
          const challengeCount = sessionsData.filter((s: any) => s.challenge_count > 0).length;
          setChallengeRate(sessionsData.length > 0 ? Math.round((challengeCount / sessionsData.length) * 100) : 0);
        }
      } catch (e) {
        // silent
      }
    };

    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'System Status', value: systemHealth, sub: 'v1.2.4 Active', icon: Activity, color: systemHealth === 'Operational' ? 'text-emerald-400' : 'text-red-400', bg: systemHealth === 'Operational' ? 'bg-emerald-500/10' : 'bg-red-500/10' },
          { label: 'Active Groups', value: groupCount.toString(), sub: 'Multi-agent teams', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Sessions', value: sessionCount.toString(), sub: 'Last 24h', icon: Layers, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Challenge Rate', value: `${challengeRate}%`, sub: 'Verification required', icon: TrendingUp, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 flex items-center gap-4 group hover:border-brand-accent/30 transition-all"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{stat.label}</div>
              <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
              <div className="text-[10px] text-slate-400 font-mono">{stat.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Agent Performance */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-accent" />
                Agent Performance Metrics
              </h3>
              <div className="flex gap-4 text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-brand-accent" />
                  Accuracy
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Weight
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-brand-border text-[10px] text-slate-500 uppercase font-mono">
                    <th className="pb-4 font-medium">Agent Name</th>
                    <th className="pb-4 font-medium">Weight</th>
                    <th className="pb-4 font-medium">Tasks</th>
                    <th className="pb-4 font-medium">Accuracy</th>
                    <th className="pb-4 font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/50">
                  {AGENT_STATS.map((v) => (
                    <tr key={v.name} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-brand-accent" />
                          <span className="text-sm font-bold text-white capitalize">{v.name}</span>
                        </div>
                      </td>
                      <td className="py-4 font-mono text-xs text-slate-400">{v.weight.toFixed(2)}</td>
                      <td className="py-4 font-mono text-xs text-slate-400">{v.count}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 w-24 h-1 bg-brand-border rounded-full overflow-hidden">
                            <div className="h-full bg-brand-accent" style={{ width: `${v.accuracy}%` }} />
                          </div>
                          <span className="text-xs font-bold text-white">{v.accuracy}%</span>
                        </div>
                      </td>
                      <td className="py-4">
                        {v.trend === 'up' ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-400" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="glass-panel p-6 h-[350px] flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-accent" />
              Real-time Orchestration Latency
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PERFORMANCE_DATA}>
                  <defs>
                    <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <XAxis 
                    dataKey="time" 
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
                    tickFormatter={(v) => `${v}s`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="latency" 
                    stroke="#00ff88" 
                    fillOpacity={1} 
                    fill="url(#colorLatency)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Status Distribution */}
          <div className="glass-panel p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 self-start flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-accent" />
              Node Status Distribution
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STATUS_DISTRIBUTION}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {STATUS_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-4">
              {STATUS_DISTRIBUTION.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-slate-400">{s.name}</span>
                  <span className="text-xs font-bold text-white ml-auto">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Task Flow */}
          <div className="glass-panel p-6 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand-accent" />
              Recent Task Flow
            </h3>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {RECENT_FLOW.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 rounded-lg bg-brand-bg border border-brand-border hover:border-brand-accent/30 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white group-hover:text-brand-accent transition-colors">{item.subject}</span>
                      <span className="text-[9px] text-slate-500 font-mono">{item.id}</span>
                    </div>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase",
                      item.status === 'synthesized' ? 'text-brand-accent border-brand-accent/20 bg-brand-accent/5' :
                      item.status === 'rejected' ? 'text-red-400 border-red-500/20 bg-red-500/5' :
                      'text-amber-400 border-amber-500/20 bg-amber-500/5'
                    )}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex gap-3">
                      <span className="capitalize">{item.type}</span>
                      <span>Conf: {(item.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <span>{item.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-xs text-brand-accent font-bold hover:underline">
              View All Orchestration Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
