'use client';

import { useState, useEffect, useRef } from 'react';
import type { SystemMetrics, ChartDataPoint } from '../lib/types';

interface MetricHistory {
  cpu: ChartDataPoint[];
  memory: ChartDataPoint[];
}

const MAX_HISTORY_POINTS = 60; // 60 data points = 5 minutes at 5-second intervals

export function useSystemMetrics(metrics: SystemMetrics | null): {
  history: MetricHistory;
  currentCpu: number;
  currentMemory: number;
  cpuTrend: 'up' | 'down' | 'stable';
  memoryTrend: 'up' | 'down' | 'stable';
} {
  const [history, setHistory] = useState<MetricHistory>({
    cpu: [],
    memory: [],
  });
  
  const prevMetricsRef = useRef<SystemMetrics | null>(null);

  useEffect(() => {
    if (!metrics) return;

    const now = Date.now();
    const timeLabel = new Date(now).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
    });

    setHistory(prev => {
      const newCpuPoint: ChartDataPoint = {
        timestamp: now,
        value: metrics.cpu.usage,
        label: timeLabel,
      };

      const newMemoryPoint: ChartDataPoint = {
        timestamp: now,
        value: metrics.memory.percentage,
        label: timeLabel,
      };

      return {
        cpu: [...prev.cpu.slice(-MAX_HISTORY_POINTS + 1), newCpuPoint],
        memory: [...prev.memory.slice(-MAX_HISTORY_POINTS + 1), newMemoryPoint],
      };
    });

    prevMetricsRef.current = metrics;
  }, [metrics]);

  // Calculate trends
  const cpuTrend: 'up' | 'down' | 'stable' = (() => {
    if (history.cpu.length < 2) return 'stable';
    const recent = history.cpu.slice(-5);
    if (recent.length < 2) return 'stable';
    const avg = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
    const prevAvg = history.cpu.slice(-10, -5).reduce((sum, p) => sum + p.value, 0) / 5;
    if (avg > prevAvg * 1.1) return 'up';
    if (avg < prevAvg * 0.9) return 'down';
    return 'stable';
  })();

  const memoryTrend: 'up' | 'down' | 'stable' = (() => {
    if (history.memory.length < 2) return 'stable';
    const recent = history.memory.slice(-5);
    if (recent.length < 2) return 'stable';
    const avg = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
    const prevAvg = history.memory.slice(-10, -5).reduce((sum, p) => sum + p.value, 0) / 5;
    if (avg > prevAvg * 1.05) return 'up';
    if (avg < prevAvg * 0.95) return 'down';
    return 'stable';
  })();

  return {
    history,
    currentCpu: metrics?.cpu.usage ?? 0,
    currentMemory: metrics?.memory.percentage ?? 0,
    cpuTrend,
    memoryTrend,
  };
}
