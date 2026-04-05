'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Bot, Workflow, MessageSquare, 
  BarChart3, Settings, Plus, Play, Pause, StopCircle,
  CheckCircle2, XCircle, Clock, MoreVertical, Search,
  Filter, Download, RefreshCw, Terminal, Cpu, HardDrive,
  Network, Zap, AlertTriangle
} from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Header } from '@/components/Header';
import { AgentNetwork3D } from '@/components/AgentNetwork3D';
import { ActivityFeed } from '@/components/ActivityFeed';
import { FloatingBot } from '@/components/FloatingBot';
import { useWebSocket } from '@/hooks/useWebSocket';
import { cn, formatRelativeTime, AGENT_TYPES } from '@/lib/utils';

// Mock data for demo - will be replaced by WebSocket data
const mockAgents = [
  { id: '1', name: 'Orchestrator', type: 'orchestrator', status: 'online', tasks: 42, lastActive: new Date() },
  { id: '2', name: 'Code Agent', type: 'coder', status: 'busy', tasks: 128, lastActive: new Date() },
  { id: '3', name: 'Analyst', type: 'analyst', status: 'online', tasks: 67, lastActive: new Date() },
  { id: '4', name: 'Researcher', type: 'researcher', status: 'idle', tasks: 23, lastActive: new Date() },
  { id: '5', name: 'Creative', type: 'creative', status: 'online', tasks: 15, lastActive: new Date() },
];

const mockWorkflows = [
  { id: 'wf-1', name: 'Code Review Pipeline', status: 'running', agents: 3, progress: 78, lastRun: '2m ago' },
  { id: 'wf-2', name: 'Data Analysis', status: 'completed', agents: 2, progress: 100, lastRun: '1h ago' },
  { id: 'wf-3', name: 'Research Sprint', status: 'paused', agents: 4, progress: 45, lastRun: '3h ago' },
];

