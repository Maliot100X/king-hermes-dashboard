'use client';

import { useRef, useEffect } from 'react';
import { Terminal, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { LogEntry } from '../hooks/useWebSocket';
import gsap from 'gsap';

interface Props {
  logs: LogEntry[];
}

export default function TabLogs({ logs }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && logs.length > 0) {
      const newLog = containerRef.current.firstElementChild;
      if (newLog) {
        gsap.fromTo(
          newLog,
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
      }
    }
  }, [logs]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-slate" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-emerald';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-slate';
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-abyss border border-charcoal rounded-lg p-4 h-[500px] overflow-y-auto font-mono text-sm"
    >
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-slate">
          <Terminal className="w-12 h-12 mb-4" />
          <p>No activity logs yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-2 rounded hover:bg-carbon/50 transition-colors"
            >
              {getIcon(log.type)}
              <span className="text-slate text-xs">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={getColor(log.type)}>
                [{log.type.toUpperCase()}]
              </span>
              {log.agent && (
                <span className="text-king-gold text-xs">[{log.agent}]</span>
              )}
              <span className="text-parchment">{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
