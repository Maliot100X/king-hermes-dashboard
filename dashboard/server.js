const { WebSocketServer } = require('ws');
const { spawn, exec } = require('child_process');
const { readFile } = require('fs/promises');
const path = require('path');

const PORT = parseInt(process.env.WS_PORT || '8080');
const HOST = process.env.WS_HOST || '0.0.0.0';

// Store logs and tasks in memory
const logs = [];
const runningTasks = new Map(); // taskId -> { process, output, agent }

// Agent definitions with their actual spawn commands
const agents = [
  { 
    id: 'king-hermes', 
    name: 'hermes', 
    displayName: 'King Hermes',
    // King Hermes uses the hermes CLI or executes directly
    spawnCmd: (task) => ({ cmd: 'bash', args: ['-c', task] })
  },
  { 
    id: 'opencode', 
    name: 'opencode', 
    displayName: 'OpenCode',
    spawnCmd: (task) => ({ 
      cmd: 'bash', 
      args: ['-c', `cd ~ && which opencode && opencode --task "${task.replace(/"/g, '\\"')}" 2>&1 || echo "OpenCode not installed - would run: ${task}"`] 
    })
  },
  { 
    id: 'gemini', 
    name: 'gemini', 
    displayName: 'Gemini',
    spawnCmd: (task) => ({ 
      cmd: 'bash', 
      args: ['-c', `which gemini && gemini "${task.replace(/"/g, '\\"')}" 2>&1 || echo "Gemini not installed - would run: ${task}"`] 
    })
  },
  { 
    id: 'claude', 
    name: 'claude', 
    displayName: 'Claude',
    spawnCmd: (task) => ({ 
      cmd: 'bash', 
      args: ['-c', `which claude && echo "${task.replace(/"/g, '\\"')}" | claude 2>&1 || echo "Claude not installed - would run: ${task}"`] 
    })
  },
  { 
    id: 'roo', 
    name: 'roo', 
    displayName: 'Roo',
    spawnCmd: (task) => ({ 
      cmd: 'bash', 
      args: ['-c', `which roo && roo --task "${task.replace(/"/g, '\\"')}" 2>&1 || echo "Roo not installed - would run: ${task}"`] 
    })
  },
  { 
    id: 'openclaw', 
    name: 'openclaw', 
    displayName: 'OpenClaw',
    spawnCmd: (task) => ({ 
      cmd: 'bash', 
      args: ['-c', `cd /workspace/supreme-agent && ./openclaw-launcher.sh "${task.replace(/"/g, '\\"')}" 2>&1 || echo "OpenClaw launcher failed - would run: ${task}"`] 
    })
  },
];

// Add a log entry
function addLog(type, message, agent, details = null) {
  const log = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
    type,
    message,
    agent,
    details,
  };
  logs.unshift(log);
  if (logs.length > 1000) logs.pop();
  console.log(`[${type.toUpperCase()}] ${agent}: ${message}`);
  return log;
}

// Parse /proc/stat for CPU
async function getCPU() {
  try {
    const stat = await readFile('/proc/stat', 'utf8');
    const cpuLine = stat.split('\n')[0];
    const values = cpuLine.split(/\s+/).slice(1).map(Number);
    
    const user = values[0] || 0;
    const nice = values[1] || 0;
    const system = values[2] || 0;
    const idle = values[3] || 0;
    const total = user + nice + system + idle;
    const percentage = total > 0 ? ((user + nice + system) / total) * 100 : 0;

    const loadavg = await readFile('/proc/loadavg', 'utf8');
    const [min1, min5, min15] = loadavg.split(' ').map(Number);

    return {
      percentage: Math.round(percentage * 100) / 100,
      loadAverage: { '1min': min1 || 0, '5min': min5 || 0, '15min': min15 || 0 },
    };
  } catch (err) {
    return { percentage: 0, loadAverage: { '1min': 0, '5min': 0, '15min': 0 } };
  }
}

// Parse /proc/meminfo for Memory
async function getMemory() {
  try {
    const meminfo = await readFile('/proc/meminfo', 'utf8');
    const lines = meminfo.split('\n');
    
    const totalMatch = lines.find(l => l.startsWith('MemTotal:'));
    const availMatch = lines.find(l => l.startsWith('MemAvailable:'));

    const totalKB = parseInt(totalMatch?.split(/\s+/)[1] || '0');
    const availKB = parseInt(availMatch?.split(/\s+/)[1] || '0');
    
    const totalGB = totalKB / 1024 / 1024;
    const usedGB = (totalKB - availKB) / 1024 / 1024;
    const percentage = totalKB > 0 ? ((totalKB - availKB) / totalKB) * 100 : 0;

    return {
      percentage: Math.round(percentage * 100) / 100,
      usedGB: usedGB.toFixed(2),
      totalGB: totalGB.toFixed(2),
    };
  } catch (err) {
    return { percentage: 0, usedGB: '0', totalGB: '0' };
  }
}

