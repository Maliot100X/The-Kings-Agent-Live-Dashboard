# King Hermes Live Dashboard

Real-time agent monitoring dashboard with WebSocket integration for live agent status, activity logs, and system metrics.

## Overview

King Hermes Dashboard provides real-time visibility into your AI agent swarm, displaying:
- **Live Agent Status** - Real-time online/offline/idle states
- **System Metrics** - CPU, memory, task throughput
- **Activity Logs** - Live agent activity feed
- **Performance Charts** - Resource utilization over time

## Architecture

```
┌─────────────────┐     WebSocket      ┌──────────────────┐
│   Dashboard     │ ◄────────────────► │   Server         │
│   (Port 3000)   │                    │   (Port 8080)    │
│   Next.js       │                    │   Node.js        │
└─────────────────┘                    └──────────────────┘
```

### Components

| Component | Technology | Port | Description |
|-----------|------------|------|-------------|
| Dashboard | Next.js 14 (Standalone) | 3000 | React-based UI with real-time updates |
| Server | Node.js + ws | 8080 | WebSocket server with agent registry |

## Quick Start

```bash
# Clone and install
git clone https://github.com/Maliot100X/The-Kings-Agent-Live-Dashboard.git
cd The-Kings-Agent-Live-Dashboard

# Install and start both services
./install.sh
```

The dashboard will be available at: **http://localhost:3000**

## Installation Commands

```bash
# Full install (dependencies + start)
./install.sh install

# Start only (requires prior install)
./install.sh start

# Stop all services
./install.sh stop

# Check status
./install.sh status

# Build dashboard
./install.sh build

# View logs
./install.sh logs
```

## Manual Setup

If you prefer manual setup:

```bash
# 1. Install server dependencies
cd server
npm install

# 2. Start WebSocket server
node websocket-server.js

# 3. In another terminal, install dashboard dependencies
cd ../dashboard
npm install

# 4. Build for standalone output
npm run build

# 5. Start dashboard
npm start
```

## Agent Status

The dashboard tracks real-time status for these agents:

| Agent | Type | Status | Tasks |
|-------|------|--------|-------|
| OpenCode | Coder | Online | Live count |
| OpenClaude | Orchestrator | Online | Live count |
| Gemini | Researcher | Online/Idle | Live count |
| Codex | Reviewer | Offline | Live count |

Status changes are broadcast in real-time via WebSocket.

## WebSocket Protocol

### Client → Server
```javascript
// Request status update
{ type: 'status:request' }

// Spawn new agent
{ type: 'agent:spawn', payload: { name: 'AgentName' } }

// Kill agent
{ type: 'agent:kill', payload: { id: 'agent-id' } }

// Ping
{ type: 'ping' }
```

### Server → Client
```javascript
// Initial connection
{ type: 'init', stats: {...}, agents: [...], server: {...} }

// Stats update (every 3s)
{ type: 'stats:update', payload: {...} }

// Activity log (every 2s)
{ type: 'activity:log', payload: {...} }

// Agent state change
{ type: 'agent:state', payload: { id, status } }

// Notifications
{ type: 'notification', payload: { level, message } }
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `WS_PORT` | 8080 | WebSocket server port |
| `NEXT_PUBLIC_WS_URL` | ws://localhost:8080 | WebSocket client URL |
| `NEXT_PUBLIC_API_URL` | http://localhost:8080 | API base URL |

### Standalone Output

The dashboard uses Next.js standalone output for deployment:

```javascript
// next.config.js
module.exports = {
  output: 'standalone'
}
```

This creates an optimized production build in `.next/standalone/` that can run without `node_modules`.

## Directory Structure

```
king-hermes-v2/
├── install.sh              # Main installation script
├── README.md               # This file
├── server/
│   ├── package.json        # Server dependencies
│   └── websocket-server.js # WebSocket server (port 8080)
└── dashboard/
    ├── package.json        # Dashboard dependencies
    ├── next.config.js      # Next.js standalone config
    ├── src/
    │   └── app/           # Next.js app directory
    └── ...                # Other Next.js files
```

## System Requirements

- **Node.js**: 18.x or higher
- **Memory**: 512MB minimum
- **CPU**: 1 core minimum
- **Network**: Ports 3000 and 8080 available

## Logs

Logs are stored in the `logs/` directory:

- `logs/server.log` - WebSocket server output
- `logs/dashboard.log` - Dashboard output
- `logs/dashboard_build.log` - Build output
- `logs/*_npm_install.log` - Dependency installation

## Troubleshooting

### Port already in use
```bash
# Kill processes on ports 3000 and 8080
lsof -ti:3000 | xargs kill -9
lsof -ti:8080 | xargs kill -9
```

### Dashboard not connecting
- Verify WebSocket server is running: `./install.sh status`
- Check `NEXT_PUBLIC_WS_URL` environment variable
- Review logs: `./install.sh logs`

### Build fails
```bash
# Clean and rebuild
cd dashboard
rm -rf .next node_modules
npm install
npm run build
```

## License

MIT License - King Hermes Agent Swarm
