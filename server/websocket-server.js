const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const { spawn, execSync } = require('child_process');

const clients = new Set();
const agentStatus = new Map([
  ['opencode', { status: 'offline', tasksCompleted: 0, currentTask: null, lastOutput: '', pid: null, color: '#00FF88', displayName: 'OpenCode' }],
  ['gemini', { status: 'offline', tasksCompleted: 0, currentTask: null, lastOutput: '', pid: null, color: '#4ECDC4', displayName: 'Gemini' }],
  ['claude', { status: 'offline', tasksCompleted: 0, currentTask: null, lastOutput: '', pid: null, color: '#FF6B6B', displayName: 'Claude' }],
  ['roo', { status: 'offline', tasksCompleted: 0, currentTask: null, lastOutput: '', pid: null, color: '#9B59B6', displayName: 'Roo' }]
]);

let activityLog = [];
let tasks = [];

function getCPUUsage() {
  try {
    const stat = fs.readFileSync('/proc/stat', 'utf8');
    const lines = stat.split('\n');
    const cpuLine = lines[0].split(' ').filter(x => x);
    const user = parseInt(cpuLine[1]) || 0;
    const nice = parseInt(cpuLine[2]) || 0;
    const system = parseInt(cpuLine[3]) || 0;
    const idle = parseInt(cpuLine[4]) || 0;
    const total = user + nice + system + idle;
    return total > 0 ? Math.round(((user + nice + system) / total) * 100) : 0;
  } catch (e) { return 0; }
}

function getMemoryInfo() {
  try {
    const mem = fs.readFileSync('/proc/meminfo', 'utf8');
    const lines = mem.split('\n');
    const totalMatch = lines[0].match(/MemTotal:\s+(\d+)/);
    const availMatch = lines[2].match(/MemAvailable:\s+(\d+)/);
    if (!totalMatch || !availMatch) return { percentage: 0, usedGB: '0.00', totalGB: '0.00' };
    const total = parseInt(totalMatch[1]) * 1024;
    const available = parseInt(availMatch[1]) * 1024;
    const used = total - available;
    return {
      percentage: Math.round((used / total) * 100),
      usedGB: (used / 1024 / 1024 / 1024).toFixed(2),
      totalGB: (total / 1024 / 1024 / 1024).toFixed(2)
    };
  } catch (e) { return { percentage: 0, usedGB: '0.00', totalGB: '0.00' }; }
}

function getDiskInfo() {
  try {
    const output = execSync('df -h /').toString();
    const lines = output.split('\n');
    const parts = lines[1].split(/\s+/);
    return { percentage: parseInt(parts[4]) || 0, size: parts[1], used: parts[2] };
  } catch (e) { return { percentage: 0, size: '0G', used: '0G' }; }
}

function checkAgentStatus() {
  const agents = [
    { name: 'opencode', displayName: 'OpenCode', cmd: 'opencode', color: '#00FF88' },
    { name: 'gemini', displayName: 'Gemini', cmd: 'gemini', color: '#4ECDC4' },
    { name: 'claude', displayName: 'Claude', cmd: 'claude', color: '#FF6B6B' },
    { name: 'roo', displayName: 'Roo', cmd: 'roo', color: '#9B59B6' }
  ];
  
  return agents.map(agent => {
    try {
      const output = execSync(`ps aux | grep ${agent.cmd} | grep -v grep`, { encoding: 'utf8', timeout: 5000 });
      const lines = output.trim().split('\n');
      const parts = lines[0].split(/\s+/);
      const pid = parseInt(parts[1]);
      const cpu = parseFloat(parts[2]) || 0;
      const memory = parseFloat(parts[3]) || 0;
      
      const current = agentStatus.get(agent.name);
      agentStatus.set(agent.name, { ...current, status: 'online', pid, cpu, memory });
      
      return { name: agent.name, displayName: agent.displayName, status: 'online', pid, cpu, memory, color: agent.color };
    } catch (e) {
      const current = agentStatus.get(agent.name);
      agentStatus.set(agent.name, { ...current, status: 'offline', pid: null });
      return { name: agent.name, displayName: agent.displayName, status: 'offline', color: agent.color };
    }
  });
}

