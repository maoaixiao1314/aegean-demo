import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Users, 
  Plus, 
  MessageSquare, 
  Zap, 
  Cpu, 
  ChevronRight, 
  CheckCircle2, 
  Clock,
  BarChart3,
  Layers,
  Settings,
  ArrowRight,
  Activity,
  Send,
  Bot,
  Terminal,
  Share2,
  Maximize2,
  LayoutGrid,
  Settings2,
  ShieldCheck,
  ZapOff,
  Network,
  GitMerge,
  GitBranch,
  Save,
  Brain,
  Workflow,
  Sparkles,
  History,
  Command,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactFlow, { 
  Background, 
  Controls, 
  Handle, 
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { cn } from '../lib/utils';

// --- Types ---

type CollaborationMode = 'consensus' | 'collaboration' | 'hybrid';

interface Agent {
  id: string;
  name: string;
  role: string;
  type: string;
}

interface Group {
  id: string;
  name: string;
  mode: CollaborationMode;
  agents: Agent[];
  status: 'active' | 'idle';
}

interface AgentNodeData {
  label: string;
  status?: string;
  active?: boolean;
  role?: string;
}

const AgentNode = ({ data }: { data: AgentNodeData }) => (
  <div className={cn(
    "px-4 py-3 rounded-xl border shadow-lg min-w-[180px] transition-all duration-500",
    data.active 
      ? "bg-brand-accent/10 border-brand-accent shadow-brand-accent/20 scale-105" 
      : "bg-brand-card border-brand-border"
  )}>
    <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-brand-accent" />
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
        data.active ? "bg-brand-accent text-black" : "bg-white/5 text-slate-400"
      )}>
        <Bot className="w-6 h-6" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-bold text-white truncate">{data.label}</span>
        <span className="text-[9px] text-slate-500 font-mono uppercase tracking-tighter truncate">{data.role || 'Agent'}</span>
      </div>
    </div>
    {data.active && (
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-full bg-brand-accent"
          />
        </div>
        <span className="text-[8px] text-brand-accent font-mono animate-pulse">ACTIVE</span>
      </div>
    )}
    <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-brand-accent" />
  </div>
);

const EngineNode = ({ data }: { data: { active: boolean, mode: CollaborationMode } }) => (
  <div className={cn(
    "px-6 py-5 rounded-2xl border-2 shadow-2xl min-w-[240px] transition-all duration-700",
    data.active 
      ? "bg-brand-accent/20 border-brand-accent shadow-brand-accent/30 scale-105" 
      : "bg-brand-card border-brand-border"
  )}>
    <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-brand-accent" />
    <div className="flex flex-col items-center gap-3">
      <div className={cn(
        "w-16 h-16 rounded-2xl flex items-center justify-center mb-1 transition-all duration-500",
        data.active ? "bg-brand-accent text-black scale-110 shadow-[0_0_20px_rgba(0,255,136,0.4)]" : "bg-white/5 text-slate-400"
      )}>
        {data.mode === 'consensus' && <ShieldCheck className="w-9 h-9" />}
        {data.mode === 'collaboration' && <Network className="w-9 h-9" />}
        {data.mode === 'hybrid' && <GitMerge className="w-9 h-9" />}
      </div>
      <div className="text-center">
        <span className="text-xs font-black text-white uppercase tracking-[0.2em] block">
          {data.mode === 'consensus' ? 'Consensus Engine' : data.mode === 'collaboration' ? 'Sequential Flow' : 'Hybrid Processor'}
        </span>
        <span className="text-[9px] text-slate-500 font-mono mt-1 block">
          {data.active ? 'ORCHESTRATING SIGNAL...' : 'READY FOR DISPATCH'}
        </span>
      </div>
    </div>
    <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-brand-accent" />
  </div>
);

const nodeTypes = {
  agent: AgentNode,
  engine: EngineNode,
};

// --- Initial Groups & Data ---

