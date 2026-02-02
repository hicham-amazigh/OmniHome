#!/bin/bash

# OmniHome Smart Home App - Stop Script
# This script stops both the frontend client and backend server

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

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Define paths
SERVER_PID_FILE="$SCRIPT_DIR/server.pid"
CLIENT_PID_FILE="$SCRIPT_DIR/client.pid"

# Function to stop a process
stop_process() {
    local PID_FILE=$1
    local PROCESS_NAME=$2
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null; then
            echo -e "${YELLOW}Stopping $PROCESS_NAME (PID: $PID)...${NC}"
            kill "$PID"
            rm "$PID_FILE"
            echo -e "${GREEN}$PROCESS_NAME stopped${NC}"
        else
            echo -e "${YELLOW}$PROCESS_NAME is not running${NC}"
            rm "$PID_FILE"
        fi
    else
        echo -e "${YELLOW}$PROCESS_NAME is not running${NC}"
    fi
}

# Stop the server
stop_process "$SERVER_PID_FILE" "Backend Server"

# Stop the client
stop_process "$CLIENT_PID_FILE" "Frontend Client"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   All Services Stopped${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo -e "  - Server: ${YELLOW}server.log${NC}"
echo -e "  - Client: ${YELLOW}client.log${NC}"
echo ""
