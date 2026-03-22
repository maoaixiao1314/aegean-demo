import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  Node,
  Edge,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Network, 
  MessageSquare, 
  GitBranch, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Shield,
  Zap,
  ChevronRight,
  Target,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { groupService } from '../services/api';
import { ConsensusResult } from '../types';
import { cn } from '../lib/utils';

// Custom Node for Knowledge Graph
const KnowledgeNode = ({ data }: any) => (
  <div className="px-4 py-2 shadow-md rounded-md bg-brand-card border border-brand-border min-w-[120px]">
    <Handle type="target" position={Position.Top} className="w-1.5 h-1.5 bg-brand-accent" />
    <div className="flex flex-col">
      <div className="text-[8px] font-bold text-slate-500 uppercase mb-1">{data.type}</div>
      <div className="text-xs font-bold text-white">{data.label}</div>
    </div>
    <Handle type="source" position={Position.Bottom} className="w-1.5 h-1.5 bg-brand-accent" />
  </div>
);

// Custom Node for Agent Graph
const AgentNode = ({ data }: any) => (
  <div className="p-3 shadow-lg rounded-full bg-brand-bg border-2 border-brand-accent/50 flex items-center justify-center w-16 h-16 relative group">
    <Handle type="target" position={Position.Top} className="opacity-0" />
    <div className="flex flex-col items-center">
      <span className="text-[8px] font-bold text-white text-center leading-tight">{data.label}</span>
      {data.isKey && <Zap className="w-3 h-3 text-brand-accent absolute -top-1 -right-1" />}
    </div>
    <Handle type="source" position={Position.Bottom} className="opacity-0" />
  </div>
);

const nodeTypes = {
  knowledge: KnowledgeNode,
  agent: AgentNode,
};

interface ConsensusExecutionProps {
  groupId: string;
}

