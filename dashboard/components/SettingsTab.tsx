'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Bell,
  Shield,
  Database,
  Globe,
  Zap,
  Save,
  RefreshCw,
} from 'lucide-react';

export function SettingsTab() {
  const [settings, setSettings] = useState({
    notifications: true,
    autoRefresh: true,
    darkMode: true,
    webSocketEnabled: true,
    debugMode: false,
    soundEffects: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const settingItems = [
    { key: 'notifications', icon: Bell, label: 'Notifications', description: 'Receive alerts for important events' },
    { key: 'autoRefresh', icon: RefreshCw, label: 'Auto Refresh', description: 'Automatically refresh dashboard data' },
    { key: 'webSocketEnabled', icon: Zap, label: 'WebSocket Connection', description: 'Real-time updates from server' },
    { key: 'debugMode', icon: Settings, label: 'Debug Mode', description: 'Show detailed debugging information' },
    { key: 'darkMode', icon: Globe, label: 'Dark Mode', description: 'Use dark theme for dashboard' },
    { key: 'soundEffects', icon: Shield, label: 'Sound Effects', description: 'Enable UI sound effects' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-king-gold" />
        <h2 className="text-2xl font-bold text-king-gold text-glow">Dashboard Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingItems.map((item, index) => {
          const Icon = item.icon;
          const isEnabled = settings[item.key as keyof typeof settings];

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-king-gold/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-king-gold" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-king-gold">{item.label}</h3>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleSetting(item.key as keyof typeof settings)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    isEnabled ? 'bg-king-gold' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                    animate={{ x: isEnabled ? 26 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-king-gold mb-4 flex items-center gap-2">
          <Database className="w-4 h-4" />
          System Configuration
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">WebSocket URL</label>
            <input
              type="text"
              defaultValue="ws://localhost:8080"
              className="w-full bg-gray-800/50 border border-king-gold/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-king-gold"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Refresh Interval (ms)</label>
            <input
              type="number"
              defaultValue="5000"
              className="w-full bg-gray-800/50 border border-king-gold/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-king-gold"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Max Log Entries</label>
            <input
              type="number"
              defaultValue="1000"
              className="w-full bg-gray-800/50 border border-king-gold/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-king-gold"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button className="flex items-center gap-2 px-4 py-2 bg-king-gold/20 border border-king-gold rounded-lg text-king-gold hover:bg-king-gold/30 transition-colors">
            <Save className="w-4 h-4" />
            Save Settings
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}
