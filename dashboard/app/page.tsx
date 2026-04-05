'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Activity, BarChart3, Layers, MessageSquare, Terminal, Settings, Send, X } from 'lucide-react';
import dynamic from 'next/dynamic';

const Scene3D = dynamic(() => import('./components/Scene3D'), { ssr: false });

interface Agent {
  name: string;
  displayName: string;
  color: string;
  status: 'online' | 'offline' | 'busy';
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface Task {
  id: string;
  title: string;
  agent: string;
  status: 'pending' | 'running' | 'completed';
  progress: number;
}

const agents: Agent[] = [
  { name: 'opencode', displayName: 'OpenCode', color: '#00FF88', status: 'offline' },
  { name: 'gemini', displayName: 'Gemini', color: '#4ECDC4', status: 'offline' },
  { name: 'claude', displayName: 'OpenClaude', color: '#FF6B6B', status: 'offline' },
  { name: 'roo', displayName: 'Roo Code', color: '#9B59B6', status: 'offline' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('agents');
  const [wsConnected, setWsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Greetings my King! I am King Hermes, your sovereign AI orchestrator. How may I serve you?', timestamp: Date.now() }
  ]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({ cpu: 0, memory: 0 });
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [botInput, setBotInput] = useState('');
  
  const wsRef = useRef<WebSocket | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    wsRef.current = ws;
    
    ws.onopen = () => {
      setWsConnected(true);
      addLog('Connected to King Hermes server');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'metrics') {
        setMetrics({
          cpu: data.data.cpu?.percentage || 0,
          memory: data.data.memory?.percentage || 0
        });
      } else if (data.type === 'agent_output') {
        addMessage('assistant', data.output || data.chunk || 'Agent responded');
      } else if (data.type === 'agent_complete') {
        addLog(`Agent ${data.agentId} completed`);
      }
    };
    
    ws.onclose = () => {
      setWsConnected(false);
      addLog('Disconnected from server');
    };
    
    return () => ws.close();
  }, []);
  
  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant' | 'system', content: string) => {
    setMessages(prev => [...prev, { role, content, timestamp: Date.now() }]);
  };
  
  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-99), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const sendMessage = () => {
    if (botInput.trim() && wsRef.current?.readyState === WebSocket.OPEN) {
      addMessage('user', botInput);
      wsRef.current.send(JSON.stringify({ type: 'spawn_agent', agent: 'claude', prompt: botInput }));
      setBotInput('');
    }
  };
  
  const spawnAgent = (agent: string, task: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'spawn_agent', agent, prompt: task }));
      addLog(`Spawned ${agent} with task: ${task.substring(0, 50)}...`);
      const newTask: Task = { id: Date.now().toString(), title: task, agent, status: 'running', progress: 0 };
      setTasks(prev => [...prev, newTask]);
    }
  };

  const tabs = [
    { id: 'agents', label: 'Agents', icon: Activity },
    { id: 'system', label: 'System', icon: BarChart3 },
    { id: 'tasks', label: 'Tasks', icon: Layers },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen text-white overflow-hidden relative">
      {/* 3D Background */}
      <Scene3D 
        onAgentClick={(name) => addLog(`Clicked agent: ${name}`)}
        onKingClick={() => setIsBotOpen(true)}
      />
      
      {/* Gradient Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-transparent via-[#050505]/30 to-[#050505]/80 pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                King Hermes
              </h1>
              <p className="text-xs text-gray-400">Supreme Agent Orchestrator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">{wsConnected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="fixed top-20 left-0 right-0 z-40 bg-black/40 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative ${
                    activeTab === tab.id ? 'text-yellow-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-yellow-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="fixed top-36 left-0 right-0 bottom-0 z-30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full pb-24 overflow-y-auto"
            >
              {activeTab === 'agents' && <AgentsTab agents={agents} onSpawn={spawnAgent} />}
              {activeTab === 'system' && <SystemTab metrics={metrics} />}
              {activeTab === 'tasks' && <TasksTab tasks={tasks} />}
              {activeTab === 'chat' && <ChatTab messages={messages} onSend={addMessage} input={botInput} setInput={setBotInput} scrollRef={chatRef} />}
              {activeTab === 'logs' && <LogsTab logs={logs} />}
              {activeTab === 'settings' && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating King Bot */}
      <FloatingBot 
        isOpen={isBotOpen}
        onToggle={() => setIsBotOpen(!isBotOpen)}
        messages={messages}
        onSend={sendMessage}
        input={botInput}
        setInput={setBotInput}
        wsConnected={wsConnected}
      />
    </div>
  );
}

