'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Activity,
  Terminal,
  MessageSquare,
  Settings,
  BarChart3,
  Layers,
  Users,
  Cpu,
} from 'lucide-react';
import Scene3D from './components/Scene3D';
import TabAgents from './components/TabAgents';
import TabSystem from './components/TabSystem';
import TabTasks from './components/TabTasks';
import TabChat from './components/TabChat';
import TabLogs from './components/TabLogs';
import TabSettings from './components/TabSettings';
import FloatingBot from './components/FloatingBot';
import { useWebSocket } from './hooks/useWebSocket';
import gsap from 'gsap';

type Tab = 'agents' | 'system' | 'tasks' | 'chat' | 'logs' | 'settings';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('agents');
  const [wsUrl, setWsUrl] = useState(
    typeof window !== 'undefined' 
      ? (process.env.NEXT_PUBLIC_WS_URL || 'ws://194.195.215.135:8080')
      : 'ws://194.195.215.135:8080'
  );
  const [mounted, setMounted] = useState(false);

  const {
    isConnected,
    agents,
    metrics,
    tasks,
    logs,
    chatMessages,
    spawnAgent,
    sendChat,
  } = useWebSocket(wsUrl);

  // Prevent hydration mismatch for Three.js
  useEffect(() => {
    setMounted(true);
  }, []);

  // Page load animation
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      '.header-animate',
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 }
    )
      .fromTo(
        '.tab-animate',
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.4 },
        '-=0.4'
      )
      .fromTo(
        '.content-animate',
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 0.5 },
        '-=0.2'
      );
  }, []);

  const tabs = [
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'system', label: 'System', icon: Cpu },
    { id: 'tasks', label: 'Tasks', icon: Layers },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-abyss">
      {/* 3D Background */}
      {mounted && <Scene3D />}

      {/* Header */}
      <header className="header-animate fixed top-0 left-0 right-0 z-40 bg-abyss/80 backdrop-blur-xl border-b border-charcoal">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-king-gold to-yellow-600 flex items-center justify-center shadow-gold">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-king-gold to-yellow-200 bg-clip-text text-transparent">
                King Hermes
              </h1>
              <p className="text-xs text-slate tracking-wider">
                SUPREME AGENT ORCHESTRATOR v2.0
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`connection-status flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                isConnected
                  ? 'bg-emerald/10 border-emerald/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald animate-pulse' : 'bg-red-500'
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isConnected ? 'text-emerald' : 'text-red-500'
                }`}
              >
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="tab-animate fixed top-20 left-0 right-0 z-40 bg-abyss/60 backdrop-blur-lg border-b border-charcoal/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as Tab)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative whitespace-nowrap ${
                    isActive
                      ? 'text-emerald'
                      : 'text-slate hover:text-snow hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald to-mint"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="content-animate fixed top-36 left-0 right-0 bottom-0 z-30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full pb-24 overflow-y-auto scrollbar-hide"
            >
              {activeTab === 'agents' && (
                <TabAgents agents={agents} tasks={tasks} spawnAgent={spawnAgent} />
              )}
              {activeTab === 'system' && (
                <TabSystem metrics={metrics} isConnected={isConnected} />
              )}
              {activeTab === 'tasks' && <TabTasks tasks={tasks} />}
              {activeTab === 'chat' && <TabChat chatMessages={chatMessages} sendChat={sendChat} />}
              {activeTab === 'logs' && <TabLogs logs={logs} />}
              {activeTab === 'settings' && (
                <TabSettings wsUrl={wsUrl} setWsUrl={setWsUrl} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Bot */}
      <FloatingBot chatMessages={chatMessages} sendChat={sendChat} />
    </div>
  );
}
