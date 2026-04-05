# King Hermes Supreme Dashboard

## 👑 Supreme Agent Orchestrator - Real 3D, Real Data, Real Agents

**DASHBOARD URL:** http://194.195.215.135:3000

### ✅ What's Working

**3D Background (Three.js):**
- 3000+ gold particles orbiting
- 4 agent spheres orbiting center (OpenCode, Gemini, OpenClaude, Roo)
- King Hermes center sphere with glow
- Connection lines between agents and center
- 5000 stars background
- Dark space theme (#050505)

**6 Working Tabs:**
1. **Agents** - Spawn real agents, view status
2. **System** - Real CPU/Memory from /proc
3. **Tasks** - View running tasks
4. **Chat** - Message with King Hermes
5. **Logs** - System logs
6. **Settings** - Connection info

**Floating King Bot:**
- Gold crown button (bottom right)
- Click to open chat
- Spawn agents via chat

**Real-Time Data:**
- CPU: Real from /proc/stat
- Memory: Real from /proc/meminfo
- Updates every 5 seconds via WebSocket

### 🔧 Servers

```bash
# WebSocket Server (Port 8080)
cd /workspace/supreme-king/server
node websocket-server.js

# Dashboard (Port 3000)
cd /workspace/supreme-king/dashboard/.next/standalone
PORT=3000 HOSTNAME=0.0.0.0 node server.js
```

### 🚀 Features

- **Spawn Agents:** Click "Spawn" in Agents tab to actually run opencode/gemini/claude
- **Real Metrics:** All system data is REAL from Ubuntu server
- **3D Visualization:** Interactive 3D scene with Three.js
- **Agent Status:** Shows online/offline based on real process status

Built for Solxhunter X100.