const DEFAULT_AGENTS: Agent[] = [
  { id: 'a1', name: 'Strategic Planner', role: 'Context Architect', type: 'strategy' },
  { id: 'a2', name: 'Technical Lead', role: 'Implementation Expert', type: 'tech' },
  { id: 'a3', name: 'Security Auditor', role: 'Risk Evaluator', type: 'security' },
  { id: 'a4', name: 'Quality Guard', role: 'Output Validator', type: 'qa' },
];

const INITIAL_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Core Orchestrator',
    mode: 'consensus',
    agents: DEFAULT_AGENTS,
    status: 'active'
  }
];

const getNodesForGroup = (group: Group): Node[] => {
  const nodes: Node[] = [
    { 
      id: 'input', 
      type: 'input', 
      data: { label: 'TASK DISPATCH' }, 
      position: { x: 0, y: 150 }, 
      style: { background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '12px', fontSize: '10px', fontWeight: '900', letterSpacing: '0.1em', padding: '12px' } 
    },
    { 
      id: 'engine', 
      type: 'engine', 
      data: { active: false, mode: group.mode }, 
      position: { x: 550, y: 110 } 
    },
    { 
      id: 'output', 
      type: 'output', 
      data: { label: 'FINAL SYNTHESIS' }, 
      position: { x: 950, y: 150 }, 
      style: { background: '#00ff88', color: '#000', border: 'none', borderRadius: '12px', fontSize: '10px', fontWeight: '900', letterSpacing: '0.1em', padding: '12px' } 
    },
  ];

  group.agents.forEach((agent, idx) => {
    nodes.push({
      id: `agent-${agent.id}`,
      type: 'agent',
      data: { label: agent.name, role: agent.role, status: 'Idle' },
      position: { x: 250, y: idx * 100 }
    });
  });

  return nodes;
};

const getEdgesForGroup = (group: Group): Edge[] => {
  const edges: Edge[] = [];
  
  group.agents.forEach(agent => {
    edges.push({ 
      id: `e-in-${agent.id}`, 
      source: 'input', 
      target: `agent-${agent.id}`, 
      animated: false, 
      style: { stroke: '#333', strokeWidth: 2 } 
    });
    
    edges.push({ 
      id: `e-${agent.id}-eng`, 
      source: `agent-${agent.id}`, 
      target: 'engine', 
      animated: false, 
      style: { stroke: '#333', strokeWidth: 2 } 
    });
  });

  edges.push({ 
    id: 'e-eng-out', 
    source: 'engine', 
    target: 'output', 
    animated: false, 
    style: { stroke: '#333', strokeWidth: 2 } 
  });

  return edges;
};

