import React from 'react';
import { Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface PerformanceData {
  time: string;
  latency: number;
  throughput: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  return (
    <div className="glass-panel p-6 h-[350px] flex flex-col">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <Zap className="w-4 h-4 text-brand-accent" />
        Real-time Orchestration Latency
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data || []}>
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
  );
};

export default PerformanceChart;
