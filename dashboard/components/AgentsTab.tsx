'use client';

import { motion } from 'framer-motion';
import { Agent } from '@/types';
import { Circle, Activity, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface AgentsTabProps {
  agents: Agent[];
}

const statusIcons = {
  online: CheckCircle,
  offline: Circle,
  busy: Activity,
  error: AlertCircle,
};

const statusColors = {
  online: 'text-green-400',
  offline: 'text-gray-400',
  busy: 'text-yellow-400',
  error: 'text-red-400',
};

export function AgentsTab({ agents }: AgentsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gold text-glow">Active Agents</h2>
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-2">
            <Circle className="w-3 h-3 text-green-400" />
            Online: {agents.filter(a => a.status === 'online').length}
          </span>
          <span className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-yellow-400" />
            Busy: {agents.filter(a => a.status === 'busy').length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent, index) => {
          const StatusIcon = statusIcons[agent.status];
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-lg p-4 hover:border-king-gold/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${agent.color}20`, border: `2px solid ${agent.color}` }}
                  >
                    <span className="text-sm font-bold" style={{ color: agent.color }}>
                      {agent.name[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-king-gold">{agent.name}</h3>
                    <p className="text-sm text-gray-400">{agent.type}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1 ${statusColors[agent.status]}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-xs capitalize">{agent.status}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-king-gold" />
                  <span>{agent.tasksCompleted} tasks</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="w-4 h-4 text-king-gold" />
                  <span>{new Date(agent.lastActive).toLocaleTimeString()}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
