'use client';

import { motion } from 'framer-motion';
import { Activity, Cpu, Zap, Users, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  isConnected: boolean;
  stats?: {
    activeAgents: number;
    totalTasks: number;
    messagesPerSecond: number;
    cpuUsage: number;
  };
}

export function Header({ isConnected, stats }: HeaderProps) {
  const defaultStats = {
    activeAgents: 5,
    totalTasks: 128,
    messagesPerSecond: 42,
    cpuUsage: 34,
    ...stats,
  };

  const statItems = [
    { label: 'Active Agents', value: defaultStats.activeAgents, icon: Users, color: 'text-neon-blue' },
    { label: 'Tasks', value: defaultStats.totalTasks, icon: Zap, color: 'text-neon-yellow' },
    { label: 'Msgs/sec', value: defaultStats.messagesPerSecond, icon: Activity, color: 'text-neon-green' },
    { label: 'CPU', value: `${defaultStats.cpuUsage}%`, icon: Cpu, color: 'text-neon-purple' },
  ];

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-64 right-0 h-16 bg-dark-800/80 backdrop-blur-md border-b border-dark-600 z-40"
    >
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm text-gray-400">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>

        <div className="flex items-center gap-6">
          {statItems.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2"
              >
                <Icon className={cn('w-4 h-4', stat.color)} />
                <div>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                  <p className="text-sm font-bold text-white">{stat.value}</p>
                </div>
              </motion.div>
            );
          })}

          <div className="flex items-center gap-2 pl-6 border-l border-dark-600">
            <div className={cn(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-neon-green animate-pulse' : 'bg-red-500'
            )} />
            <Wifi className={cn(
              'w-4 h-4',
              isConnected ? 'text-neon-green' : 'text-red-500'
            )} />
            <span className={cn(
              'text-sm font-medium',
              isConnected ? 'text-neon-green' : 'text-red-500'
            )}>
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
