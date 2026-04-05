'use client';

import { motion } from 'framer-motion';
import { LogEntry } from '@/types';
import { Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface LogsTabProps {
  logs: LogEntry[];
}

const levelConfig = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
  error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
  success: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30' },
};

export function LogsTab({ logs }: LogsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-king-gold text-glow">System Logs</h2>
        <div className="flex gap-2">
          {Object.entries(levelConfig).map(([level, config]) => {
            const Icon = config.icon;
            return (
              <div key={level} className="flex items-center gap-1 text-xs text-gray-400">
                <Icon className={`w-3 h-3 ${config.color}`} />
                <span className="capitalize">{level}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {logs.map((log, index) => {
          const config = levelConfig[log.level];
          const Icon = config.icon;

          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`flex gap-3 p-3 rounded-lg ${config.bg} border ${config.border}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.color}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${config.color}`}>{log.message}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="px-2 py-0.5 rounded bg-gray-800/50">{log.source}</span>
                  {log.agentId && (
                    <span className="px-2 py-0.5 rounded bg-king-gold/10 text-king-gold">
                      Agent {log.agentId}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
