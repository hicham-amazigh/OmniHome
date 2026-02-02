#!/bin/bash

# OmniHome Smart Home App - Startup Script
# This script starts both the frontend client and backend server

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   OmniHome Smart Home App${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required commands
if ! command_exists python3; then
    echo -e "${RED}Error: python3 is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Define paths
SERVER_DIR="$SCRIPT_DIR/server"
CLIENT_DIR="$SCRIPT_DIR/client"
SERVER_PID_FILE="$SCRIPT_DIR/server.pid"
CLIENT_PID_FILE="$SCRIPT_DIR/client.pid"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Cleaning up...${NC}"
    
    # Kill server if running
    if [ -f "$SERVER_PID_FILE" ]; then
        SERVER_PID=$(cat "$SERVER_PID_FILE")
        if ps -p "$SERVER_PID" > /dev/null; then
            echo -e "${YELLOW}Stopping server (PID: $SERVER_PID)...${NC}"
            kill "$SERVER_PID"
            rm "$SERVER_PID_FILE"
        fi
    fi
    
    # Kill client if running
    if [ -f "$CLIENT_PID_FILE" ]; then
        CLIENT_PID=$(cat "$CLIENT_PID_FILE")
        if ps -p "$CLIENT_PID" > /dev/null; then
            echo -e "${YELLOW}Stopping client (PID: $CLIENT_PID)...${NC}"
            kill "$CLIENT_PID"
            rm "$CLIENT_PID_FILE"
        fi
    fi
    
    echo -e "${GREEN}Cleanup complete${NC}"
}

# Register cleanup function
trap cleanup EXIT INT TERM

# Check if server is already running
if [ -f "$SERVER_PID_FILE" ]; then
    SERVER_PID=$(cat "$SERVER_PID_FILE")
    if ps -p "$SERVER_PID" > /dev/null; then
        echo -e "${YELLOW}Server is already running (PID: $SERVER_PID)${NC}"
        echo -e "${YELLOW}Use './stop-app.sh' to stop the application${NC}"
        exit 0
    else
        rm "$SERVER_PID_FILE"
    fi
fi

# Check if client is already running
if [ -f "$CLIENT_PID_FILE" ]; then
    CLIENT_PID=$(cat "$CLIENT_PID_FILE")
    if ps -p "$CLIENT_PID" > /dev/null; then
        echo -e "${YELLOW}Client is already running (PID: $CLIENT_PID)${NC}"
        echo -e "${YELLOW}Use './stop-app.sh' to stop the application${NC}"
        exit 0
    else
        rm "$CLIENT_PID_FILE"
    fi
fi

# Start the server
echo -e "${BLUE}Starting Backend Server...${NC}"
cd "$SERVER_DIR"

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo -e "${GREEN}Using virtual environment...${NC}"
    source venv/bin/activate
    python3 main.py > ../server.log 2>&1 &
else
    echo -e "${YELLOW}Warning: No virtual environment found, using system python${NC}"
    python3 main.py > ../server.log 2>&1 &
fi

SERVER_PID=$!
echo $SERVER_PID > "$SERVER_PID_FILE"
echo -e "${GREEN}Server started (PID: $SERVER_PID)${NC}"

# Wait a moment for server to start
sleep 3

# Start the client
echo -e "${BLUE}Starting Frontend Client...${NC}"
cd "$CLIENT_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Start the dev server
npm run dev > ../client.log 2>&1 &
CLIENT_PID=$!
echo $CLIENT_PID > "$CLIENT_PID_FILE"
echo -e "${GREEN}Client started (PID: $CLIENT_PID)${NC}"

# Display access information
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Application Started!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Backend Server:${NC}"
echo -e "  - URL: ${GREEN}http://localhost:3000${NC}"
echo -e "  - API Docs: ${GREEN}http://localhost:3000/docs${NC}"
echo -e "  - Logs: ${YELLOW}server.log${NC}"
echo ""
echo -e "${BLUE}Frontend Client:${NC}"
echo -e "  - URL: ${GREEN}http://localhost:5173${NC}"
echo -e "  - Logs: ${YELLOW}client.log${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both services${NC}"
echo ""

# Keep script running and monitor processes
while true; do
    # Check if server is still running
    if [ -f "$SERVER_PID_FILE" ]; then
        SERVER_PID=$(cat "$SERVER_PID_FILE")
        if ! ps -p "$SERVER_PID" > /dev/null; then
            echo -e "${RED}Server process died unexpectedly!${NC}"
            rm "$SERVER_PID_FILE"
            cleanup
            exit 1
        fi
    fi
    
    # Check if client is still running
    if [ -f "$CLIENT_PID_FILE" ]; then
        CLIENT_PID=$(cat "$CLIENT_PID_FILE")
        if ! ps -p "$CLIENT_PID" > /dev/null; then
            echo -e "${RED}Client process died unexpectedly!${NC}"
            rm "$CLIENT_PID_FILE"
            cleanup
            exit 1
        fi
    fi
    
    sleep 5
done
