import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon: Icon, color, bg, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-panel p-6 flex items-center gap-4 group hover:border-brand-accent/30 transition-all"
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", bg)}>
        <Icon className={cn("w-6 h-6", color)} />
      </div>
      <div>
        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</div>
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        <div className="text-[10px] text-slate-400 font-mono">{sub}</div>
      </div>
    </motion.div>
  );
};

export default StatCard;
