'use client';

import { motion } from 'framer-motion';
import { TabId } from '@/types';
import { Users, Activity, ListTodo, MessageSquare, ScrollText, Settings } from 'lucide-react';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'agents', label: 'Agents', icon: Users },
  { id: 'system', label: 'System', icon: Activity },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'logs', label: 'Logs', icon: ScrollText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="glass rounded-full px-2 py-2 flex items-center gap-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
              isActive
                ? 'text-king-dark'
                : 'text-gray-400 hover:text-king-gold hover:bg-king-gold/10'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-king-gold rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
