'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Play, Square, Cpu, HardDrive, Clock, Terminal } from 'lucide-react';
import { AgentStatus, Task } from '../hooks/useWebSocket';
import { agents as agentConfig } from '../lib/design-system';
import gsap from 'gsap';

interface Props {
  agents: AgentStatus[];
  tasks: Task[];
  spawnAgent: (agent: string, task: string) => void;
}

export default function TabAgents({ agents, tasks, spawnAgent }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});

  // Stagger animation on mount
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.6,
          ease: 'power3.out',
        }
      );
    }
  }, []);

  const handleSpawn = (agentId: string) => {
    const task = taskInputs[agentId];
    if (!task || task.trim() === '') {
      console.log('[Spawn] No task entered for', agentId);
      return;
    }
    
    console.log('[Spawn] Executing', agentId + ':', task);
    spawnAgent(agentId, task);
    setTaskInputs((prev) => ({ ...prev, [agentId]: '' }));
    
    // Button press animation
    const btn = document.querySelector(`#btn-${agentId}`);
    if (btn) {
      gsap.to(btn, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  // Merge real agent data with config
  const mergedAgents = agentConfig.map((config) => {
    const realAgent = agents.find((a) => a.id === config.id || a.name === config.id);
    
    // Find running task for this agent
    const runningTask = tasks.find(t => t.agent === config.id && t.status === 'running');
    // Find most recent completed task
    const recentTasks = tasks.filter(t => t.agent === config.id && t.status !== 'running');
    const lastTask = recentTasks.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )[0];
    
    const activeTask = runningTask || lastTask;
    
    return {
      ...config,
      ...realAgent,
      status: runningTask ? 'busy' : (realAgent?.status as 'online' | 'offline' | 'busy') || 'offline',
      cpu: realAgent?.cpu || 0,
      memory: realAgent?.memory || 0,
      pid: realAgent?.pid,
      currentTask: runningTask?.task || undefined,
      lastOutput: activeTask?.output || undefined,
    };
  });

  return (
    <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mergedAgents.map((agent) => (
        <div
          key={agent.id}
          className="agent-card group relative bg-carbon border border-charcoal rounded-lg p-6 overflow-hidden transition-all duration-300 hover:border-emerald hover:shadow-emerald"
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
            style={{ backgroundColor: agent.color }}
          />

          {/* Header with Icon */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* ORIGINAL AGENT ICON */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-abyss border border-charcoal group-hover:border-[${agent.color}] transition-all duration-300">
                <Image
                  src={agent.icon}
                  alt={agent.displayName}
                  fill
                  className="object-contain p-2"
                />
              </div>
              
              <div>
                <h3
                  className="text-xl font-bold flex items-center gap-2"
                  style={{ color: agent.color }}
                >
                  {agent.displayName}
                  <span
                    className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)} ${
                      agent.status === 'busy' ? 'animate-pulse' : ''
                    }`}
                  />
                </h3>
                <p className="text-slate text-sm capitalize">{agent.status}</p>
                <p className="text-parchment text-xs mt-1">{agent.description}</p>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-abyss rounded-lg p-3 text-center border border-charcoal">
              <Cpu className="w-4 h-4 mx-auto mb-1 text-slate" />
              <span className="text-snow text-sm font-mono">{agent.cpu.toFixed(1)}%</span>
            </div>
            <div className="bg-abyss rounded-lg p-3 text-center border border-charcoal">
              <HardDrive className="w-4 h-4 mx-auto mb-1 text-slate" />
              <span className="text-snow text-sm font-mono">{agent.memory.toFixed(1)}%</span>
            </div>
            <div className="bg-abyss rounded-lg p-3 text-center border border-charcoal">
              <Clock className="w-4 h-4 mx-auto mb-1 text-slate" />
              <span className="text-snow text-xs font-mono">{agent.pid || '-'}</span>
            </div>
          </div>

          {/* Current Task */}
          {agent.currentTask && (
            <div className="mb-4 bg-emerald/10 border border-emerald/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-emerald text-sm mb-1">
                <Terminal className="w-4 h-4" />
                <span className="font-medium">Current Task</span>
              </div>
              <p className="text-snow text-xs truncate">{agent.currentTask}</p>
            </div>
          )}

          {/* Output Preview - LIVE */}
          <div className="mb-4 bg-abyss rounded-lg p-3 border border-charcoal h-24 overflow-y-auto font-mono text-xs">
            {agent.lastOutput ? (
              <pre className="text-parchment whitespace-pre-wrap">
                {agent.lastOutput.slice(-500)}
              </pre>
            ) : (
              <span className="text-slate italic">No output yet... Type a command below</span>
            )}
          </div>

          {/* Task Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={taskInputs[agent.id] || ''}
              onChange={(e) =>
                setTaskInputs({ ...taskInputs, [agent.id]: e.target.value })
              }
              placeholder={`Command ${agent.displayName}...`}
              className="flex-1 bg-abyss border border-charcoal rounded-lg px-4 py-2 text-sm text-snow placeholder-slate focus:outline-none focus:border-emerald transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handleSpawn(agent.id)}
            />
            <button
              id={`btn-${agent.id}`}
              onClick={() => handleSpawn(agent.id)}
              disabled={agent.status === 'busy'}
              className="bg-transparent border border-charcoal rounded-lg px-4 py-2 flex items-center gap-2 transition-all duration-200 hover:bg-emerald/10 hover:border-emerald disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: agent.status !== 'busy' ? agent.color : undefined,
              }}
            >
              {agent.status === 'busy' ? (
                <Square className="w-4 h-4 text-snow" />
              ) : (
                <Play className="w-4 h-4" style={{ color: agent.color }} />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
