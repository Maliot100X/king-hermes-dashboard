'use client';

import { useRef, useEffect, useState } from 'react';
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
} from 'recharts';
import { Cpu, HardDrive, MemoryStick, Activity } from 'lucide-react';
import { SystemMetrics } from '../hooks/useWebSocket';
import gsap from 'gsap';

interface Props {
  metrics: SystemMetrics | null;
  isConnected: boolean;
}

// Generate initial empty data
const generateInitialData = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: new Date(Date.now() - (19 - i) * 2000).toLocaleTimeString(),
    cpu: 0,
    memory: 0,
  }));
};

export default function TabSystem({ metrics, isConnected }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState(generateInitialData());

  // Stagger animation on mount
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.6,
          ease: 'power3.out',
        }
      );
    }
  }, []);

  // Update history with new metrics
  useEffect(() => {
    if (metrics) {
      setHistory((prev) => {
        const newData = {
          time: new Date().toLocaleTimeString(),
          cpu: metrics.cpu.percentage,
          memory: metrics.memory.percentage,
        };
        return [...prev.slice(1), newData];
      });
    }
  }, [metrics]);

  const getStatusColor = (value: number) => {
    if (value < 50) return '#00d992';
    if (value < 80) return '#ff9f0a';
    return '#ff3b30';
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CPU Card */}
        <div className="bg-carbon border border-charcoal rounded-lg p-6 hover:border-emerald transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald/10 rounded-lg flex items-center justify-center">
                <Cpu className="w-6 h-6 text-emerald" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-snow">CPU Usage</h3>
                <p className="text-slate text-sm">
                  {metrics?.cpu.loadAverage?.['1min']?.toFixed(2) || '-'} load avg
                </p>
              </div>
            </div>
            <span
              className="text-3xl font-bold font-mono"
              style={{
                color: getStatusColor(metrics?.cpu.percentage || 0),
              }}
            >
              {metrics?.cpu.percentage || 0}%
            </span>
          </div>
          <div className="h-2 bg-abyss rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${metrics?.cpu.percentage || 0}%`,
                backgroundColor: getStatusColor(metrics?.cpu.percentage || 0),
              }}
            />
          </div>
        </div>

        {/* Memory Card */}
        <div className="bg-carbon border border-charcoal rounded-lg p-6 hover:border-emerald transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-mint/10 rounded-lg flex items-center justify-center">
                <MemoryStick className="w-6 h-6 text-mint" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-snow">Memory</h3>
                <p className="text-slate text-sm">
                  {metrics?.memory.usedGB || '-'} / {metrics?.memory.totalGB || '-'} GB
                </p>
              </div>
            </div>
            <span
              className="text-3xl font-bold font-mono"
              style={{
                color: getStatusColor(metrics?.memory.percentage || 0),
              }}
            >
              {metrics?.memory.percentage || 0}%
            </span>
          </div>
          <div className="h-2 bg-abyss rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${metrics?.memory.percentage || 0}%`,
                backgroundColor: getStatusColor(metrics?.memory.percentage || 0),
              }}
            />
          </div>
        </div>

        {/* Disk Card */}
        <div className="bg-carbon border border-charcoal rounded-lg p-6 hover:border-emerald transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-king-gold/10 rounded-lg flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-king-gold" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-snow">Disk Usage</h3>
                <p className="text-slate text-sm">
                  {metrics?.disk.used || '-'} / {metrics?.disk.size || '-'}
                </p>
              </div>
            </div>
            <span
              className="text-3xl font-bold font-mono"
              style={{
                color: getStatusColor(metrics?.disk.percentage || 0),
              }}
            >
              {metrics?.disk.percentage || 0}%
            </span>
          </div>
          <div className="h-2 bg-abyss rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${metrics?.disk.percentage || 0}%`,
                backgroundColor: getStatusColor(metrics?.disk.percentage || 0),
              }}
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU History Chart */}
        <div className="bg-carbon border border-charcoal rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-snow flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald" />
              CPU History
            </h3>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald animate-pulse' : 'bg-red-500'}`} />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d992" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d992" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3d3a39" />
                <XAxis dataKey="time" stroke="#8b949e" fontSize={12} />
                <YAxis stroke="#8b949e" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101010',
                    border: '1px solid #3d3a39',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f2f2f2' }}
                  itemStyle={{ color: '#00d992' }}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#00d992"
                  strokeWidth={2}
                  fill="url(#cpuGradient)"
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Memory History Chart */}
        <div className="bg-carbon border border-charcoal rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-snow flex items-center gap-2">
              <Activity className="w-5 h-5 text-mint" />
              Memory History
            </h3>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-mint animate-pulse' : 'bg-red-500'}`} />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2fd6a1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2fd6a1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#3d3a39" />
                <XAxis dataKey="time" stroke="#8b949e" fontSize={12} />
                <YAxis stroke="#8b949e" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101010',
                    border: '1px solid #3d3a39',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f2f2f2' }}
                  itemStyle={{ color: '#2fd6a1' }}
                />
                <Area
                  type="monotone"
                  dataKey="memory"
                  stroke="#2fd6a1"
                  strokeWidth={2}
                  fill="url(#memoryGradient)"
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-carbon border border-charcoal rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-emerald animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="text-snow font-medium">
            WebSocket Status: {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <span className="text-slate text-sm">
            {isConnected
              ? 'Real-time data from /proc'
              : 'Attempting to reconnect...'}
          </span>
        </div>
      </div>
    </div>
  );
}
