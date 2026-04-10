import { WebSocketServer, WebSocket } from 'ws';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';

const execAsync = promisify(exec);

// Types matching frontend
interface AgentStatus {
  id: string;
  name: string;
  displayName: string;
  status: 'online' | 'offline' | 'busy';
  cpu: number;
  memory: number;
  pid?: number;
  currentTask?: string;
  lastOutput?: string;
}

interface SystemMetrics {
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

// Agent definitions
const agents = [
  { id: 'king-hermes', name: 'king-hermes', displayName: 'King Hermes' },
  { id: 'opencode', name: 'opencode', displayName: 'OpenCode' },
  { id: 'gemini', name: 'gemini', displayName: 'Gemini' },
  { id: 'claude', name: 'claude', displayName: 'Claude' },
  { id: 'roo', name: 'roo', displayName: 'Roo' },
  { id: 'openclaw', name: 'openclaw', displayName: 'OpenClaw' },
];

// Parse /proc/stat for CPU
async function getCPU(): Promise<SystemMetrics['cpu']> {
  try {
    const stat = await readFile('/proc/stat', 'utf8');
    const cpuLine = stat.split('\n')[0];
    const values = cpuLine.split(/\s+/).slice(1).map(Number);
    
    // Calculate percentage from user, nice, system, idle
    const user = values[0] || 0;
    const nice = values[1] || 0;
    const system = values[2] || 0;
    const idle = values[3] || 0;
    const total = user + nice + system + idle;
    const percentage = total > 0 ? ((user + nice + system) / total) * 100 : 0;

    // Get load average
    const loadavg = await readFile('/proc/loadavg', 'utf8');
    const [min1, min5, min15] = loadavg.split(' ').map(Number);

    return {
      percentage: Math.round(percentage * 100) / 100,
      loadAverage: {
        '1min': min1 || 0,
        '5min': min5 || 0,
        '15min': min15 || 0,
      },
    };
  } catch (err) {
    console.error('Error reading CPU:', err);
    return { percentage: 0, loadAverage: { '1min': 0, '5min': 0, '15min': 0 } };
  }
}

// Parse /proc/meminfo for Memory
async function getMemory(): Promise<SystemMetrics['memory']> {
  try {
    const meminfo = await readFile('/proc/meminfo', 'utf8');
    const lines = meminfo.split('\n');
    
    const totalMatch = lines.find(l => l.startsWith('MemTotal:'));
    const freeMatch = lines.find(l => l.startsWith('MemFree:'));
    const availMatch = lines.find(l => l.startsWith('MemAvailable:'));

    const totalKB = parseInt(totalMatch?.split(/\s+/)[1] || '0');
    const availKB = parseInt(availMatch?.split(/\s+/)[1] || freeMatch?.split(/\s+/)[1] || '0');
    
    const totalGB = totalKB / 1024 / 1024;
    const usedGB = (totalKB - availKB) / 1024 / 1024;
    const percentage = totalKB > 0 ? ((totalKB - availKB) / totalKB) * 100 : 0;

    return {
      percentage: Math.round(percentage * 100) / 100,
      usedGB: usedGB.toFixed(2),
      totalGB: totalGB.toFixed(2),
    };
  } catch (err) {
    console.error('Error reading Memory:', err);
    return { percentage: 0, usedGB: '0', totalGB: '0' };
  }
}

// Get Disk usage via df
async function getDisk(): Promise<SystemMetrics['disk']> {
  try {
    const { stdout } = await execAsync('df -h / | tail -1');
    const parts = stdout.trim().split(/\s+/);
    // Output: Filesystem Size Used Avail Use% Mounted
    const size = parts[1] || '0';
    const used = parts[2] || '0';
    const usePercent = parts[4] || '0%';
    const percentage = parseInt(usePercent.replace('%', '')) || 0;

    return { percentage, used, size };
  } catch (err) {
    console.error('Error reading Disk:', err);
    return { percentage: 0, used: '0', size: '0' };
  }
}

// Check agent processes via ps
async function checkAgent(agent: typeof agents[0]): Promise<AgentStatus> {
  try {
    const { stdout } = await execAsync(`ps aux | grep "[${agent.name[0]}]${agent.name.slice(1)}" | head -1`);
    
    if (stdout && stdout.includes(agent.name)) {
      const parts = stdout.trim().split(/\s+/);
      const pid = parseInt(parts[1]) || undefined;
      const cpu = parseFloat(parts[2]) || 0;
      const memory = parseFloat(parts[3]) || 0;

      return {
        id: agent.id,
        name: agent.name,
        displayName: agent.displayName,
        status: 'online',
        cpu,
        memory,
        pid,
      };
    }
  } catch (err) {
    // Agent not running
  }

  return {
    id: agent.id,
    name: agent.name,
    displayName: agent.displayName,
    status: 'offline',
    cpu: 0,
    memory: 0,
  };
}

// WebSocket Server
export function startWebSocketServer(port: number = 8080) {
  const wss = new WebSocketServer({ port });
  const clients = new Set<WebSocket>();

  console.log(`[WebSocket] Server started on ws://localhost:${port}`);

  wss.on('connection', (ws) => {
    console.log('[WebSocket] Client connected');
    clients.add(ws);

    // Send initial state
    ws.send(JSON.stringify({ type: 'connection', status: 'connected' }));

    // Handle messages
    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data.toString());
        console.log('[WebSocket] Received:', msg.type);

        if (msg.type === 'spawn_agent') {
          // Handle agent spawn
          ws.send(JSON.stringify({
            type: 'log',
            data: {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              type: 'info',
              message: `Requested to spawn ${msg.agent}`,
            },
          }));
        }

        if (msg.type === 'chat') {
          ws.send(JSON.stringify({
            type: 'log',
            data: {
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              type: 'info',
              message: `Chat received: ${msg.content}`,
            },
          }));
        }
      } catch (err) {
        console.error('[WebSocket] Error handling message:', err);
      }
    });

    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected');
      clients.delete(ws);
    });

    ws.on('error', (err) => {
      console.error('[WebSocket] Error:', err);
      clients.delete(ws);
    });
  });

  // Broadcast to all clients
  function broadcast(data: any) {
    const msg = JSON.stringify(data);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }

  // Periodic data updates
  setInterval(async () => {
    try {
      // System metrics
      const [cpu, memory, disk] = await Promise.all([
        getCPU(),
        getMemory(),
        getDisk(),
      ]);

      broadcast({
        type: 'system_metrics',
        data: { cpu, memory, disk },
      });

      // Agent statuses
      const agentStatuses = await Promise.all(
        agents.map((agent) => checkAgent(agent))
      );

      broadcast({
        type: 'agent_status',
        agents: agentStatuses,
      });

      // Log heartbeat
      broadcast({
        type: 'log',
        data: {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: 'info',
          message: `Metrics updated - CPU: ${cpu.percentage.toFixed(1)}% | Mem: ${memory.percentage.toFixed(1)}%`,
        },
      });
    } catch (err) {
      console.error('[WebSocket] Error in periodic update:', err);
    }
  }, 2000); // Update every 2 seconds

  return wss;
}
