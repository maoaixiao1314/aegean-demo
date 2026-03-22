import React from 'react';
import { Terminal } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface TaskFlowItem {
  id: string;
  subject: string;
  status: string;
  type: string;
  confidence: number;
  latency: number;
  time: string;
}

interface RecentTaskFlowProps {
  flow: TaskFlowItem[];
}

const RecentTaskFlow: React.FC<RecentTaskFlowProps> = ({ flow }) => {
  return (
    <div className="glass-panel p-6 flex-1 flex flex-col">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-brand-accent" />
        Recent Task Flow
      </h3>
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {flow?.map((item, i) => (
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
  );
};

export default RecentTaskFlow;