export default function GroupCollaboration() {
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [activeGroupId, setActiveGroupId] = useState(INITIAL_GROUPS[0].id);
  const activeGroup = groups.find(g => g.id === activeGroupId) || groups[0];

  const [nodes, setNodes, onNodesChange] = useNodesState(getNodesForGroup(activeGroup));
  const [edges, setEdges, onEdgesChange] = useEdgesState(getEdgesForGroup(activeGroup));
  const [isRunning, setIsRunning] = useState(false);
  const [chat, setChat] = useState([
    { role: 'system', content: 'Multi-Agent Network Initialized. Ready for task orchestration.', time: '10:24 AM' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [logs, setLogs] = useState([
    { agent: 'System', action: 'Orchestrator online.', status: 'info', time: '10:24:01' },
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMode, setNewGroupMode] = useState<CollaborationMode>('consensus');

  useEffect(() => {
    setNodes(getNodesForGroup(activeGroup));
    setEdges(getEdgesForGroup(activeGroup));
  }, [activeGroupId]);

  const addLog = (agent: string, action: string, status: string = 'info') => {
    setLogs(prev => [{ 
      agent, 
      action, 
      status, 
      time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) 
    }, ...prev]);
  };

  const runSimulation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    
    setChat(prev => [...prev, { role: 'system', content: `Starting ${activeGroup.mode} orchestration...`, time: new Date().toLocaleTimeString() }]);

    if (activeGroup.mode === 'consensus') {
      // Step 1: Input to Agents
      setEdges(eds => eds.map(e => e.id.startsWith('e-in') ? { ...e, animated: true, style: { stroke: '#00ff88' } } : e));
      addLog('System', 'Dispatching task to all agents for independent evaluation.');
      await new Promise(r => setTimeout(r, 1000));

      // Step 2: Agents Processing
      setNodes(nds => nds.map(n => n.id.startsWith('agent') ? { ...n, data: { ...n.data, active: true, status: 'Analyzing...' } } : n));
      addLog('Agents', 'Evaluating task parameters and generating proposals.');
      await new Promise(r => setTimeout(r, 2000));

      // Step 3: Agents to Engine
      setNodes(nds => nds.map(n => n.id.startsWith('agent') ? { ...n, data: { ...n.data, active: false, status: 'Proposal Ready' } } : n));
      setEdges(eds => eds.map(e => e.id.includes('-eng') ? { ...e, animated: true, style: { stroke: '#00ff88' } } : e));
      addLog('System', 'Collecting proposals for consensus resolution.');
      await new Promise(r => setTimeout(r, 1000));

      // Step 4: Engine Active
      setNodes(nds => nds.map(n => n.id === 'engine' ? { ...n, data: { ...n.data, active: true } } : n));
      addLog('Consensus', 'Resolving conflicts and synthesizing final decision.', 'warning');
      await new Promise(r => setTimeout(r, 3000));
    } else if (activeGroup.mode === 'collaboration') {
      addLog('System', 'Initializing sequential collaboration chain.');
      
      for (const agent of activeGroup.agents) {
        setNodes(nds => nds.map(n => n.id === `agent-${agent.id}` ? { ...n, data: { ...n.data, active: true, status: 'Processing...' } } : n));
        addLog(agent.name, `Integrating context and refining output.`);
        await new Promise(r => setTimeout(r, 1500));
        setNodes(nds => nds.map(n => n.id === `agent-${agent.id}` ? { ...n, data: { ...n.data, active: false, status: 'Refined' } } : n));
      }

      setNodes(nds => nds.map(n => n.id === 'engine' ? { ...n, data: { ...n.data, active: true } } : n));
      addLog('Orchestrator', 'Finalizing sequential synthesis.');
      await new Promise(r => setTimeout(r, 1500));
    } else {
      addLog('System', 'Executing hybrid parallel-consensus workflow.');
      setNodes(nds => nds.map(n => n.id.startsWith('agent') ? { ...n, data: { ...n.data, active: true, status: 'Processing...' } } : n));
      await new Promise(r => setTimeout(r, 2000));
      setNodes(nds => nds.map(n => n.id === 'engine' ? { ...n, data: { ...n.data, active: true } } : n));
      addLog('Hybrid Engine', 'Merging parallel streams into consensus model.');
      await new Promise(r => setTimeout(r, 2000));
    }

    // Final Output
    setNodes(nds => nds.map(n => n.id === 'engine' ? { ...n, data: { ...n.data, active: false } } : n));
    setEdges(eds => eds.map(e => e.id === 'e-eng-out' ? { ...e, animated: true, style: { stroke: '#00ff88' } } : e));
    setChat(prev => [...prev, { role: 'assistant', content: `Orchestration complete. Mode: ${activeGroup.mode.toUpperCase()}. Result: Task successfully synthesized with high fidelity.`, time: new Date().toLocaleTimeString() }]);
    addLog('System', 'Final synthesis complete. Output dispatched.', 'success');
    
    await new Promise(r => setTimeout(r, 500));
    setIsRunning(false);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup: Group = {
      id: `g-${Date.now()}`,
      name: newGroupName,
      mode: newGroupMode,
      agents: DEFAULT_AGENTS,
      status: 'idle'
    };
    setGroups(prev => [...prev, newGroup]);
    setActiveGroupId(newGroup.id);
    setShowCreateModal(false);
    setNewGroupName('');
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    setChat(prev => [...prev, { role: 'user', content: inputValue, time: new Date().toLocaleTimeString() }]);
    setInputValue('');
    runSimulation();
  };

  return (
    <div className="flex h-full gap-0 -m-8 overflow-hidden bg-brand-bg relative">
      {/* Far Left: Slim Group Sidebar */}
      <div className="w-20 border-r border-brand-border bg-brand-bg flex flex-col items-center py-6 gap-6 z-30 shadow-xl">
        <button 
          onClick={() => setShowCreateModal(true)}
          className="w-12 h-12 rounded-2xl bg-brand-accent/10 hover:bg-brand-accent/20 border border-brand-accent/20 flex items-center justify-center transition-all group"
          title="Create New Group"
        >
          <Plus className="w-6 h-6 text-brand-accent group-hover:scale-110 transition-transform" />
        </button>
        <div className="w-8 h-[1px] bg-brand-border" />
        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar px-2">
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGroupId(g.id)}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all border relative group",
                activeGroupId === g.id 
                  ? "bg-brand-accent text-black border-brand-accent shadow-lg shadow-brand-accent/20" 
                  : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
              )}
              title={g.name}
            >
              <Users className="w-5 h-5" />
              <div className="absolute left-full ml-4 px-2 py-1 bg-brand-card border border-brand-border rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {g.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Center: Visualization Canvas */}
      <div className="flex-1 relative bg-[#050505] overflow-hidden">
        {/* Canvas Header */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20 pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3">
              <Brain className="w-5 h-5 text-brand-accent" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{activeGroup.name}</span>
                <span className="text-[9px] text-slate-500 font-mono uppercase">{activeGroup.mode} orchestration</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pointer-events-auto">
            <button className="bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-xl text-slate-400 hover:text-white transition-all" title="Auto Layout">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button className="bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-xl text-slate-400 hover:text-white transition-all" title="Focus View">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent"
          >
            <Background color="#111" gap={24} size={1} variant="dots" />
            <Controls className="!bg-brand-card !border-brand-border !fill-white !rounded-xl !overflow-hidden" />
          </ReactFlow>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
          <div className="flex gap-4 bg-black/60 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl shadow-2xl pointer-events-auto">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-accent" />
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Idle</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Collaboration Hub (Mirofish Style) */}
      <div className="w-[400px] border-l border-brand-border bg-brand-bg flex flex-col z-20 shadow-2xl">
        {/* Mode Selector Header */}
        <div className="p-6 border-b border-brand-border bg-brand-card/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <Workflow className="w-4 h-4 text-brand-accent" />
              Collaboration Mode
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['consensus', 'collaboration', 'hybrid'] as CollaborationMode[]).map(m => (
              <button
                key={m}
                onClick={() => {
                  setGroups(prev => prev.map(g => g.id === activeGroupId ? { ...g, mode: m } : g));
                  setNodes(nds => nds.map(n => n.id === 'engine' ? { ...n, data: { ...n.data, mode: m } } : n));
                }}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all relative group",
                  activeGroup.mode === m 
                    ? "bg-brand-accent/10 border-brand-accent text-brand-accent" 
                    : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
                )}
              >
                {m === 'consensus' && <ShieldCheck className="w-4 h-4" />}
                {m === 'collaboration' && <Network className="w-4 h-4" />}
                {m === 'hybrid' && <GitMerge className="w-4 h-4" />}
                <span className="text-[9px] font-bold uppercase tracking-tighter">{m}</span>
                {activeGroup.mode === m && (
                  <motion.div layoutId="mode-indicator" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-brand-accent rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Process Timeline / Logs */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-black/20">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Process Feed</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping" />
              <span className="text-[9px] text-brand-accent font-mono uppercase">Streaming</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gradient-to-b from-transparent to-black/10">
            <AnimatePresence initial={false}>
              {logs.map((log, i) => (
                <motion.div 
                  key={log.time + i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-4 relative"
                >
                  {/* Timeline Line */}
                  {i !== logs.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-[-16px] w-[1px] bg-brand-border" />
                  )}
                  
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 z-10",
                    log.status === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' :
                    log.status === 'warning' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 
                    log.status === 'error' ? 'bg-red-500/10 border-red-500 text-red-500' : 
                    'bg-brand-accent/10 border-brand-accent text-brand-accent'
                  )}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  </div>
                  
                  <div className="flex flex-col gap-1 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-white uppercase tracking-tighter">{log.agent}</span>
                      <span className="text-[8px] text-slate-600 font-mono">{log.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{log.action}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Task Input Area */}
        <div className="p-6 border-t border-brand-border bg-brand-card/50 backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Task Dispatcher</span>
              <div className="flex gap-2">
                <button className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-slate-500 hover:text-white transition-all">
                  <Command className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-slate-500 hover:text-white transition-all">
                  <History className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            <div className="relative">
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Describe the task for the agent group..."
                className="w-full bg-brand-bg border border-brand-border rounded-2xl px-4 py-4 pr-14 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-accent/50 resize-none min-h-[100px] transition-all shadow-inner"
              />
              <button 
                onClick={handleSend}
                disabled={isRunning || !inputValue.trim()}
                className="absolute bottom-4 right-4 p-3 bg-brand-accent text-black rounded-xl hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-brand-accent/20"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-all flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-brand-accent" />
                  Templates
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                <span className="text-[9px] text-slate-600 font-mono uppercase tracking-tighter">System Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-brand-card border border-brand-border rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              {/* Modal Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-accent/10 blur-[80px] rounded-full" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-brand-accent/10 flex items-center justify-center border border-brand-accent/20 shadow-inner">
                    <Users className="w-8 h-8 text-brand-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">New Agent Group</h3>
                    <p className="text-xs text-slate-500 font-mono">Configure multi-agent architecture</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Group Identifier</label>
                    <input 
                      value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      placeholder="e.g. Strategic Analysis Unit"
                      className="w-full bg-brand-bg border border-brand-border rounded-2xl px-5 py-4 text-sm text-white focus:border-brand-accent/50 outline-none transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Orchestration Mode</label>
                    <div className="grid grid-cols-1 gap-2">
                      {(['consensus', 'collaboration', 'hybrid'] as CollaborationMode[]).map(m => (
                        <button
                          key={m}
                          onClick={() => setNewGroupMode(m)}
                          className={cn(
                            "flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all text-left",
                            newGroupMode === m 
                              ? "bg-brand-accent/10 border-brand-accent text-white" 
                              : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            newGroupMode === m ? "bg-brand-accent text-black" : "bg-white/5"
                          )}>
                            {m === 'consensus' && <ShieldCheck className="w-4 h-4" />}
                            {m === 'collaboration' && <Network className="w-4 h-4" />}
                            {m === 'hybrid' && <GitMerge className="w-4 h-4" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-wider">{m}</span>
                            <span className="text-[9px] opacity-50 font-mono">
                              {m === 'consensus' ? 'Voting & Conflict Resolution' : 
                               m === 'collaboration' ? 'Sequential Context Passing' : 
                               'Parallel Analysis + Synthesis'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-4 rounded-2xl border border-white/10 text-[10px] font-black text-slate-400 uppercase hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleCreateGroup}
                      disabled={!newGroupName.trim()}
                      className="flex-1 py-4 rounded-2xl bg-brand-accent text-black text-[10px] font-black uppercase hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-brand-accent/20"
                    >
                      Initialize
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
