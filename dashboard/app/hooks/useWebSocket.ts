'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import gsap from 'gsap';

// Types
export interface AgentStatus {
  id: string;
  name: string;
  displayName: string;
  status: 'online' | 'offline' | 'busy';
  cpu: number;
  memory: number;
  pid?: number;
  currentTask?: string;
  lastOutput?: string;
  uptime?: string;
}

export interface SystemMetrics {
  cpu: {
    percentage: number;
    loadAverage: { '1min': number; '5min': number; '15min': number };
  };
  memory: {
    percentage: number;
    usedGB: string;
    totalGB: string;
  };
  disk: {
    percentage: number;
    used: string;
    size: string;
  };
}

export interface Task {
  id: string;
  agent: string;
  task: string;
  status: 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  output: string;
  exitCode?: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  agent?: string;
}

export interface ChatMessage {
  id: string;
  from: string;
  content: string;
  timestamp: string;
}

export function useWebSocket(customUrl?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;

  const wsUrl = customUrl || 'ws://194.195.215.135:8080';

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      console.log('[WebSocket] Connecting to:', wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WebSocket] Connected!');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        
        // Request full state
        ws.send(JSON.stringify({ type: 'get_full_state' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WebSocket] Received:', data.type);
          
          switch (data.type) {
            case 'connection':
              console.log('[WebSocket] Server:', data.server);
              break;
              
            case 'agent_status':
              setAgents(data.agents);
              break;
              
            case 'system_metrics':
              setMetrics(data.data);
              break;
              
            case 'log':
              setLogs((prev) => {
                const exists = prev.find(l => l.id === data.data.id);
                if (exists) return prev;
                return [data.data, ...prev].slice(0, 1000);
              });
              break;
              
            case 'full_state':
              if (data.data.tasks) {
                setTasks(data.data.tasks);
              }
              if (data.data.logs) {
                setLogs(data.data.logs);
              }
              break;
              
            case 'task_start':
              setTasks((prev) => {
                const exists = prev.find(t => t.id === data.taskId);
                if (exists) return prev;
                return [{
                  id: data.taskId,
                  agent: data.agent,
                  task: data.task,
                  status: 'running',
                  startTime: data.startTime,
                  output: '',
                }, ...prev];
              });
              break;
              
            case 'task_output':
              setTasks((prev) => {
                const index = prev.findIndex(t => t.id === data.taskId);
                if (index >= 0) {
                  const updated = [...prev];
                  updated[index] = {
                    ...updated[index],
                    output: updated[index].output + data.chunk,
                  };
                  return updated;
                }
                // If task not found, add it
                return [{
                  id: data.taskId,
                  agent: data.agent,
                  task: 'Running...',
                  status: 'running',
                  startTime: new Date().toISOString(),
                  output: data.chunk,
                }, ...prev];
              });
              break;
              
            case 'task_complete':
              setTasks((prev) => {
                const index = prev.findIndex(t => t.id === data.taskId);
                if (index >= 0) {
                  const updated = [...prev];
                  updated[index] = {
                    ...updated[index],
                    status: data.exitCode === 0 ? 'completed' : 'failed',
                    endTime: new Date().toISOString(),
                    output: data.output,
                    exitCode: data.exitCode,
                  };
                  return updated;
                }
                return prev;
              });
              break;

            case 'chat_response':
              setChatMessages((prev) => [...prev, data.data]);
              break;
          }
        } catch (err) {
          console.error('[WebSocket] Parse error:', err);
        }
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);
        
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(1.5, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            console.log(`[WebSocket] Reconnecting... (${reconnectAttemptsRef.current})`);
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        ws.close();
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WebSocket] Create error:', err);
    }
  }, [wsUrl]);

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendCommand = useCallback((cmd: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(cmd));
    } else {
      console.error('[WebSocket] Not connected');
    }
  }, []);

  const spawnAgent = useCallback((agent: string, task: string) => {
    console.log('[Command] Spawning', agent, 'with task:', task);
    sendCommand({ type: 'spawn_agent', agent, task });
  }, [sendCommand]);

  const sendChat = useCallback((content: string, agent?: string) => {
    console.log('[Chat] Sending:', content);
    // Add user message locally
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      from: 'You',
      content,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    // Send to server
    sendCommand({ type: 'chat', content, agent });
  }, [sendCommand]);

  return {
    isConnected,
    agents,
    metrics,
    tasks,
    logs,
    chatMessages,
    spawnAgent,
    sendChat,
  };
}
