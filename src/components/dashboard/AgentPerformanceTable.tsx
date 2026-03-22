import React from 'react';
import { Cpu, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AgentStat {
  name: string;
  weight: number;
  count: number;
  accuracy: number;
  trend: string;
}

interface AgentPerformanceTableProps {
  stats: AgentStat[];
}

const AgentPerformanceTable: React.FC<AgentPerformanceTableProps> = ({ stats }) => {
  return (
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
            {stats?.map((v) => (
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
  );
};

export default AgentPerformanceTable;