// Get Disk usage
async function getDisk() {
  try {
    const { stdout } = await new Promise((resolve, reject) => {
      exec('df -h / | tail -1', (err, stdout) => {
        if (err) reject(err);
        else resolve({ stdout });
      });
    });
    const parts = stdout.trim().split(/\s+/);
    const size = parts[1] || '0';
    const used = parts[2] || '0';
    const usePercent = parts[4] || '0%';
    const percentage = parseInt(usePercent.replace('%', '')) || 0;

    return { percentage, used, size };
  } catch (err) {
    return { percentage: 0, used: '0', size: '0' };
  }
}

// Check agent processes
async function checkAgent(agent) {
  try {
    const { stdout } = await new Promise((resolve, reject) => {
      exec(`ps aux | grep -E "${agent.name}|${agent.id}" | grep -v grep | head -1`, (err, stdout) => {
        if (err) reject(err);
        else resolve({ stdout });
      });
    });
    
    if (stdout && (stdout.includes(agent.name) || stdout.includes(agent.id))) {
      const parts = stdout.trim().split(/\s+/);
      const pid = parseInt(parts[1]) || undefined;
      const cpu = parseFloat(parts[2]) || 0;
      const memory = parseFloat(parts[3]) || 0;

      // Check if agent has running tasks
      const hasTask = Array.from(runningTasks.values()).some(t => t.agent === agent.id);

      return {
        id: agent.id,
        name: agent.name,
        displayName: agent.displayName,
        status: hasTask ? 'busy' : 'online',
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

// Execute a real task
function executeTask(taskId, agentId, task, wsClients) {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) {
    console.error(`[Error] Unknown agent: ${agentId}`);
    return null;
  }

  console.log(`[Task] Spawning ${agentId}: ${task}`);
  
  // Add start log
  const startLog = addLog('info', `Starting task: ${task}`, agentId);
  broadcast(wsClients, { type: 'log', data: startLog });

  // Get spawn command
  const { cmd, args } = agent.spawnCmd(task);
  
  // Spawn the process
  const child = spawn(cmd, args, {
    cwd: process.env.HOME || '/root',
    env: { ...process.env, PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin' },
    detached: false,
  });

  let output = '';
  let errorOutput = '';

  // Store task info
  runningTasks.set(taskId, {
    process: child,
    agent: agentId,
    task,
    startTime: Date.now(),
    output: '',
    status: 'running',
  });

  // Stream stdout
  child.stdout.on('data', (data) => {
    const chunk = data.toString();
    output += chunk;
    
    // Update task output
    const taskInfo = runningTasks.get(taskId);
    if (taskInfo) {
      taskInfo.output = output;
    }

    // Broadcast to all clients
    broadcast(wsClients, {
      type: 'task_output',
      taskId,
      chunk,
      agent: agentId,
    });
  });

  // Stream stderr
  child.stderr.on('data', (data) => {
    const chunk = data.toString();
    errorOutput += chunk;
    output += `[stderr] ${chunk}`;
    
    const taskInfo = runningTasks.get(taskId);
    if (taskInfo) {
      taskInfo.output = output;
    }

    broadcast(wsClients, {
      type: 'task_output',
      taskId,
      chunk: `[stderr] ${chunk}`,
      agent: agentId,
    });
  });

  // Task completed
  child.on('close', (code) => {
    const duration = ((Date.now() - runningTasks.get(taskId)?.startTime) / 1000).toFixed(1);
    
    console.log(`[Task] ${agentId} completed with code ${code} (${duration}s)`);
    
    // Update task status
    const taskInfo = runningTasks.get(taskId);
    if (taskInfo) {
      taskInfo.status = code === 0 ? 'completed' : 'failed';
      taskInfo.exitCode = code;
      taskInfo.duration = duration;
    }

    // Broadcast completion
    broadcast(wsClients, {
      type: 'task_complete',
      taskId,
      agent: agentId,
      exitCode: code,
      output,
      duration,
    });

    // Add completion log
    const completeLog = addLog(
      code === 0 ? 'success' : 'error',
      `Task ${code === 0 ? 'completed' : 'failed'} (${duration}s)`,
      agentId,
      { task, exitCode: code, output: output.slice(0, 500) }
    );
    broadcast(wsClients, { type: 'log', data: completeLog });

    // Clean up after 5 minutes
    setTimeout(() => {
      runningTasks.delete(taskId);
    }, 300000);
  });

  // Handle errors
  child.on('error', (err) => {
    console.error(`[Task] ${agentId} error:`, err);
    
    broadcast(wsClients, {
      type: 'task_error',
      taskId,
      error: err.message,
      agent: agentId,
    });

    const errorLog = addLog('error', `Task error: ${err.message}`, agentId);
    broadcast(wsClients, { type: 'log', data: errorLog });
    
    runningTasks.delete(taskId);
  });

  return child;
}

// Broadcast to all clients
function broadcast(clients, data) {
  const msg = JSON.stringify(data);
  let sent = 0;
  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(msg);
      sent++;
    }
  });
  return sent;
}

// WebSocket Server
console.log('='.repeat(60));
console.log('  KING HERMES WEBSOCKET SERVER - FULL LIVE MODE');
console.log('='.repeat(60));
console.log(`Host: ${HOST} | Port: ${PORT}`);
console.log(`Agents: ${agents.map(a => a.id).join(', ')}`);
console.log('='.repeat(60));

const wss = new WebSocketServer({ 
  host: HOST,
  port: PORT,
  verifyClient: () => true,
});

const clients = new Set();

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`[+] Client connected: ${clientIp}`);
  clients.add(ws);

  // Send welcome
  ws.send(JSON.stringify({ 
    type: 'connection', 
    status: 'connected',
    server: 'King Hermes Supreme Dashboard v2.0',
    timestamp: new Date().toISOString(),
  }));

  // Send recent logs
  const recentLogs = logs.slice(0, 50);
  recentLogs.forEach(log => {
    ws.send(JSON.stringify({ type: 'log', data: log }));
  });

  // Send running tasks
  runningTasks.forEach((taskInfo, taskId) => {
    ws.send(JSON.stringify({
      type: 'task_start',
      taskId,
      agent: taskInfo.agent,
      task: taskInfo.task,
      startTime: new Date(taskInfo.startTime).toISOString(),
      status: taskInfo.status,
    }));
  });

  // Send initial data
  Promise.all([
    getCPU(),
    getMemory(),
    getDisk(),
    Promise.all(agents.map((agent) => checkAgent(agent)))
  ]).then(([cpu, memory, disk, agentStatuses]) => {
    ws.send(JSON.stringify({ type: 'system_metrics', data: { cpu, memory, disk } }));
    ws.send(JSON.stringify({ type: 'agent_status', agents: agentStatuses }));
  });

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      console.log(`[RX] ${clientIp}: ${msg.type}`);

      // SPAWN AGENT - Execute real command
      if (msg.type === 'spawn_agent') {
        const { agent, task } = msg;
        const taskId = Date.now().toString();
        
        console.log(`[Command] Spawning ${agent}: ${task}`);
        
        // Broadcast task start
        broadcast(clients, {
          type: 'task_start',
          taskId,
          agent,
          task,
          startTime: new Date().toISOString(),
          status: 'running',
        });

        // Execute the task
        executeTask(taskId, agent, task, clients);
      }

      // CHAT - respond with AI
      if (msg.type === 'chat') {
        const userMsg = msg.content || '';
        console.log(`[Chat] User: ${userMsg}`);
        
        // Add user message as log
        const userLog = addLog('info', `User: ${userMsg}`, 'User');
        broadcast(clients, { type: 'log', data: userLog });

        // Generate response
        let response = '';
        const lowerMsg = userMsg.toLowerCase();
        
        if (lowerMsg.includes('status')) {
          const cpu = await getCPU();
          const mem = await getMemory();
          response = `System Status: CPU ${cpu.percentage.toFixed(1)}%, Memory ${mem.percentage.toFixed(1)}%. All systems operational. 👑`;
        } else if (lowerMsg.includes('agent') || lowerMsg.includes('bot')) {
          const statuses = await Promise.all(agents.map(checkAgent));
          const online = statuses.filter(a => a.status === 'online' || a.status === 'busy').length;
          response = `Agents Status: ${online}/${agents.length} agents active. King Hermes is monitoring all systems.`;
        } else if (lowerMsg.includes('task') || lowerMsg.includes('running')) {
          const taskCount = runningTasks.size;
          response = taskCount > 0 
            ? `Currently ${taskCount} task(s) running. Check the Tasks tab for details.`
            : `No tasks currently running. Spawn agents from the Agents tab to create tasks.`;
        } else if (lowerMsg.includes('help')) {
          response = `I am King Hermes, your Supreme Agent Orchestrator.\n\nCommands I understand:\n• status - Check system metrics\n• agents - List agent statuses\n• tasks - Show running tasks\n• spawn <agent> <task> - Spawn an agent (or use Agents tab)\n• help - Show this message\n\nHow may I serve you? 👑`;
        } else if (lowerMsg.startsWith('spawn ')) {
          const parts = userMsg.split(' ');
          if (parts.length >= 3) {
            const agentName = parts[1];
            const taskCmd = parts.slice(2).join(' ');
            response = `Spawning ${agentName} with task: ${taskCmd}\nCheck the Tasks tab to see execution.`;
            
            // Actually spawn the task
            const taskId = Date.now().toString();
            broadcast(clients, {
              type: 'task_start',
              taskId,
              agent: agentName,
              task: taskCmd,
              startTime: new Date().toISOString(),
              status: 'running',
            });
            executeTask(taskId, agentName, taskCmd, clients);
          } else {
            response = `Usage: spawn <agent> <task>\nExample: spawn king-hermes "ls -la"`;
          }
        } else {
          response = `I received: "${userMsg}"\n\nI am King Hermes, orchestrating your multi-agent system.\n\nType "help" for available commands, or use the Agents tab to spawn tasks directly. 👑`;
        }

        // Send response
        setTimeout(() => {
          const responseLog = addLog('success', `King Hermes: ${response}`, 'king-hermes');
          broadcast(clients, { type: 'log', data: responseLog });
          
          broadcast(clients, {
            type: 'chat_response',
            data: {
              id: Date.now().toString(),
              from: 'King Hermes',
              content: response,
              timestamp: new Date().toISOString(),
            },
          });
        }, 500);
      }

      // Get full state
      if (msg.type === 'get_full_state') {
        const [cpu, memory, disk, agentStatuses] = await Promise.all([
          getCPU(),
          getMemory(),
          getDisk(),
          Promise.all(agents.map((agent) => checkAgent(agent)))
        ]);
        
        ws.send(JSON.stringify({ type: 'system_metrics', data: { cpu, memory, disk } }));
        ws.send(JSON.stringify({ type: 'agent_status', agents: agentStatuses }));
        
        // Send all running tasks
        const tasks = [];
        runningTasks.forEach((info, id) => {
          tasks.push({
            id,
            agent: info.agent,
            task: info.task,
            status: info.status,
            startTime: new Date(info.startTime).toISOString(),
            output: info.output,
          });
        });
        ws.send(JSON.stringify({ type: 'full_state', data: { tasks, logs: logs.slice(0, 50) } }));
      }
    } catch (err) {
      console.error('[Error] Message handling:', err);
    }
  });

  ws.on('close', () => {
    console.log(`[-] Client disconnected: ${clientIp}`);
    clients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error(`[Error] ${clientIp}:`, err.message);
    clients.delete(ws);
  });
});