const mockMetrics = [
  { label: 'Active Tasks', value: 275, change: '+12%', trend: 'up' },
  { label: 'Messages/sec', value: 1.2, change: '+5%', trend: 'up', unit: 'k' },
  { label: 'Avg Latency', value: 45, change: '-8%', trend: 'down', unit: 'ms' },
  { label: 'Success Rate', value: 99.8, change: '+0.2%', trend: 'up', unit: '%' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activities, setActivities] = useState<any[]>([]);
  const [agents, setAgents] = useState(mockAgents);
  
  const { isConnected, lastMessage, send } = useWebSocket({
    onMessage: (msg) => {
      if (msg.type === 'activity:log') {
        setActivities((prev) => [...prev, {
          id: Date.now().toString(),
          type: 'agent',
          agentName: msg.payload.agentName,
          message: msg.payload.message,
          timestamp: new Date(),
        }]);
      }
      if (msg.type === 'agent:update') {
        setAgents((prev) => 
          prev.map(a => a.id === msg.payload.id ? { ...a, ...msg.payload } : a)
        );
      }
    },
  });

  // Render different tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-dark-800 rounded-xl p-5 border border-dark-600 hover:border-neon-blue/30 transition-colors"
                >
                  <p className="text-sm text-gray-400">{metric.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-white">{metric.value}</span>
                    <span className="text-sm text-gray-500">{metric.unit}</span>
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 text-xs mt-2',
                    metric.trend === 'up' ? 'text-neon-green' : 'text-neon-pink'
                  )}>
                    {metric.trend === 'up' ? '+' : ''}{metric.change}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 3D Network + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AgentNetwork3D isConnected={isConnected} />
              <ActivityFeed activities={activities} isConnected={isConnected} />
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-dark-800 rounded-xl p-4 border border-dark-600"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-neon-blue/10 rounded-lg">
                    <Zap className="w-5 h-5 text-neon-blue" />
                  </div>
                  <h4 className="font-semibold text-white">System Health</h4>
                </div>
                <div className="space-y-2">
                  {['CPU', 'Memory', 'Disk', 'Network'].map((item) => (
                    <div key={item} className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{item}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-neon-green rounded-full"
                            style={{ width: `${Math.random() * 30 + 60}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{Math.floor(Math.random() * 30 + 60)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-dark-800 rounded-xl p-4 border border-dark-600"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-neon-purple/10 rounded-lg">
                    <Terminal className="w-5 h-5 text-neon-purple" />
                  </div>
                  <h4 className="font-semibold text-white">Recent Commands</h4>
                </div>
                <div className="space-y-2">
                  {['deploy --env prod', 'agent:list --active', 'workflow:start analysis', 'metrics:export'].map((cmd) => (
                    <div key={cmd} className="flex items-center gap-2 text-sm">
                      <span className="text-neon-green">$</span>
                      <span className="text-gray-300 font-mono">{cmd}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-dark-800 rounded-xl p-4 border border-dark-600"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-neon-yellow/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-neon-yellow" />
                  </div>
                  <h4 className="font-semibold text-white">Alerts</h4>
                </div>
                <div className="space-y-2">
                  {[
                    { level: 'warning', msg: 'High memory usage on agent-2' },
                    { level: 'info', msg: 'Backup completed successfully' },
                    { level: 'error', msg: 'Network latency spike detected' },
                  ].map((alert, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={cn(
                        'w-2 h-2 rounded-full mt-1.5',
                        alert.level === 'error' ? 'bg-neon-pink' : 
                        alert.level === 'warning' ? 'bg-neon-yellow' : 'bg-neon-blue'
                      )} />
                      <span className="text-sm text-gray-300">{alert.msg}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        );

      case 'agents':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search agents..."
                    className="pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm text-white placeholder-gray-500 focus:border-neon-blue focus:outline-none"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm text-gray-400 hover:text-white">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-dark-900 rounded-lg text-sm font-medium hover:bg-neon-blue/80">
                <Plus className="w-4 h-4" />
                Add Agent
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => {
                const typeInfo = AGENT_TYPES.find(t => t.id === agent.type) || AGENT_TYPES[0];
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-dark-800 rounded-xl p-5 border border-dark-600 hover:border-neon-blue/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${typeInfo.color}20` }}
                        >
                          <Bot className="w-6 h-6" style={{ color: typeInfo.color }} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{agent.name}</h4>
                          <p className="text-xs text-gray-400">{typeInfo.name}</p>
                        </div>
                      </div>
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        agent.status === 'online' ? 'bg-neon-green animate-pulse' :
                        agent.status === 'busy' ? 'bg-neon-yellow' :
                        agent.status === 'idle' ? 'bg-gray-500' : 'bg-red-500'
                      )} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-dark-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Tasks</p>
                        <p className="text-lg font-bold text-white">{agent.tasks}</p>
                      </div>
                      <div className="bg-dark-700/50 rounded-lg p-3">
                        <p className="text-xs text-gray-400">Last Active</p>
                        <p className="text-sm text-gray-300">{formatRelativeTime(agent.lastActive)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="flex-1 py-2 bg-supreme-600 text-white rounded-lg text-sm font-medium hover:bg-supreme-500">
                        View
                      </button>
                      <button className="p-2 bg-dark-700 rounded-lg text-gray-400 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );

      case 'workflows':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Active Workflows</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-dark-900 rounded-lg text-sm font-medium hover:bg-neon-blue/80">
                <Plus className="w-4 h-4" />
                New Workflow
              </button>
            </div>

            <div className="space-y-4">
              {mockWorkflows.map((workflow) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-dark-800 rounded-xl p-5 border border-dark-600"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        workflow.status === 'running' ? 'bg-neon-green/10' :
                        workflow.status === 'completed' ? 'bg-neon-blue/10' : 'bg-neon-yellow/10'
                      )}>
                        <Workflow className={cn('w-5 h-5',
                          workflow.status === 'running' ? 'text-neon-green' :
                          workflow.status === 'completed' ? 'text-neon-blue' : 'text-neon-yellow'
                        )} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{workflow.name}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span>{workflow.agents} agents</span>
                          <span>•</span>
                          <span>Last run {workflow.lastRun}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {workflow.status === 'running' && (
                        <button className="p-2 bg-neon-yellow/10 rounded-lg text-neon-yellow hover:bg-neon-yellow/20">
                          <Pause className="w-4 h-4" />
                        </button>
                      )}
                      {workflow.status === 'paused' && (
                        <button className="p-2 bg-neon-green/10 rounded-lg text-neon-green hover:bg-neon-green/20">
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2 bg-neon-pink/10 rounded-lg text-neon-pink hover:bg-neon-pink/20">
                        <StopCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white font-medium">{workflow.progress}%</span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${workflow.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={cn(
                          'h-full rounded-full',
                          workflow.status === 'running' ? 'bg-neon-green' :
                          workflow.status === 'completed' ? 'bg-neon-blue' : 'bg-neon-yellow'
                        )}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'chat':
        return (
          <div className="h-[calc(100vh-140px)] bg-dark-800 rounded-xl border border-dark-600 overflow-hidden flex">
            {/* Sidebar */}
            <div className="w-64 border-r border-dark-600 p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  className="w-full pl-10 pr-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-sm text-white placeholder-gray-500 focus:border-neon-blue focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                {['General', 'Code Review', 'Analytics', 'Research'].map((chat) => (
                  <button
                    key={chat}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-dark-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{chat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-dark-600">
                <h3 className="font-semibold text-white">General Chat</h3>
                <p className="text-xs text-gray-400">5 agents participating</p>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-neon-blue" />
                  </div>
                  <div className="bg-dark-700 rounded-lg px-4 py-2 max-w-[80%]">
                    <p className="text-sm text-gray-300">Welcome to the swarm chat! All agents can communicate here.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-dark-600">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-sm text-white placeholder-gray-500 focus:border-neon-blue focus:outline-none"
                  />
                  <button className="px-4 py-2 bg-neon-blue text-dark-900 rounded-lg font-medium">
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'metrics':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">System Metrics</h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm text-gray-400 hover:text-white">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm text-gray-400 hover:text-white">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-dark-800 rounded-xl p-5 border border-dark-600">
                <h4 className="font-semibold text-white mb-4">Resource Usage</h4>
                <div className="space-y-4">
                  {[
                    { label: 'CPU Usage', value: 45, icon: Cpu, color: 'bg-neon-blue' },
                    { label: 'Memory', value: 62, icon: HardDrive, color: 'bg-neon-purple' },
                    { label: 'Network', value: 28, icon: Network, color: 'bg-neon-green' },
                    { label: 'Storage', value: 78, icon: HardDrive, color: 'bg-neon-yellow' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-300">{item.label}</span>
                        </div>
                        <span className="text-sm font-medium text-white">{item.value}%</span>
                      </div>
                      <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div 
                          className={cn('h-full rounded-full', item.color)}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-dark-800 rounded-xl p-5 border border-dark-600">
                <h4 className="font-semibold text-white mb-4">Agent Performance</h4>
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg">
                      <Bot className="w-5 h-5 text-neon-blue" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white">{agent.name}</span>
                          <span className="text-xs text-gray-400">{agent.tasks} tasks</span>
                        </div>
                        <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-neon-green rounded-full"
                            style={{ width: `${Math.min(agent.tasks / 2, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-xl font-bold text-white">Settings</h2>

            <div className="space-y-4">
              <div className="bg-dark-800 rounded-xl p-5 border border-dark-600">
                <h4 className="font-semibold text-white mb-4">General</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Dark Mode</p>
                      <p className="text-xs text-gray-400">Always use dark theme</p>
                    </div>
                    <div className="w-12 h-6 bg-neon-blue rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Auto-refresh</p>
                      <p className="text-xs text-gray-400">Update data every 5 seconds</p>
                    </div>
                    <div className="w-12 h-6 bg-neon-blue rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-dark-800 rounded-xl p-5 border border-dark-600">
                <h4 className="font-semibold text-white mb-4">Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Agent Updates</p>
                      <p className="text-xs text-gray-400">Get notified when agents change status</p>
                    </div>
                    <div className="w-12 h-6 bg-dark-600 rounded-full relative">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-gray-400 rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Workflow Alerts</p>
                      <p className="text-xs text-gray-400">Alerts for workflow events</p>
                    </div>
                    <div className="w-12 h-6 bg-neon-blue rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-dark-800 rounded-xl p-5 border border-dark-600">
                <h4 className="font-semibold text-white mb-4">Connection</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-300 block mb-2">WebSocket URL</label>
                    <input
                      type="text"
                      defaultValue="ws://194.195.215.135:3001"
                      className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-sm text-white focus:border-neon-blue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 block mb-2">API Key</label>
                    <input
                      type="password"
                      placeholder="Enter your API key"
                      className="w-full px-4 py-2 bg-dark-900 border border-dark-600 rounded-lg text-sm text-white focus:border-neon-blue focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="ml-64 pt-16 min-h-screen">
        <Header isConnected={isConnected} stats={{
          activeAgents: agents.filter(a => a.status === 'online').length,
          totalTasks: agents.reduce((acc, a) => acc + a.tasks, 0),
          messagesPerSecond: 42,
          cpuUsage: 34,
        }} />
        
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <FloatingBot isConnected={isConnected} wsSend={send} />
    </div>
  );
}
