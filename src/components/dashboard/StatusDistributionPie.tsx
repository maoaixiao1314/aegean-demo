import React from 'react';
import { Server } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface StatusDistributionPieProps {
  data: StatusData[];
}

const StatusDistributionPie: React.FC<StatusDistributionPieProps> = ({ data }) => {
  return (
    <div className="glass-panel p-6 flex flex-col items-center">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 self-start flex items-center gap-2">
        <Server className="w-4 h-4 text-brand-accent" />
        Node Status Distribution
      </h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full mt-4">
        {data?.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-slate-400">{s.name}</span>
            <span className="text-xs font-bold text-white ml-auto">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusDistributionPie;
