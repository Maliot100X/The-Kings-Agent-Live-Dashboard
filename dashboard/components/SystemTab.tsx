'use client';

import { motion } from 'framer-motion';
import { SystemMetric } from '@/types';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Cpu, MemoryStick, Activity, TrendingUp } from 'lucide-react';

interface SystemTabProps {
  metrics: SystemMetric;
}

// Generate sample historical data
const generateHistoryData = () => {
  const data = [];
  for (let i = 0; i < 20; i++) {
    data.push({
      time: `${i * 5}s`,
      cpu: 40 + Math.random() * 40,
      memory: 50 + Math.random() * 30,
    });
  }
  return data;
};

const taskDistribution = [
  { name: 'Completed', value: 134, color: '#4CAF50' },
  { name: 'Running', value: 16, color: '#2196F3' },
  { name: 'Pending', value: 3, color: '#FF9800' },
  { name: 'Failed', value: 3, color: '#f44336' },
];

export function SystemTab({ metrics }: SystemTabProps) {
  const historyData = generateHistoryData();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-king-gold text-glow">System Metrics</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-king-gold" />
            <div>
              <p className="text-sm text-gray-400">CPU Usage</p>
              <p className="text-2xl font-bold text-king-gold">{Math.round(metrics.cpu)}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <MemoryStick className="w-6 h-6 text-king-gold" />
            <div>
              <p className="text-sm text-gray-400">Memory</p>
              <p className="text-2xl font-bold text-king-gold">{Math.round(metrics.memory)}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-king-gold" />
            <div>
              <p className="text-sm text-gray-400">Active Agents</p>
              <p className="text-2xl font-bold text-king-gold">{metrics.activeAgents}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-king-gold" />
            <div>
              <p className="text-sm text-gray-400">Tasks/Min</p>
              <p className="text-2xl font-bold text-king-gold">24</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-lg p-4"
        >
          <h3 className="text-lg font-semibold text-king-gold mb-4">Resource Usage</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7B1FA2" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7B1FA2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={10} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #FFD700' }}
                labelStyle={{ color: '#FFD700' }}
              />
              <Area
                type="monotone"
                dataKey="cpu"
                stroke="#FFD700"
                fillOpacity={1}
                fill="url(#cpuGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="memory"
                stroke="#7B1FA2"
                fillOpacity={1}
                fill="url(#memGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-lg p-4"
        >
          <h3 className="text-lg font-semibold text-king-gold mb-4">Task Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={taskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {taskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #FFD700' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {taskDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-gray-300">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
