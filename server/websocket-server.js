const WebSocket = require('ws');
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const https = require('https');

const PORT = 8080;
const FIREWORKS_API_KEY = 'fw_SW2LkiVRsBt4mH4Qwk9Swf';
const FIREWORKS_MODEL = 'accounts/fireworks/routers/kimi-k2p5-turbo';

const activeAgents = new Map();

// HTTP server for API
const httpServer = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/api/health') {
    res.end(JSON.stringify({ status: 'ok', king: 'hermes' }));
  } else if (req.url === '/api/metrics') {
    const metrics = getSystemMetrics();
    const agents = getAgentStatus();
    res.end(JSON.stringify({ system: metrics, agents }));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'not found' }));
  }
});

// WebSocket server
const wss = new WebSocket.Server({ server: httpServer });

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 King Hermes WebSocket Server running on port ${PORT}`);
});

wss.on('connection', (ws) => {
  const clientId = `client_${Date.now()}`;
  console.log(`🔌 Client connected: ${clientId}`);
  
  ws.send(JSON.stringify({ type: 'system', message: 'Connected to King Hermes' }));
  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'chat') {
        await handleChatMessage(ws, message, clientId);
      } else if (message.type === 'spawn_agent') {
        await spawnAgent(ws, message.agent, message.prompt, clientId);
      }
    } catch (error) {
      ws.send(JSON.stringify({ type: 'error', error: error.message }));
    }
  });
});

async function spawnAgent(ws, agentType, prompt, clientId) {
  const agentId = `${agentType}_${Date.now()}`;
  
  ws.send(JSON.stringify({ type: 'agent_start', agent: agentType, agentId }));
  
  let proc;
  
  if (agentType === 'opencode') {
    proc = spawn('opencode', ['run', prompt], { cwd: '/tmp' });
  } else if (agentType === 'gemini') {
    proc = spawn('/snap/bin/gemini', ['-p', prompt], { cwd: '/tmp' });
  } else if (agentType === 'claude') {
    // Use Fireworks API
    const response = await fetch('https://api.fireworks.ai/inference/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIREWORKS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: FIREWORKS_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500
      })
    });
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'No response';
    ws.send(JSON.stringify({ type: 'agent_output', agentId, output: content }));
    ws.send(JSON.stringify({ type: 'agent_complete', agentId }));
    return;
  }
  
  if (proc) {
    let output = '';
    proc.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      ws.send(JSON.stringify({ type: 'agent_output', agentId, chunk }));
    });
    
    proc.stderr.on('data', (data) => {
      const chunk = data.toString();
      if (!chunk.includes('WARNING') && !chunk.includes('Keychain')) {
        ws.send(JSON.stringify({ type: 'agent_error', agentId, chunk }));
      }
    });
    
    proc.on('close', (code) => {
      ws.send(JSON.stringify({ type: 'agent_complete', agentId, output, code }));
    });
    
    activeAgents.set(agentId, { type: agentType, clientId, proc });
  }
}

function getSystemMetrics() {
  try {
    // CPU
    const stat = fs.readFileSync('/proc/stat', 'utf8');
    const cpuLine = stat.split('\n')[0].split(' ').filter(x => x);
    const user = parseInt(cpuLine[1]) || 0;
    const system = parseInt(cpuLine[3]) || 0;
    const idle = parseInt(cpuLine[4]) || 0;
    const total = user + system + idle;
    const cpuPercent = total > 0 ? ((user + system) / total * 100).toFixed(2) : 0;
    
    // Memory
    const meminfo = fs.readFileSync('/proc/meminfo', 'utf8');
    const lines = meminfo.split('\n');
    const totalMatch = lines[0].match(/(\d+)/);
    const availMatch = lines[2].match(/(\d+)/);
    const totalKB = totalMatch ? parseInt(totalMatch[1]) : 0;
    const availKB = availMatch ? parseInt(availMatch[1]) : 0;
    const usedGB = ((totalKB - availKB) / 1024 / 1024).toFixed(2);
    const totalGB = (totalKB / 1024 / 1024).toFixed(2);
    const memPercent = ((usedGB / totalGB) * 100).toFixed(1);
    
    return {
      timestamp: Date.now(),
      cpu: { percentage: cpuPercent },
      memory: { percentage: memPercent, usedGB, totalGB }
    };
  } catch (e) {
    return { error: e.message };
  }
}

function getAgentStatus() {
  return [
    { name: 'opencode', displayName: 'OpenCode', color: '#00FF88', status: 'offline' },
    { name: 'gemini', displayName: 'Gemini', color: '#4ECDC4', status: 'offline' },
    { name: 'claude', displayName: 'OpenClaude', color: '#FF6B6B', status: 'offline' },
    { name: 'roo', displayName: 'Roo Code', color: '#9B59B6', status: 'offline' },
  ];
}

// Broadcast metrics every 5 seconds
setInterval(() => {
  const metrics = getSystemMetrics();
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'metrics', data: metrics }));
    }
  });
}, 5000);
