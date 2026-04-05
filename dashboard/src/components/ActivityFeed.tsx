'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Sparkles, Terminal, AlertCircle } from 'lucide-react';
import { cn, formatTimestamp } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'agent' | 'user' | 'system' | 'error';
  agentId?: string;
  agentName?: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

interface ActivityFeedProps {
  activities?: Activity[];
  isConnected?: boolean;
  maxItems?: number;
}

const defaultActivities: Activity[] = [
  {
    id: '1',
    type: 'system',
    message: 'Agent swarm initialized successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: '2',
    type: 'agent',
    agentId: 'agent-1',
    agentName: 'Code Agent',
    message: 'Completed task: API integration',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
  },
  {
    id: '3',
    type: 'agent',
    agentId: 'agent-2',
    agentName: 'Analyst',
    message: 'Analyzed 1,240 data points',
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
  },
  {
    id: '4',
    type: 'user',
    message: 'Requested workflow optimization',
    timestamp: new Date(Date.now() - 1000 * 60),
  },
  {
    id: '5',
    type: 'agent',
    agentId: 'agent-3',
    agentName: 'Researcher',
    message: 'Found 3 relevant resources',
    timestamp: new Date(),
  },
];

const typeConfig = {
  agent: { icon: Bot, color: 'text-neon-blue', bg: 'bg-neon-blue/10', border: 'border-neon-blue/30' },
  user: { icon: User, color: 'text-neon-purple', bg: 'bg-neon-purple/10', border: 'border-neon-purple/30' },
  system: { icon: Sparkles, color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/30' },
  error: { icon: AlertCircle, color: 'text-neon-pink', bg: 'bg-neon-pink/10', border: 'border-neon-pink/30' },
};

export function ActivityFeed({ activities = defaultActivities, isConnected = true, maxItems = 50 }: ActivityFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const displayActivities = activities.slice(-maxItems);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activities]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col h-[400px] bg-dark-800 rounded-xl border border-dark-600 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600 bg-dark-700/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-neon-blue" />
          <h3 className="font-semibold text-white">Activity Feed</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-xs px-2 py-1 rounded-full',
            isConnected ? 'bg-neon-green/20 text-neon-green' : 'bg-red-500/20 text-red-500'
          )}>
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
          <span className="text-xs text-gray-400">{displayActivities.length} events</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-transparent"
      >
        <AnimatePresence initial={false}>
          {displayActivities.map((activity, index) => {
            const config = typeConfig[activity.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border',
                  config.bg,
                  config.border
                )}
              >
                <div className={cn('mt-0.5', config.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {activity.agentName && (
                      <span className="text-xs font-medium text-white">
                        {activity.agentName}
                      </span>
                    )}
                    <span className={cn('text-xs', config.color)}>
                      {activity.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 break-words">{activity.message}</p>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {displayActivities.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Terminal className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No activity yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
