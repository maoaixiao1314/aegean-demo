import React from 'react';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Layers,
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import AgentPerformanceTable from '../components/dashboard/AgentPerformanceTable';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import StatusDistributionPie from '../components/dashboard/StatusDistributionPie';
import RecentTaskFlow from '../components/dashboard/RecentTaskFlow';

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
  return (
    <div className="flex flex-col gap-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'System Status', value: 'Operational', sub: 'v1.2.4 Active', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Active Agents', value: '12', sub: 'Across 4 Groups', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Tasks Processed', value: '1,284', sub: 'Last 24h', icon: Layers, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Avg Consensus', value: '94.2%', sub: '+2.1% vs yesterday', icon: TrendingUp, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
        ].map((stat, i) => (
          <StatCard 
            key={stat.label}
            {...stat}
            index={i}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Agent Performance */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <AgentPerformanceTable stats={AGENT_STATS} />
          <PerformanceChart data={PERFORMANCE_DATA} />
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <StatusDistributionPie data={STATUS_DISTRIBUTION} />
          <RecentTaskFlow flow={RECENT_FLOW} />
        </div>
      </div>
    </div>
  );
}
