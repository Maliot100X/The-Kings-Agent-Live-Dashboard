'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { TabId, Agent } from '@/types';
import { AgentsTab } from './AgentsTab';
import { SystemTab } from './SystemTab';
import { TasksTab } from './TasksTab';
import { ChatTab } from './ChatTab';
import { LogsTab } from './LogsTab';
import { SettingsTab } from './SettingsTab';

interface TabContentProps {
  activeTab: TabId;
  agents: Agent[];
  tasks: any[];
  logs: any[];
  metrics: any;
  messages: any[];
  onSendMessage: (message: string) => void;
}

export function TabContent({
  activeTab,
  agents,
  tasks,
  logs,
  metrics,
  messages,
  onSendMessage,
}: TabContentProps) {
  const tabs: Record<TabId, React.ReactNode> = {
    agents: <AgentsTab agents={agents} />,
    system: <SystemTab metrics={metrics} />,
    tasks: <TasksTab tasks={tasks} />,
    chat: <ChatTab messages={messages} onSendMessage={onSendMessage} />,
    logs: <LogsTab logs={logs} />,
    settings: <SettingsTab />,
  };

  return (
    <div className="relative min-h-[500px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 overflow-y-auto"
        >
          {tabs[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
