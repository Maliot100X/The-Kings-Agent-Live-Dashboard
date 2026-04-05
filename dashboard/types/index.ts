export interface Agent {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  type: string;
  lastActive: string;
  tasksCompleted: number;
  position?: { x: number; y: number; z: number };
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  agentId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  completedAt?: string;
  progress: number;
}

export interface SystemMetric {
  cpu: number;
  memory: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  timestamp: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  agentId?: string;
  source: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export type TabId = 'agents' | 'system' | 'tasks' | 'chat' | 'logs' | 'settings';

export interface WebSocketMessage {
  type: 'agent_update' | 'task_update' | 'system_metrics' | 'log' | 'chat';
  data: any;
  timestamp: string;
}
