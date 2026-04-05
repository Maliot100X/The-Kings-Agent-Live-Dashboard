const WebSocket = require('ws');
const http = require('http');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const https = require('https');

// Configuration
const PORT = 8080;
const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY || 'fw_SW2LkiVRsBt4mH4Qwk9Swf';
const FIREWORKS_API_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';
const FIREWORKS_MODEL = 'accounts/fireworks/routers/kimi-k2p5-turbo';

// Store active agent processes
const activeAgents = new Map();

// Create HTTP server for API endpoints
const httpServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/api/health') {
    res.end(JSON.stringify({ status: 'ok', king: 'hermes' }));
  } else if (req.url === '/api/metrics') {
    // Return system metrics
    const metrics = getSystemMetrics();
    const agents = getAgentStatus();
    res.end(JSON.stringify({ system: metrics, agents }));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'not found' }));
  }
});

// Create WebSocket server attached to HTTP server
const wss = new WebSocket.Server({ server: httpServer });

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 King Hermes WebSocket Server running on port ${PORT}`);
  console.log(`📡 Waiting for connections...`);
  console.log(`📊 API: http://0.0.0.0:${PORT}/api/metrics`);
});

// Handle connections
wss.on('connection', (ws, req) => {
  const clientId = generateClientId();
  console.log(`🔌 Client connected: ${clientId} from ${req.socket.remoteAddress}`);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'system',
    message: 'Connected to King Hermes Dashboard',
    clientId: clientId,
    timestamp: Date.now()
  }));

  // Send initial system metrics
  sendSystemMetrics(ws);

  // Handle messages
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      console.log(`📨 Message from ${clientId}:`, message.type);
      
      switch (message.type) {
        case 'chat':
          await handleChatMessage(ws, message, clientId);
          break;
        case 'system_metrics':
          sendSystemMetrics(ws);
          break;
        case 'kill_agent':
          killAgent(message.agentId);
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
        default:
          ws.send(JSON.stringify({
            type: 'error',
            error: `Unknown message type: ${message.type}`
          }));
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Invalid message format'
      }));
    }
  });

  // Handle disconnect
  ws.on('close', () => {
    console.log(`🔌 Client disconnected: ${clientId}`);
    // Clean up any agents started by this client
    cleanupClientAgents(clientId);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for ${clientId}:`, error);
  });
});

// Generate unique client ID
function generateClientId() {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Generate unique agent ID
function generateAgentId(agentType) {
  return `${agentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Handle chat messages - spawn appropriate agent
async function handleChatMessage(ws, message, clientId) {
  const { agent, prompt, context = {} } = message;
  const agentId = generateAgentId(agent);
  
  console.log(`🤖 Spawning ${agent} agent [${agentId}] for client ${clientId}`);
  
  // Notify client that agent is starting
  ws.send(JSON.stringify({
    type: 'agent_start',
    agent: agent,
    agentId: agentId,
    timestamp: Date.now()
  }));

  try {
    switch (agent) {
      case 'opencode':
        await spawnOpencode(ws, prompt, agentId, clientId, context);
        break;
      case 'gemini':
        await spawnGemini(ws, prompt, agentId, clientId, context);
        break;
      case 'claude':
        await spawnClaudeFireworks(ws, prompt, agentId, clientId, context);
        break;
      default:
        throw new Error(`Unknown agent type: ${agent}`);
    }
  } catch (error) {
    console.error(`Error spawning ${agent}:`, error);
    ws.send(JSON.stringify({
      type: 'agent_error',
      agent: agent,
      agentId: agentId,
      error: error.message,
      timestamp: Date.now()
    }));
  }
}

// Spawn OpenCode agent
async function spawnOpencode(ws, prompt, agentId, clientId, context) {
  const args = ['run', '--inline', prompt];
  
  // Add context files if provided
  if (context.files && context.files.length > 0) {
    args.push('--files', ...context.files);
  }

  console.log(`📝 Executing: opencode ${args.join(' ')}`);
  
  const proc = spawn('opencode', args, {
    cwd: context.cwd || process.cwd(),
    env: { ...process.env, FORCE_COLOR: '0' }
  });

  registerAgent(agentId, proc, clientId, 'opencode');

  let outputBuffer = '';

  proc.stdout.on('data', (data) => {
    const chunk = data.toString();
    outputBuffer += chunk;
    
    ws.send(JSON.stringify({
      type: 'agent_output',
      agent: 'opencode',
      agentId: agentId,
      chunk: chunk,
      timestamp: Date.now()
    }));
  });

  proc.stderr.on('data', (data) => {
    const chunk = data.toString();
    
    ws.send(JSON.stringify({
      type: 'agent_error_output',
      agent: 'opencode',
      agentId: agentId,
      chunk: chunk,
      timestamp: Date.now()
    }));
  });

  proc.on('close', (code) => {
    console.log(`✅ OpenCode agent [${agentId}] exited with code ${code}`);
    
    ws.send(JSON.stringify({
      type: 'agent_complete',
      agent: 'opencode',
      agentId: agentId,
      exitCode: code,
      fullOutput: outputBuffer,
      timestamp: Date.now()
    }));
    
    activeAgents.delete(agentId);
  });

  proc.on('error', (error) => {
    console.error(`❌ OpenCode agent [${agentId}] error:`, error);
    
    ws.send(JSON.stringify({
      type: 'agent_error',
      agent: 'opencode',
      agentId: agentId,
      error: error.message,
      timestamp: Date.now()
    }));
    
    activeAgents.delete(agentId);
  });
}

// Spawn Gemini agent
async function spawnGemini(ws, prompt, agentId, clientId, context) {
  const args = ['-p', prompt];
  
  if (context.model) {
    args.unshift('-m', context.model);
  }

  console.log(`📝 Executing: gemini ${args.join(' ')}`);
  
  const proc = spawn('/snap/bin/gemini', args, {
    cwd: context.cwd || process.cwd(),
    env: process.env
  });

  registerAgent(agentId, proc, clientId, 'gemini');

  let outputBuffer = '';

  proc.stdout.on('data', (data) => {
    const chunk = data.toString();
    outputBuffer += chunk;
    
    ws.send(JSON.stringify({
      type: 'agent_output',
      agent: 'gemini',
      agentId: agentId,
      chunk: chunk,
      timestamp: Date.now()
    }));
  });

  proc.stderr.on('data', (data) => {
    const chunk = data.toString();
    
    ws.send(JSON.stringify({
      type: 'agent_error_output',
      agent: 'gemini',
      agentId: agentId,
      chunk: chunk,
      timestamp: Date.now()
    }));
  });

  proc.on('close', (code) => {
    console.log(`✅ Gemini agent [${agentId}] exited with code ${code}`);
    
    ws.send(JSON.stringify({
      type: 'agent_complete',
      agent: 'gemini',
      agentId: agentId,
      exitCode: code,
      fullOutput: outputBuffer,
      timestamp: Date.now()
    }));
    
    activeAgents.delete(agentId);
  });

  proc.on('error', (error) => {
    console.error(`❌ Gemini agent [${agentId}] error:`, error);
    
    ws.send(JSON.stringify({
      type: 'agent_error',
      agent: 'gemini',
      agentId: agentId,
      error: error.message,
      timestamp: Date.now()
    }));
    
    activeAgents.delete(agentId);
  });
}

// Spawn Claude via Fireworks API
async function spawnClaudeFireworks(ws, prompt, agentId, clientId, context) {
  const apiKey = FIREWORKS_API_KEY || process.env.FIREWORKS_API_KEY;
  
  if (!apiKey) {
    ws.send(JSON.stringify({
      type: 'agent_error',
      agent: 'claude',
      agentId: agentId,
      error: 'Fireworks API key not configured. Set FIREWORKS_API_KEY environment variable.',
      timestamp: Date.now()
    }));
    return;
  }

  console.log(`📝 Calling Fireworks API for Claude [${agentId}]`);
  
  // Register as active agent
  registerAgent(agentId, { kill: () => {} }, clientId, 'claude');

  const requestData = JSON.stringify({
    model: context.model || FIREWORKS_MODEL,
    messages: [
      { role: 'system', content: context.systemPrompt || 'You are Claude, a helpful AI assistant.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: context.maxTokens || 4096,
    temperature: context.temperature || 0.7,
    stream: true
  });

  const options = {
    hostname: 'api.fireworks.ai',
    port: 443,
    path: '/inference/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'text/event-stream'
    }
  };

  const req = https.request(options, (res) => {
    let buffer = '';
    let fullResponse = '';

    res.on('data', (chunk) => {
      buffer += chunk.toString();
      
      // Parse SSE (Server-Sent Events) format
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            ws.send(JSON.stringify({
              type: 'agent_complete',
              agent: 'claude',
              agentId: agentId,
              exitCode: 0,
              fullOutput: fullResponse,
              timestamp: Date.now()
            }));
            activeAgents.delete(agentId);
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            
            if (delta) {
              fullResponse += delta;
              ws.send(JSON.stringify({
                type: 'agent_output',
                agent: 'claude',
                agentId: agentId,
                chunk: delta,
                timestamp: Date.now()
              }));
            }
          } catch (e) {
            // Ignore parse errors for non-JSON lines
          }
        }
      }
    });

    res.on('end', () => {
      console.log(`✅ Claude agent [${agentId}] completed`);
      
      ws.send(JSON.stringify({
        type: 'agent_complete',
        agent: 'claude',
        agentId: agentId,
        exitCode: 0,
        fullOutput: fullResponse,
        timestamp: Date.now()
      }));
      
      activeAgents.delete(agentId);
    });

    res.on('error', (error) => {
      console.error(`❌ Claude agent [${agentId}] stream error:`, error);
      
      ws.send(JSON.stringify({
        type: 'agent_error',
        agent: 'claude',
        agentId: agentId,
        error: error.message,
        timestamp: Date.now()
      }));
      
      activeAgents.delete(agentId);
    });
  });

  req.on('error', (error) => {
    console.error(`❌ Claude agent [${agentId}] request error:`, error);
    
    ws.send(JSON.stringify({
      type: 'agent_error',
      agent: 'claude',
      agentId: agentId,
      error: error.message,
      timestamp: Date.now()
    }));
    
    activeAgents.delete(agentId);
  });

  req.write(requestData);
  req.end();
}

// Register an active agent
function registerAgent(agentId, proc, clientId, agentType) {
  activeAgents.set(agentId, {
    process: proc,
    clientId: clientId,
    type: agentType,
    startTime: Date.now()
  });
  console.log(`📝 Registered agent ${agentId} (${agentType}) for client ${clientId}`);
}

// Kill a specific agent
function killAgent(agentId) {
  const agent = activeAgents.get(agentId);
  if (agent) {
    console.log(`🔪 Killing agent ${agentId}`);
    
    if (agent.process && typeof agent.process.kill === 'function') {
      agent.process.kill('SIGTERM');
      
      // Force kill after 5 seconds if still running
      setTimeout(() => {
        try {
          agent.process.kill('SIGKILL');
        } catch (e) {
          // Process already dead
        }
      }, 5000);
    }
    
    activeAgents.delete(agentId);
    return true;
  }
  return false;
}

// Cleanup all agents for a client
function cleanupClientAgents(clientId) {
  console.log(`🧹 Cleaning up agents for client ${clientId}`);
  
  for (const [agentId, agent] of activeAgents.entries()) {
    if (agent.clientId === clientId) {
      killAgent(agentId);
    }
  }
}

// Read real system metrics from /proc
function sendSystemMetrics(ws) {
  try {
    const metrics = {
      type: 'system_metrics',
      timestamp: Date.now(),
      cpu: readCpuMetrics(),
      memory: readMemoryMetrics(),
      load: readLoadAverage(),
      uptime: readUptime(),
      activeAgents: activeAgents.size
    };
    
    ws.send(JSON.stringify(metrics));
  } catch (error) {
    console.error('Error reading system metrics:', error);
    ws.send(JSON.stringify({
      type: 'system_metrics_error',
      error: error.message,
      timestamp: Date.now()
    }));
  }
}

// Read CPU metrics from /proc/stat
function readCpuMetrics() {
  try {
    const stat = fs.readFileSync('/proc/stat', 'utf8');
    const cpuLine = stat.split('\n')[0];
    const parts = cpuLine.split(/\s+/).slice(1).map(Number);
    
    // cpu user nice system idle iowait irq softirq steal guest guest_nice
    const [user, nice, system, idle, iowait, irq, softirq, steal] = parts;
    
    const total = parts.reduce((a, b) => a + b, 0);
    const totalIdle = idle + iowait;
    const totalUsed = user + nice + system + irq + softirq + steal;
    
    return {
      user,
      nice,
      system,
      idle,
      iowait,
      irq,
      softirq,
      steal,
      total,
      usagePercent: total > 0 ? ((totalUsed / total) * 100).toFixed(2) : 0,
      idlePercent: total > 0 ? ((totalIdle / total) * 100).toFixed(2) : 100
    };
  } catch (error) {
    console.error('Error reading CPU metrics:', error);
    return { error: error.message };
  }
}

// Read memory metrics from /proc/meminfo
function readMemoryMetrics() {
  try {
    const meminfo = fs.readFileSync('/proc/meminfo', 'utf8');
    const lines = meminfo.split('\n');
    
    const metrics = {};
    
    for (const line of lines) {
      const match = line.match(/^(\w+):\s+(\d+)\s+kB$/);
      if (match) {
        const key = match[1];
        const valueKB = parseInt(match[2], 10);
        const valueMB = (valueKB / 1024).toFixed(2);
        const valueGB = (valueKB / (1024 * 1024)).toFixed(2);
        
        metrics[key] = {
          kb: valueKB,
          mb: parseFloat(valueMB),
          gb: parseFloat(valueGB)
        };
      }
    }
    
    // Calculate used memory
    if (metrics.MemTotal && metrics.MemAvailable) {
      const totalKB = metrics.MemTotal.kb;
      const availableKB = metrics.MemAvailable.kb;
      const usedKB = totalKB - availableKB;
      
      metrics.MemUsed = {
        kb: usedKB,
        mb: parseFloat((usedKB / 1024).toFixed(2)),
        gb: parseFloat((usedKB / (1024 * 1024)).toFixed(2))
      };
      
      metrics.usagePercent = ((usedKB / totalKB) * 100).toFixed(2);
    }
    
    return metrics;
  } catch (error) {
    console.error('Error reading memory metrics:', error);
    return { error: error.message };
  }
}

// Read load average
function readLoadAverage() {
  try {
    const loadavg = fs.readFileSync('/proc/loadavg', 'utf8').trim();
    const parts = loadavg.split(' ');
    
    return {
      oneMinute: parseFloat(parts[0]),
      fiveMinutes: parseFloat(parts[1]),
      fifteenMinutes: parseFloat(parts[2]),
      runningProcesses: parts[3].split('/')[0],
      totalProcesses: parts[3].split('/')[1],
      lastPid: parseInt(parts[4], 10)
    };
  } catch (error) {
    console.error('Error reading load average:', error);
    return { error: error.message };
  }
}

// Read system uptime
function readUptime() {
  try {
    const uptime = fs.readFileSync('/proc/uptime', 'utf8').trim();
    const seconds = parseFloat(uptime.split(' ')[0]);
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return {
      seconds: Math.floor(seconds),
      days,
      hours,
      minutes,
      formatted: `${days}d ${hours}h ${minutes}m`
    };
  } catch (error) {
    console.error('Error reading uptime:', error);
    return { error: error.message };
  }
}

// Periodic system metrics broadcast
setInterval(() => {
  const metrics = {
    type: 'system_metrics_broadcast',
    timestamp: Date.now(),
    cpu: readCpuMetrics(),
    memory: readMemoryMetrics(),
    load: readLoadAverage(),
    uptime: readUptime(),
    activeAgents: activeAgents.size,
    agentDetails: Array.from(activeAgents.entries()).map(([id, agent]) => ({
      id,
      type: agent.type,
      clientId: agent.clientId,
      runtime: Date.now() - agent.startTime
    }))
  };
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(metrics));
    }
  });
}, 5000); // Broadcast every 5 seconds

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  // Kill all active agents
  for (const [agentId] of activeAgents.entries()) {
    killAgent(agentId);
  }
  
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  
  // Kill all active agents
  for (const [agentId] of activeAgents.entries()) {
    killAgent(agentId);
  }
  
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

