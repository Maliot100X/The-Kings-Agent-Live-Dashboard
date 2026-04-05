'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scene } from './Scene';
import { TabBar } from './TabBar';
import { TabContent } from './TabContent';
import { FloatingKingBot } from './FloatingKingBot';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useWebSocket } from '@/hooks/useWebSocket';
import { TabId, Agent } from '@/types';
import { Crown, Wifi, WifiOff } from 'lucide-react';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('agents');
  const { isConnected } = useWebSocket('ws://localhost:8080');
  const {
    agents,
    tasks,
    logs,
    metrics,
    messages,
    addChatMessage,
  } = useDashboardData();

  const handleSendMessage = useCallback((message: string) => {
    // Add user message
    addChatMessage('user', message);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "As your sovereign orchestrator, I have noted your command. My agents are already processing your request.",
        "By my divine authority, I shall attend to this matter immediately. The system responds to my will.",
        "Your wish is my command. I am King Hermes, and I govern these digital realms with golden wisdom.",
        `I have analyzed your query about "${message}". The data flows through my networks as commanded.`,
        "My agents are executing your directive with precision befitting their sovereign lord.",
        "The system bends to my authority. Your request shall be fulfilled.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addChatMessage('assistant', randomResponse);
    }, 1000 + Math.random() * 1500);
  }, [addChatMessage]);

  const handleAgentClick = useCallback((agent: Agent) => {
    addChatMessage('system', `Selected agent: ${agent.name} (${agent.status})`);
    setActiveTab('agents');
  }, [addChatMessage]);

  const handleKingClick = useCallback(() => {
    addChatMessage('system', 'You have summoned the King!');
  }, [addChatMessage]);

  return (
    <div className="relative min-h-screen">
      {/* 3D Scene Background */}
      <Scene
        agents={agents}
        onAgentClick={handleAgentClick}
        onKingClick={handleKingClick}
      />

      {/* UI Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col p-4 md:p-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-king-gold to-orange-500 flex items-center justify-center glow-gold">
              <Crown className="w-6 h-6 text-king-dark" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-king-gold text-glow">
                King Hermes
              </h1>
              <p className="text-sm text-gray-400">Sovereign AI Orchestrator</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full glass ${
              isConnected ? 'text-green-400' : 'text-red-400'
            }`}>
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span className="text-sm">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span className="text-sm">Disconnected</span>
                </>
              )}
            </div>
          </div>
        </motion.header>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full">
          {/* Tab Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-6"
          >
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
          </motion.div>

          {/* Tab Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-strong rounded-2xl p-6 flex-1 min-h-[500px]"
          >
            <TabContent
              activeTab={activeTab}
              agents={agents}
              tasks={tasks}
              logs={logs}
              metrics={metrics}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center text-xs text-gray-500"
        >
          <p>King Hermes v2.0 • Next.js 14 • Three.js • WebSocket</p>
        </motion.footer>
      </div>

      {/* Floating King Bot */}
      <FloatingKingBot
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
