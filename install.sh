#!/bin/bash

# King Hermes Dashboard Installation Script
# Starts both WebSocket server (port 8080) and Next.js dashboard (port 3000)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$SCRIPT_DIR/server"
DASHBOARD_DIR="$SCRIPT_DIR/dashboard"
LOG_DIR="$SCRIPT_DIR/logs"
PID_DIR="$SCRIPT_DIR/.pids"

# Ports
WS_PORT=8080
DASHBOARD_PORT=3000

# Function to print colored output
print_status() {
    echo -e "${BLUE}[King Hermes]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create necessary directories
mkdir -p "$LOG_DIR" "$PID_DIR"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on a port
kill_port() {
    local port=$1
    if check_port $port; then
        print_warning "Port $port is already in use. Stopping existing process..."
        lsof -Pi :$port -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Function to install dependencies
install_deps() {
    local dir=$1
    local name=$2
    
    print_status "Installing $name dependencies..."
    cd "$dir"
    
    if [ ! -d "node_modules" ]; then
        npm install 2>&1 | tee "$LOG_DIR/${name}_npm_install.log"
        print_success "$name dependencies installed"
    else
        print_warning "$name dependencies already exist. Running update..."
        npm update 2>&1 | tee "$LOG_DIR/${name}_npm_update.log"
    fi
}

# Function to start server
start_server() {
    print_status "Starting WebSocket Server on port $WS_PORT..."
    cd "$SERVER_DIR"
    
    nohup node websocket-server.js > "$LOG_DIR/server.log" 2>&1 &
    echo $! > "$PID_DIR/server.pid"
    
    # Wait for server to start
    local attempts=0
    while ! check_port $WS_PORT && [ $attempts -lt 30 ]; do
        sleep 1
        ((attempts++))
    done
    
    if check_port $WS_PORT; then
        print_success "WebSocket Server running on port $WS_PORT (PID: $(cat $PID_DIR/server.pid))"
    else
        print_error "Failed to start WebSocket Server"
        exit 1
    fi
}

# Function to start dashboard
start_dashboard() {
    print_status "Starting Dashboard on port $DASHBOARD_PORT..."
    cd "$DASHBOARD_DIR"
    
    # Check if standalone build exists
    if [ -d ".next/standalone" ]; then
        print_status "Standalone build found. Starting production server..."
        nohup node .next/standalone/server.js > "$LOG_DIR/dashboard.log" 2>&1 &
    elif [ -d ".next" ]; then
        print_status "Starting Next.js production server..."
        nohup npm start > "$LOG_DIR/dashboard.log" 2>&1 &
    else
        print_status "No build found. Building dashboard first..."
        npm run build 2>&1 | tee "$LOG_DIR/dashboard_build.log"
        
        # Check if standalone output was generated
        if [ -d ".next/standalone" ]; then
            print_success "Standalone build complete"
            nohup node .next/standalone/server.js > "$LOG_DIR/dashboard.log" 2>&1 &
        else
            print_warning "No standalone output, using npm start"
            nohup npm start > "$LOG_DIR/dashboard.log" 2>&1 &
        fi
    fi
    
    echo $! > "$PID_DIR/dashboard.pid"
    
    # Wait for dashboard to start
    local attempts=0
    while ! check_port $DASHBOARD_PORT && [ $attempts -lt 60 ]; do
        sleep 1
        ((attempts++))
    done
    
    if check_port $DASHBOARD_PORT; then
        print_success "Dashboard running on port $DASHBOARD_PORT (PID: $(cat $PID_DIR/dashboard.pid))"
    else
        print_error "Failed to start Dashboard"
        exit 1
    fi
}

# Function to display status
show_status() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         King Hermes Dashboard Status                   ║${NC}"
    echo -e "${GREEN}╠════════════════════════════════════════════════════════╣${NC}"
    
    if check_port $WS_PORT; then
        echo -e "${GREEN}║  WebSocket Server: Running on port $WS_PORT               ║${NC}"
    else
        echo -e "${RED}║  WebSocket Server: Stopped                              ║${NC}"
    fi
    
    if check_port $DASHBOARD_PORT; then
        echo -e "${GREEN}║  Dashboard:        Running on port $DASHBOARD_PORT              ║${NC}"
    else
        echo -e "${RED}║  Dashboard:        Stopped                              ║${NC}"
    fi
    
    echo -e "${GREEN}╠════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  Dashboard URL: http://localhost:$DASHBOARD_PORT                  ║${NC}"
    echo -e "${GREEN}║  WebSocket:    ws://localhost:$WS_PORT                      ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Log files:"
    echo "  - Server:   $LOG_DIR/server.log"
    echo "  - Dashboard: $LOG_DIR/dashboard.log"
    echo ""
    echo "Process IDs:"
    if [ -f "$PID_DIR/server.pid" ]; then
        echo "  - Server:   $(cat $PID_DIR/server.pid)"
    fi
    if [ -f "$PID_DIR/dashboard.pid" ]; then
        echo "  - Dashboard: $(cat $PID_DIR/dashboard.pid)"
    fi
    echo ""
}

# Function to cleanup on exit
cleanup() {
    print_status "Shutting down King Hermes Dashboard..."
    
    if [ -f "$PID_DIR/server.pid" ]; then
        kill $(cat "$PID_DIR/server.pid") 2>/dev/null || true
        rm -f "$PID_DIR/server.pid"
    fi
    
    if [ -f "$PID_DIR/dashboard.pid" ]; then
        kill $(cat "$PID_DIR/dashboard.pid") 2>/dev/null || true
        rm -f "$PID_DIR/dashboard.pid"
    fi
    
    print_success "Shutdown complete"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Main execution
case "${1:-install}" in
    install)
        print_status "King Hermes Dashboard Installer"
        print_status "================================"
        
        # Check Node.js version
        if ! command -v node &> /dev/null; then
            print_error "Node.js is not installed. Please install Node.js 18+ first."
            exit 1
        fi
        
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            print_error "Node.js 18+ is required. Found: $(node --version)"
            exit 1
        fi
        
        print_success "Node.js version: $(node --version)"
        
        # Clear existing ports
        kill_port $WS_PORT
        kill_port $DASHBOARD_PORT
        
        # Install dependencies
        install_deps "$SERVER_DIR" "Server"
        install_deps "$DASHBOARD_DIR" "Dashboard"
        
        # Build dashboard for standalone output
        print_status "Building dashboard (standalone output)..."
        cd "$DASHBOARD_DIR"
        npm run build 2>&1 | tee "$LOG_DIR/dashboard_build.log"
        
        if [ -d ".next/standalone" ]; then
            print_success "Standalone build created in .next/standalone/"
        else
            print_warning "Standalone output not detected, falling back to standard start"
        fi
        
        # Start services
        start_server
        start_dashboard
        
        # Show status
        show_status
        
        print_status "King Hermes Dashboard is running!"
        print_status "Press Ctrl+C to stop all services"
        
        # Keep script running
        while true; do
            sleep 5
            if ! check_port $WS_PORT; then
                print_error "WebSocket Server stopped unexpectedly!"
            fi
            if ! check_port $DASHBOARD_PORT; then
                print_error "Dashboard stopped unexpectedly!"
            fi
        done
        ;;
    
    start)
        kill_port $WS_PORT
        kill_port $DASHBOARD_PORT
        start_server
        start_dashboard
        show_status
        
        print_status "Services started. Press Ctrl+C to stop."
        while true; do
            sleep 5
        done
        ;;
    
    stop)
        cleanup
        ;;
    
    status)
        show_status
        ;;
    
    build)
        print_status "Building dashboard for production..."
        cd "$DASHBOARD_DIR"
        npm run build 2>&1 | tee "$LOG_DIR/dashboard_build.log"
        print_success "Build complete"
        ;;
    
    logs)
        if [ -f "$LOG_DIR/server.log" ]; then
            echo "=== Server Log ==="
            tail -50 "$LOG_DIR/server.log"
        fi
        if [ -f "$LOG_DIR/dashboard.log" ]; then
            echo ""
            echo "=== Dashboard Log ==="
            tail -50 "$LOG_DIR/dashboard.log"
        fi
        ;;
    
    *)
        echo "Usage: $0 {install|start|stop|status|build|logs}"
        echo ""
        echo "Commands:"
        echo "  install  - Install dependencies and start both services (default)"
        echo "  start    - Start services (assumes dependencies installed)"
        echo "  stop     - Stop all running services"
        echo "  status   - Show current service status"
        echo "  build    - Build dashboard for production"
        echo "  logs     - Show recent log output"
        exit 1
        ;;
esac