// Get system metrics for HTTP API
function getSystemMetrics() {
  return {
    timestamp: Date.now(),
    cpu: readCpuMetrics(),
    memory: readMemoryMetrics(),
    loadAverage: readLoadAverage(),
    uptime: readUptime(),
    activeAgents: activeAgents.size
  };
}

// Get agent status for HTTP API
function getAgentStatus() {
  const agents = [
    { name: 'opencode', displayName: 'OpenCode', color: '#00FF88' },
    { name: 'gemini', displayName: 'Gemini', color: '#4ECDC4' },
    { name: 'claude', displayName: 'OpenClaude', color: '#FF6B6B' },
    { name: 'roo', displayName: 'Roo Code', color: '#9B59B6' },
    { name: 'kimi', displayName: 'Kimi', color: '#FFD700' }
  ];
  
  // Check which agents are currently running
  const runningTypes = new Set();
  for (const [_, agent] of activeAgents.entries()) {
    runningTypes.add(agent.type);
  }
  
  return agents.map(agent => ({
    ...agent,
    status: runningTypes.has(agent.name) ? 'online' : 'offline',
    pid: null // We could add PID tracking if needed
  }));
}

console.log('✅ King Hermes WebSocket Server initialized');
console.log('📊 System metrics broadcasting every 5 seconds');
console.log('🔧 Supported agents: opencode, gemini, claude (Fireworks API)');