function spawnAgent(agentType, task, ws) {
  const taskId = `task_${Date.now()}_${agentType}`;
  const currentStatus = agentStatus.get(agentType);
  agentStatus.set(agentType, { ...currentStatus, status: 'busy', currentTask: task.slice(0, 50) });
  
  const taskData = { id: taskId, agent: agentType, task, status: 'running', startTime: new Date().toISOString(), output: '' };
  tasks.unshift(taskData);
  
  ws.send(JSON.stringify({ type: 'task_start', taskId, agent: agentType, task }));

  let proc;
  if (agentType === 'gemini') {
    proc = spawn('/snap/bin/gemini', ['-p', task], { env: process.env });
  } else if (agentType === 'opencode') {
    proc = spawn('opencode', ['run', task], { env: process.env });
  } else if (agentType === 'claude') {
    const env = { ...process.env, ANTHROPIC_API_KEY: '', ANTHROPIC_AUTH_TOKEN: '', ANTHROPIC_MODEL: '', CLAUDE_CODE_USE_OPENAI: '1', OPENAI_BASE_URL: 'https://api.fireworks.ai/inference/v1', OPENAI_MODEL: 'accounts/fireworks/routers/kimi-k2p5-turbo' };
    if (process.env.OPENAI_API_KEY) env.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    proc = spawn('claude', ['-p', task], { env });
  } else if (agentType === 'roo') {
    proc = spawn('roo', ['-p', task], { env: process.env });
  }

  if (!proc) { ws.send(JSON.stringify({ type: 'task_error', taskId, error: 'Failed to spawn agent' })); return taskId; }

  let output = '';
  proc.stdout.on('data', (data) => {
    const chunk = data.toString();
    output += chunk;
    agentStatus.set(agentType, { ...agentStatus.get(agentType), lastOutput: output.slice(-200) });
    ws.send(JSON.stringify({ type: 'task_output', taskId, agent: agentType, chunk }));
    broadcast({ type: 'agent_output', agent: agentType, data: chunk });
  });

  proc.stderr.on('data', (data) => {
    const chunk = data.toString();
    if (!chunk.includes('WARNING') && !chunk.includes('Keychain')) {
      ws.send(JSON.stringify({ type: 'task_error', taskId, agent: agentType, chunk }));
    }
  });

  proc.on('close', (code) => {
    const current = agentStatus.get(agentType);
    agentStatus.set(agentType, { ...current, status: 'online', tasksCompleted: current.tasksCompleted + 1, currentTask: null, lastOutput: output.slice(-200) || 'Task completed', pid: null });
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex >= 0) { tasks[taskIndex].status = code === 0 ? 'completed' : 'failed'; tasks[taskIndex].endTime = new Date().toISOString(); tasks[taskIndex].output = output; }
    ws.send(JSON.stringify({ type: 'task_complete', taskId, agent: agentType, output, exitCode: code }));
  });

  return taskId;
}

function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach(client => { if (client.readyState === WebSocket.OPEN) client.send(message); });
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/api/metrics') { res.end(JSON.stringify({ system: { cpu: { percentage: getCPUUsage() }, memory: getMemoryInfo(), disk: getDiskInfo() }, agents: checkAgentStatus(), timestamp: Date.now() })); }
  else if (req.url === '/api/status') { res.end(JSON.stringify({ status: 'ok', clients: clients.size, agents: Array.from(agentStatus.entries()).map(([name, data]) => ({ name, ...data })), tasks: tasks.slice(0, 20), activityLog: activityLog.slice(0, 50) })); }
  else if (req.url === '/api/health') { res.end(JSON.stringify({ status: 'healthy', timestamp: Date.now() })); }
  else { res.end(JSON.stringify({ status: 'King Hermes WebSocket Server v2.0' })); }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);
  ws.send(JSON.stringify({ type: 'agent_status', agents: checkAgentStatus() }));
  ws.send(JSON.stringify({ type: 'system_metrics', data: { cpu: { percentage: getCPUUsage() }, memory: getMemoryInfo(), disk: getDiskInfo() } }));
  ws.send(JSON.stringify({ type: 'full_state', data: { tasks: tasks.slice(0, 20), activityLog: activityLog.slice(0, 50) } }));
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      if (message.type === 'spawn_agent') { spawnAgent(message.agent, message.task, ws); }
      else if (message.type === 'chat') { broadcast({ type: 'chat_message', from: 'user', content: message.content, timestamp: new Date().toISOString() }); }
      else if (message.type === 'ping') { ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() })); }
    } catch (e) { console.error('Error:', e); }
  });
  
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'system_metrics', data: { cpu: { percentage: getCPUUsage() }, memory: getMemoryInfo(), disk: getDiskInfo() } }));
      ws.send(JSON.stringify({ type: 'agent_status', agents: checkAgentStatus() }));
    }
  }, 2000);
  
  ws.on('close', () => { clients.delete(ws); clearInterval(interval); });
});

const PORT = process.env.WS_PORT || 8090;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`👑 King Hermes Dashboard Server v2.0`);
  console.log(`📊 API: http://0.0.0.0:${PORT}/api/metrics`);
  console.log(`🔌 WebSocket: ws://0.0.0.0:${PORT}`);
});
