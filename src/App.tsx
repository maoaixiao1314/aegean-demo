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
  Cpu,
  Sparkles,
  Bot,
  FolderKanban,
  ChevronDown
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
  const [openGroups, setOpenGroups] = useState({
    workspace: true,
    agents: true,
    tools: false,
  });

  const navGroups = [
    {
      id: 'workspace',
      label: 'Workspace',
      icon: FolderKanban,
      items: [
        { id: 'risk', label: 'Risk Assessment', icon: Shield, description: 'VAN Agent Network', badge: 'Core' },
        { id: 'collaboration', label: 'Multi-Agent Group', icon: Users, description: 'Consensus Orchestrator', badge: 'Live' },
      ],
    },
    {
      id: 'agents',
      label: 'Agent Hub',
      icon: Bot,
      items: [
        { id: 'dashboard', label: 'Orchestration Hub', icon: LayoutDashboard, description: 'Real-time Performance', badge: 'Beta' },
      ],
    },
    {
      id: 'tools',
      label: 'Install Modules',
      icon: Sparkles,
      items: [],
    },
  ] as const;

  const allNavItems = navGroups.flatMap(group => group.items);

  const toggleGroup = (groupId: keyof typeof openGroups) => {
    setOpenGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden technical-grid">
      {/* Sidebar */}
      <aside 
        className={cn(
          "relative z-20 flex flex-col border-r border-brand-border bg-brand-bg transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-72" : "w-20"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-accent rounded-xl flex items-center justify-center shadow-[0_0_18px_rgba(0,255,136,0.32)]">
            <Cpu className="text-black w-5 h-5" />
          </div>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="font-bold text-lg tracking-tight text-white leading-none">AEGEAN</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-1">Control Surface</span>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-4 mt-2 overflow-y-auto custom-scrollbar">
          {navGroups.map((group) => {
            const GroupIcon = group.icon;
            const isGroupOpen = openGroups[group.id as keyof typeof openGroups];

            return (
              <div key={group.id} className="rounded-xl border border-brand-border/80 bg-brand-card/30 backdrop-blur-sm">
                <button
                  onClick={() => toggleGroup(group.id as keyof typeof openGroups)}
                  className={cn(
                    "w-full px-3 py-3 flex items-center justify-between transition-colors",
                    isSidebarOpen ? "" : "justify-center"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-brand-border flex items-center justify-center shrink-0">
                      <GroupIcon className="w-4 h-4 text-slate-300" />
                    </div>
                    {isSidebarOpen && (
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider truncate">{group.label}</span>
                    )}
                  </div>

                  {isSidebarOpen && (
                    <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform", isGroupOpen ? "rotate-180" : "")} />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isGroupOpen && isSidebarOpen && group.items.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-2 pb-2 space-y-1.5">
                        {group.items.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive = activePage === item.id;

                          return (
                            <button
                              key={item.id}
                              onClick={() => setActivePage(item.id as Page)}
                              className={cn(
                                "w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all group relative text-left",
                                isActive
                                  ? "bg-brand-accent/12 text-brand-accent border border-brand-accent/30"
                                  : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                              )}
                            >
                              <ItemIcon className={cn("w-4.5 h-4.5 mt-0.5 shrink-0", isActive ? "text-brand-accent" : "group-hover:text-white")} />

                              <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                                  <span className={cn(
                                    "text-[9px] px-1.5 py-0.5 rounded border uppercase leading-none",
                                    item.badge === 'Live'
                                      ? 'text-emerald-300 border-emerald-400/30 bg-emerald-500/10'
                                      : item.badge === 'Beta'
                                      ? 'text-amber-300 border-amber-400/30 bg-amber-500/10'
                                      : 'text-blue-300 border-blue-400/30 bg-blue-500/10'
                                  )}>{item.badge}</span>
                                </div>
                                <span className="text-[10px] opacity-60 truncate">{item.description}</span>
                              </div>

                              {isActive && (
                                <motion.div 
                                  layoutId="active-nav"
                                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-accent rounded-r-full"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {isGroupOpen && isSidebarOpen && group.items.length === 0 && (
                  <div className="px-3 pb-3">
                    <div className="rounded-lg border border-dashed border-brand-border p-3 bg-black/20">
                      <div className="text-xs text-slate-300 font-medium">Install from Marketplace</div>
                      <div className="text-[10px] text-slate-500 mt-1">Add connectors and mini-modules</div>
                      <button className="mt-2 text-[10px] text-brand-accent hover:underline font-semibold">Browse modules</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
              {allNavItems.find(i => i.id === activePage)?.label}
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