// Tab Components
function AgentsTab({ agents, onSpawn }: { agents: Agent[], onSpawn: (agent: string, task: string) => void }) {
  const [task, setTask] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('opencode');

  return (
    <div className="space-y-6 p-4">
      <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Spawn Agent</h3>
        <div className="flex gap-2 mb-3">
          <select 
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white"
          >
            <option value="opencode">OpenCode</option>
            <option value="gemini">Gemini</option>
            <option value="claude">OpenClaude</option>
          </select>
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Enter task..."
            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white"
          />
          <button 
            onClick={() => { onSpawn(selectedAgent, task); setTask(''); }}
            className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400"
          >
            Spawn
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold" style={{ backgroundColor: agent.color + '20', border: `2px solid ${agent.color}`, color: agent.color }}>
                  {agent.displayName[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{agent.displayName}</h3>
                  <p className="text-xs text-gray-400">{agent.name} Agent</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${agent.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SystemTab({ metrics }: { metrics: { cpu: number, memory: number } }) {
  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <h3 className="text-sm text-gray-400 mb-2">CPU Usage</h3>
          <p className="text-3xl font-bold text-white">{metrics.cpu}%</p>
        </div>
        <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <h3 className="text-sm text-gray-400 mb-2">Memory Usage</h3>
          <p className="text-3xl font-bold text-white">{metrics.memory}%</p>
        </div>
      </div>
    </div>
  );
}

function TasksTab({ tasks }: { tasks: Task[] }) {
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold text-white">Active Tasks</h2>
      {tasks.length === 0 && <p className="text-gray-500">No active tasks</p>}
      {tasks.map((task) => (
        <div key={task.id} className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-white">{task.title}</span>
            <span className={`text-xs px-2 py-1 rounded ${task.status === 'running' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
              {task.status}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${task.progress}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatTab({ messages, onSend, input, setInput, scrollRef }: any) {
  return (
    <div className="h-full flex flex-col p-4">
      <div ref={scrollRef} className="flex-1 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 overflow-y-auto mb-4">
        {messages.map((msg: Message, i: number) => (
          <div key={i} className="mb-3">
            <span className={`text-sm font-semibold ${msg.role === 'assistant' ? 'text-yellow-400' : msg.role === 'user' ? 'text-white' : 'text-gray-500'}`}>
              {msg.role === 'assistant' ? 'King Hermes' : msg.role === 'user' ? 'You' : 'System'}
            </span>
            <p className="text-sm text-gray-300">{msg.content}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSend()}
          placeholder="Message..."
          className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white"
        />
        <button onClick={onSend} className="px-4 py-2 bg-yellow-500/20 rounded-lg text-yellow-400">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function LogsTab({ logs }: { logs: string[] }) {
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex-1 bg-black/50 border border-white/10 rounded-lg p-4 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? <p className="text-gray-500">No logs...</p> : logs.map((log, i) => <div key={i} className="text-gray-400 mb-1">{log}</div>)}
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <h3 className="font-semibold text-white mb-2">Connection</h3>
        <p className="text-sm text-gray-400">WebSocket: ws://localhost:8080</p>
      </div>
      <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <h3 className="font-semibold text-white mb-2">Version</h3>
        <p className="text-sm text-gray-400">King Hermes v1.0.0</p>
      </div>
    </div>
  );
}

function FloatingBot({ isOpen, onToggle, messages, onSend, input, setInput, wsConnected }: any) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  return (
    <>
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-2xl"
        style={{ boxShadow: '0 0 30px rgba(234, 179, 8, 0.5)' }}
      >
        {isOpen ? <X className="w-7 h-7 text-white" /> : <Crown className="w-7 h-7 text-white" />}
        {!isOpen && wsConnected && <span className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-30" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 right-6 z-50 w-96 bg-[#0a0a0f] border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-b border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">King Hermes</h3>
                  <p className="text-xs text-gray-400">{wsConnected ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="h-80 overflow-y-auto p-4 space-y-3">
              {messages.map((msg: Message, i: number) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'assistant' ? 'bg-yellow-500' : 'bg-white/10'}`}>
                    <span className="text-xs font-bold text-white">{msg.role[0].toUpperCase()}</span>
                  </div>
                  <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${msg.role === 'assistant' ? 'bg-yellow-500/20 text-yellow-100' : 'bg-white/10 text-gray-200'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && onSend()}
                  placeholder="Command your agents..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
                <button onClick={onSend} className="px-3 py-2 bg-yellow-500/20 rounded-lg text-yellow-400">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