const ConsensusExecution: React.FC<ConsensusExecutionProps> = ({ groupId }) => {
  const [taskDescription, setTaskDescription] = useState('');
  const [riskContext, setRiskContext] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ConsensusResult | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'timeline' | 'outcome'>('graph');

  const handleExecute = async () => {
    if (!taskDescription) return;
    setIsExecuting(true);
    try {
      const data = await groupService.executeConsensus(groupId, {
        task_description: taskDescription,
        risk_context: riskContext
      });
      setResult(data);
    } catch (error) {
      console.error('Consensus execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const knowledgeNodes: Node[] = result?.knowledge_graph.nodes.map((n, i) => ({
    id: n.id,
    type: 'knowledge',
    position: { x: 100 + (i % 3) * 200, y: 100 + Math.floor(i / 3) * 100 },
    data: { label: n.label, type: n.type }
  })) || [];

  const knowledgeEdges: Edge[] = result?.knowledge_graph.links.map((l, i) => ({
    id: `e-${i}`,
    source: l.source,
    target: l.target,
    label: l.type,
    labelStyle: { fill: '#555', fontSize: 8, fontWeight: 700 },
    animated: true,
    style: { stroke: '#262626' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#262626' }
  })) || [];

  const agentNodes: Node[] = result?.agent_graph.nodes.map((n, i) => ({
    id: n.id,
    type: 'agent',
    position: { x: 150 + Math.cos(i * 2 * Math.PI / result.agent_graph.nodes.length) * 150, y: 150 + Math.sin(i * 2 * Math.PI / result.agent_graph.nodes.length) * 150 },
    data: { label: n.label, isKey: result.agent_graph.key_agents.some(ka => ka[0] === n.id) }
  })) || [];

  const agentEdges: Edge[] = result?.agent_graph.edges.map((e, i) => ({
    id: `ae-${i}`,
    source: e.source,
    target: e.target,
    animated: true,
    style: { stroke: e.trust_score > 0.8 ? '#00ff88' : '#3b82f6', strokeWidth: e.influence_weight * 3 },
    markerEnd: { type: MarkerType.ArrowClosed, color: e.trust_score > 0.8 ? '#00ff88' : '#3b82f6' }
  })) || [];

  if (!result && !isExecuting) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center border border-brand-accent/20">
            <Zap className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Initiate Consensus</h2>
            <p className="text-slate-400 text-sm mt-1 font-mono uppercase tracking-wider">Trigger multi-agent collaborative decision making</p>
          </div>
        </div>

        <div className="glass-panel p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Task Description</label>
            <textarea 
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Describe the task or decision required..."
              className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent/50 transition-all h-32 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Context (Optional)</label>
            <input 
              type="text" 
              value={riskContext}
              onChange={(e) => setRiskContext(e.target.value)}
              placeholder="e.g., High-value transaction, new jurisdiction"
              className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-accent/50 transition-all"
            />
          </div>

          <button 
            onClick={handleExecute}
            disabled={!taskDescription}
            className="w-full bg-brand-accent hover:bg-brand-accent/90 disabled:opacity-50 text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(0,255,136,0.2)]"
          >
            <Play className="w-5 h-5 fill-current" />
            START CONSENSUS ENGINE
          </button>
        </div>
      </div>
    );
  }

  if (isExecuting) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-8">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-brand-accent/20 rounded-full" />
          <div className="w-24 h-24 border-4 border-brand-accent border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
          <Zap className="w-8 h-8 text-brand-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-white">Consensus in Progress...</h3>
          <p className="text-slate-500 font-mono text-xs animate-pulse">ORCHESTRATING AGENT RESPONSES • ROUND 2/5</p>
        </div>
        <div className="w-64 h-1 bg-brand-border rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-brand-accent"
            initial={{ width: 0 }}
            animate={{ width: '70%' }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-accent/10 flex items-center justify-center border border-brand-accent/20">
            <CheckCircle2 className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Consensus Result</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[10px] text-slate-500 font-mono uppercase">ID: {result?.consensus_id.slice(0, 12)}</span>
              <span className="text-[10px] text-brand-accent font-mono uppercase tracking-widest">SUCCESS</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-500 uppercase font-mono">Execution Time</span>
            <span className="text-sm font-bold text-white">{result?.execution_time}ms</span>
          </div>
          <div className="h-8 w-[1px] bg-brand-border" />
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-500 uppercase font-mono">Rounds</span>
            <span className="text-sm font-bold text-white">{result?.rounds_used}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Quadrant 1: Knowledge Graph */}
        <div className="glass-panel flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-brand-border flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <GitBranch className="w-3 h-3 text-brand-accent" />
              Knowledge Graph
            </h3>
            <span className="text-[9px] font-mono text-slate-600">ID: {result?.knowledge_graph.graph_id}</span>
          </div>
          <div className="flex-1 relative">
            <ReactFlow
              nodes={knowledgeNodes}
              edges={knowledgeEdges}
              nodeTypes={nodeTypes}
              fitView
              className="bg-brand-bg/30"
            >
              <Background color="#262626" gap={20} />
            </ReactFlow>
          </div>
        </div>

        {/* Quadrant 2: Agent Relationship Graph */}
        <div className="glass-panel flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-brand-border flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Network className="w-3 h-3 text-blue-500" />
              Agent Relationship Graph
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-brand-accent" />
                <span className="text-[9px] text-slate-500 uppercase font-mono">High Trust</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[9px] text-slate-500 uppercase font-mono">Neutral</span>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            <ReactFlow
              nodes={agentNodes}
              edges={agentEdges}
              nodeTypes={nodeTypes}
              fitView
              className="bg-brand-bg/30"
            >
              <Background color="#262626" gap={20} />
            </ReactFlow>
          </div>
        </div>

        {/* Quadrant 3: Discussion Timeline */}
        <div className="glass-panel flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-brand-border">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-3 h-3 text-brand-accent" />
              Discussion Timeline
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {result?.discussion_rounds?.map((round) => (
              <div key={round.round_number} className="relative pl-8 border-l border-brand-border/50 pb-8 last:pb-0">
                <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-brand-accent shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-white">ROUND {round.round_number}</span>
                  <span className={cn(
                    "text-[9px] px-2 py-0.5 rounded font-mono",
                    round.consensus_status === 'REACHED' ? "bg-brand-accent/10 text-brand-accent" : "bg-blue-500/10 text-blue-400"
                  )}>
                    {round.consensus_status}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(round.agent_responses || {}).map(([agentId, resp]) => (
                    <div key={agentId} className="p-3 rounded-lg bg-brand-bg border border-brand-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400">{agentId}</span>
                        <span className="text-[9px] font-mono text-brand-accent">{( (resp as any).confidence * 100).toFixed(0)}% CONF</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{(resp as any).reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant 4: Consensus Outcome */}
        <div className="glass-panel flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-brand-border">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-brand-accent" />
              Consensus Outcome
            </h3>
          </div>
          <div className="flex-1 p-8 flex flex-col">
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center border border-brand-accent/20">
                    <Target className="w-6 h-6 text-brand-accent" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Final Solution</h4>
                    <p className="text-[10px] text-slate-500 font-mono uppercase">Synthesized from {result?.participating_agents.length} agents</p>
                  </div>
                </div>
                <div className="p-6 rounded-xl bg-brand-accent/5 border border-brand-accent/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3">
                    <Zap className="w-4 h-4 text-brand-accent opacity-20" />
                  </div>
                  <p className="text-lg font-medium text-white leading-relaxed">
                    {result?.final_solution.answer}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Confidence Score</span>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-white">{(result?.final_solution.confidence * 100).toFixed(1)}%</span>
                    <span className="text-xs text-brand-accent font-mono mb-1.5">HIGH</span>
                  </div>
                  <div className="w-full h-1.5 bg-brand-border rounded-full overflow-hidden">
                    <div className="h-full bg-brand-accent" style={{ width: `${(result?.final_solution.confidence || 0) * 100}%` }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Weighted Votes</span>
                  <div className="flex items-center gap-4">
                    {Object.entries(result?.weighted_votes || {}).slice(0, 3).map(([agent, vote]) => (
                      <div key={agent} className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-mono truncate w-16">{agent}</span>
                        <span className="text-xs font-bold text-white">{(vote as number).toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-brand-border flex gap-4">
              <button className="flex-1 bg-brand-bg border border-brand-border text-white font-bold py-3 rounded-lg hover:bg-white/5 transition-all text-xs">
                EXPORT REPORT
              </button>
              <button className="flex-1 bg-brand-accent text-black font-bold py-3 rounded-lg hover:bg-brand-accent/90 transition-all text-xs">
                APPLY DECISION
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsensusExecution;