// Periodic updates - EVERY 2 SECONDS
let updateCount = 0;
setInterval(async () => {
  try {
    const [cpu, memory, disk, agentStatuses] = await Promise.all([
      getCPU(),
      getMemory(),
      getDisk(),
      Promise.all(agents.map((agent) => checkAgent(agent)))
    ]);

    // Broadcast metrics
    broadcast(clients, { type: 'system_metrics', data: { cpu, memory, disk } });
    
    // Broadcast agents
    broadcast(clients, { type: 'agent_status', agents: agentStatuses });
    
    // Send heartbeat log every 10 updates (20 seconds)
    if (++updateCount % 10 === 0) {
      const onlineCount = agentStatuses.filter(a => a.status === 'online' || a.status === 'busy').length;
      const log = addLog('info', `Heartbeat | CPU: ${cpu.percentage.toFixed(1)}% | Mem: ${memory.percentage.toFixed(1)}% | Agents: ${onlineCount}/${agents.length} active`);
      broadcast(clients, { type: 'log', data: log });
    }

  } catch (err) {
    console.error('[Error] Periodic update:', err.message);
  }
}, 2000);

console.log(`\n✅ WebSocket Server RUNNING on ws://${HOST}:${PORT}`);
console.log(`🔗 Dashboard: http://194.195.215.135:3000`);
console.log(`📊 Real-time data every 2 seconds`);
console.log(`💬 Chat with AI responses`);
console.log(`🤖 REAL command execution enabled`);
console.log(`⚡ Output streaming to dashboard\n`);
