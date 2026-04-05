'use client';

import { motion } from 'framer-motion';
import { Task } from '@/types';
import { Play, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface TasksTabProps {
  tasks: Task[];
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
  running: { icon: Play, color: 'text-blue-400', bg: 'bg-blue-400/20' },
  completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/20' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/20' },
};

const priorityConfig = {
  low: { color: 'text-gray-400', bg: 'bg-gray-500/20' },
  medium: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
  critical: { color: 'text-red-400', bg: 'bg-red-500/20', icon: AlertTriangle },
};

export function TasksTab({ tasks }: TasksTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-king-gold text-glow">Task Queue</h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full text-xs glass">
            {tasks.filter(t => t.status === 'running').length} Running
          </span>
          <span className="px-3 py-1 rounded-full text-xs glass">
            {tasks.filter(t => t.status === 'pending').length} Pending
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task, index) => {
          const StatusIcon = statusConfig[task.status].icon;
          const PriorityIcon = priorityConfig[task.priority].icon;

          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-king-gold">{task.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].color}`}>
                      {PriorityIcon && <PriorityIcon className="w-3 h-3 inline mr-1" />}
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{task.description}</p>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'failed' ? 'bg-red-500' :
                        'bg-king-gold'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${task.progress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{task.progress}% complete</span>
                    <span>Agent: {task.agentId}</span>
                  </div>
                </div>

                <div className={`flex items-center gap-2 ml-4 ${statusConfig[task.status].color}`}>
                  <StatusIcon className="w-5 h-5" />
                  <span className="text-xs capitalize">{task.status}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
