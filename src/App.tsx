import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Activity, 
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  Settings,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RiskAssessment from './pages/RiskAssessment';
import GroupCollaboration from './pages/GroupCollaboration';
import Dashboard from './pages/Dashboard';
import { cn } from './lib/utils';

type Page = 'risk' | 'collaboration' | 'dashboard';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('risk');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { id: 'risk', label: 'Risk Assessment', icon: Shield, description: 'VAN Agent Network' },
    { id: 'collaboration', label: 'Multi-Agent Group', icon: Users, description: 'Consensus Orchestrator' },
    { id: 'dashboard', label: 'Orchestration Hub', icon: LayoutDashboard, description: 'Real-time Performance' },
  ];

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden technical-grid">
      {/* Sidebar */}
      <aside 
        className={cn(
          "relative z-20 flex flex-col border-r border-brand-border bg-brand-bg transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.3)]">
            <Cpu className="text-black w-5 h-5" />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg tracking-tight text-white"
            >
              AEGEAN
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as Page)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group relative text-left",
                activePage === item.id 
                  ? "bg-brand-accent/10 text-brand-accent" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0", activePage === item.id ? "text-brand-accent" : "group-hover:text-white")} />
              {isSidebarOpen && (
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                  <span className="text-[10px] opacity-50 whitespace-nowrap">{item.description}</span>
                </div>
              )}
              {activePage === item.id && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-6 bg-brand-accent rounded-r-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-brand-border">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/5 text-slate-400"
          >
            {isSidebarOpen ? <ChevronRight className="rotate-180" /> : <ChevronRight />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-bottom border-brand-border flex items-center justify-between px-8 bg-brand-bg/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">
              {navItems.find(i => i.id === activePage)?.label}
            </h1>
            <div className="h-4 w-[1px] bg-brand-border" />
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              SYSTEM ACTIVE: v1.2.4
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search sessions or subjects..."
                className="bg-brand-card border border-brand-border rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-brand-accent/50 w-64 transition-all"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-white relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-brand-bg" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white">
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-brand-border">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">Admin User</div>
                <div className="text-[10px] text-slate-500 font-mono">MAOAIXIAO</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent to-blue-500 flex items-center justify-center text-black font-bold text-xs">
                MX
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activePage === 'risk' && <RiskAssessment />}
              {activePage === 'collaboration' && <GroupCollaboration />}
              {activePage === 'dashboard' && <Dashboard />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
