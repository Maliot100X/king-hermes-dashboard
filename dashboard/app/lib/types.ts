// TypeScript interfaces - ZERO any types allowed

export type AgentId = 'king-hermes' | 'opencode' | 'gemini' | 'claude' | 'roo' | 'openclaw';

export type AgentStatus = 'online' | 'offline' | 'busy' | 'error';

export interface Agent {
  id: AgentId;
  name: string;
  displayName: string;
  status: AgentStatus;
  cpu: number;
  memory: number;
  pid: number | null;
  uptime: string;
  lastOutput: string;
  currentTask: string | null;
  version: string;
}

export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: string;
  loadAverage: number[];
  timestamp: number;
}

export interface Task {
  id: string;
  agentId: AgentId;
  command: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  output: string[];
  pid?: number;
  startTime: number;
  endTime?: number;
  exitCode?: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface ChatMessage {
  id: string;
  timestamp: number;
  from: AgentId | 'user' | 'system';
  to: AgentId | 'broadcast' | 'user';
  content: string;
  type: 'message' | 'command' | 'status' | 'error';
}

export interface WebSocketMessage {
  type: 'metrics' | 'agents' | 'tasks' | 'logs' | 'chat' | 'error' | 'ping' | 'pong';
  payload: unknown;
  timestamp: number;
}

export interface SpawnRequest {
  agent: AgentId;
  task: string;
  env?: Record<string, string>;
}

export interface Settings {
  wsUrl: string;
  theme: 'dark' | 'light';
  autoReconnect: boolean;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  agentPaths: Record<AgentId, string>;
}

// Chart data types
export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label: string;
}

export interface MetricHistory {
  cpu: ChartDataPoint[];
  memory: ChartDataPoint[];
  maxPoints: number;
}

// Animation types
export interface AnimationConfig {
  duration: number;
  ease: string;
  delay?: number;
  stagger?: number;
}

// Component prop types
export interface TabProps {
  isActive: boolean;
  onActivate: () => void;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
}
