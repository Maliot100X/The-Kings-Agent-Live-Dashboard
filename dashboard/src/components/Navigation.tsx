'use client';

import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Bot,
  Workflow,
  MessageSquare,
  BarChart3,
  Settings,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'workflows', label: 'Workflows', icon: Workflow },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'metrics', label: 'Metrics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed left-0 top-0 h-screen w-64 bg-dark-800 border-r border-dark-600 z-50"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Agent Swarm</h1>
            <p className="text-xs text-supreme-400">Supreme Dashboard</p>
          </div>
        </div>

        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-supreme-600 text-white shadow-lg shadow-supreme-500/20'
                    : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'text-neon-blue')} />
                <span className="font-medium">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-blue"
                  />
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-dark-600">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center">
              <span className="text-white font-bold">KH</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-neon-green rounded-full border-2 border-dark-800" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">King Hermes</p>
            <p className="text-xs text-neon-green">Online</p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
