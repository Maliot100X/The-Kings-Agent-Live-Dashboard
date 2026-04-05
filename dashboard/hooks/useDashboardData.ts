import { useState, useCallback } from 'react';
import { Agent, Task, LogEntry, ChatMessage, SystemMetric } from '@/types';

// Mock data generators
const generateMockAgents = (): Agent[] => [
  {
    id: '1',
    name: 'Alpha Agent',
    status: 'online',
    type: 'Orchestrator',
    lastActive: new Date().toISOString(),
    tasksCompleted: 156,
    position: { x: 8, y: 2, z: 5 },
    color: '#FFD700',
  },
  {
    id: '2',
    name: 'Beta Agent',
    status: 'busy',
    type: 'Processor',
    lastActive: new Date().toISOString(),
    tasksCompleted: 89,
    position: { x: -5, y: 4, z: 8 },
    color: '#00BCD4',
  },
  {
    id: '3',
    name: 'Gamma Agent',
    status: 'online',
    type: 'Analyzer',
    lastActive: new Date().toISOString(),
    tasksCompleted: 234,
    position: { x: 6, y: -3, z: -4 },
    color: '#4CAF50',
  },
  {
    id: '4',
    name: 'Delta Agent',
    status: 'offline',
    type: 'Executor',
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    tasksCompleted: 67,
    position: { x: -7, y: -2, z: 3 },
    color: '#FF5722',
  },
  {
    id: '5',
    name: 'Epsilon Agent',
    status: 'online',
    type: 'Monitor',
    lastActive: new Date().toISOString(),
    tasksCompleted: 178,
    position: { x: 4, y: 6, z: -6 },
    color: '#9C27B0',
  },
  {
    id: '6',
    name: 'Zeta Agent',
    status: 'busy',
    type: 'Researcher',
    lastActive: new Date().toISOString(),
    tasksCompleted: 145,
    position: { x: -4, y: -5, z: -7 },
    color: '#2196F3',
  },
];

const generateMockTasks = (): Task[] => [
  {
    id: 't1',
    title: 'Data Processing Pipeline',
    description: 'Process incoming telemetry data from field sensors',
    status: 'running',
    agentId: '2',
    priority: 'high',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    progress: 65,
  },
  {
    id: 't2',
    title: 'System Health Check',
    description: 'Perform routine diagnostics on all subsystems',
    status: 'completed',
    agentId: '5',
    priority: 'medium',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: new Date(Date.now() - 3600000).toISOString(),
    progress: 100,
  },
  {
    id: 't3',
    title: 'Security Audit',
    description: 'Comprehensive security scan of network infrastructure',
    status: 'pending',
    agentId: '3',
    priority: 'critical',
    createdAt: new Date().toISOString(),
    progress: 0,
  },
  {
    id: 't4',
    title: 'Model Training',
    description: 'Train neural network on new dataset',
    status: 'running',
    agentId: '6',
    priority: 'high',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    progress: 42,
  },
  {
    id: 't5',
    title: 'Database Optimization',
    description: 'Optimize query performance and index maintenance',
    status: 'failed',
    agentId: '4',
    priority: 'medium',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    progress: 30,
  },
];

const generateMockLogs = (): LogEntry[] => [
  {
    id: 'l1',
    timestamp: new Date().toISOString(),
    level: 'success',
    message: 'Agent Beta completed task Data Processing Pipeline',
    agentId: '2',
    source: 'TaskManager',
  },
  {
    id: 'l2',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    level: 'info',
    message: 'System metrics collected successfully',
    source: 'Monitor',
  },
  {
    id: 'l3',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    level: 'warning',
    message: 'High memory usage detected on Agent Delta',
    agentId: '4',
    source: 'ResourceMonitor',
  },
  {
    id: 'l4',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    level: 'error',
    message: 'Database connection timeout',
    source: 'Database',
  },
  {
    id: 'l5',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    level: 'info',
    message: 'New agent Epsilon registered',
    agentId: '5',
    source: 'Registry',
  },
];

const generateMockMetrics = (): SystemMetric => ({
  cpu: 45 + Math.random() * 30,
  memory: 60 + Math.random() * 20,
  activeAgents: 5,
  totalTasks: 156,
  completedTasks: 134,
  failedTasks: 3,
  timestamp: new Date().toISOString(),
});

export function useDashboardData() {
  const [agents, setAgents] = useState<Agent[]>(generateMockAgents());
  const [tasks, setTasks] = useState<Task[]>(generateMockTasks());
  const [logs, setLogs] = useState<LogEntry[]>(generateMockLogs());
  const [metrics, setMetrics] = useState<SystemMetric>(generateMockMetrics());
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Greetings! I am King Hermes, the sovereign AI orchestrator. How may I assist you today?',
      timestamp: new Date().toISOString(),
    },
  ]);

  const addChatMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const updateTaskProgress = useCallback((taskId: string, progress: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, progress: Math.min(100, progress) } : t
      )
    );
  }, []);

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 100));
  }, []);

  return {
    agents,
    tasks,
    logs,
    metrics,
    messages,
    setAgents,
    setTasks,
    setLogs,
    setMetrics,
    addChatMessage,
    updateTaskProgress,
    addLog,
  };
}
