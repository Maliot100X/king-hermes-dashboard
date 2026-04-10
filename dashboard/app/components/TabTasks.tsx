'use client';

import { useRef, useEffect } from 'react';
import { Play, CheckCircle, XCircle, Clock, Terminal } from 'lucide-react';
import { Task } from '../hooks/useWebSocket';
import gsap from 'gsap';

interface Props {
  tasks: Task[];
}

export default function TabTasks({ tasks }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && tasks.length > 0) {
      gsap.fromTo(
        containerRef.current.firstElementChild,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [tasks]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-emerald/30 bg-emerald/5';
      case 'failed':
        return 'border-red-500/30 bg-red-500/5';
      default:
        return 'border-yellow-500/30 bg-yellow-500/5';
    }
  };

  return (
    <div ref={containerRef} className="space-y-4">
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <Terminal className="w-16 h-16 text-charcoal mx-auto mb-4" />
          <p className="text-slate text-lg">No tasks yet</p>
          <p className="text-parchment text-sm mt-2">
            Spawn agents from the Agents tab to see tasks here
          </p>
        </div>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className={`bg-carbon border rounded-lg p-4 transition-all duration-300 hover:border-emerald ${getStatusColor(
              task.status
            )}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(task.status)}
                <div>
                  <h4 className="text-snow font-semibold">{task.agent}</h4>
                  <p className="text-parchment text-sm truncate max-w-md">
                    {task.task}
                  </p>
                </div>
              </div>
              <span className="text-slate text-xs">
                {new Date(task.startTime).toLocaleTimeString()}
              </span>
            </div>

            {/* Output preview */}
            {task.output && (
              <div className="bg-abyss rounded-lg p-3 border border-charcoal mt-3">
                <pre className="text-xs text-parchment font-mono max-h-32 overflow-y-auto">
                  {task.output.length > 500
                    ? task.output.slice(-500) + '...'
                    : task.output}
                </pre>
              </div>
            )}

            {/* Footer info */}
            <div className="flex items-center justify-between mt-3 text-xs text-slate">
              <span>Status: {task.status}</span>
              {task.endTime && (
                <span>
                  Duration:{' '}
                  {Math.round(
                    (new Date(task.endTime).getTime() -
                      new Date(task.startTime).getTime()) /
                      1000
                  )}{' '}
                  seconds
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
