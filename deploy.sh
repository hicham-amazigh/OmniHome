#!/bin/bash

# OmniHome Smart Home App - Deployment Script for Online VM
# This script deploys the application on an online VM at /app/OmniHome/

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   OmniHome Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Deployment directory
DEPLOY_DIR="/app/OmniHome"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if deployment directory exists
if [ ! -d "$DEPLOY_DIR" ]; then
    echo -e "${RED}Error: Deployment directory $DEPLOY_DIR does not exist${NC}"
    echo -e "${YELLOW}Please clone the repository to $DEPLOY_DIR first${NC}"
    exit 1
fi

# Navigate to deployment directory
cd "$DEPLOY_DIR"
echo -e "${GREEN}Working directory: $DEPLOY_DIR${NC}"
echo ""

# Check for required commands
echo -e "${BLUE}Checking system requirements...${NC}"

if ! command_exists python3; then
    echo -e "${RED}Error: python3 is not installed${NC}"
    echo -e "${YELLOW}Install with: sudo apt-get update && sudo apt-get install -y python3 python3-pip python3-venv${NC}"
    exit 1
fi
echo -e "${GREEN}✓ python3 found${NC}"

if ! command_exists npm; then
    echo -e "${RED}Error: npm is not installed${NC}"
    echo -e "${YELLOW}Install with: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found${NC}"

if ! command_exists node; then
    echo -e "${RED}Error: node is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ node found${NC}"

echo ""

# Setup Server
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Setting up Backend Server${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

cd "$DEPLOY_DIR/server"

# Create virtual environment if it doesn't exist or is incomplete
if [ ! -d "venv" ] || [ ! -f "venv/bin/activate" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    # Remove existing incomplete venv if present
    if [ -d "venv" ]; then
        echo -e "${YELLOW}Removing incomplete virtual environment...${NC}"
        rm -rf venv
    fi
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Upgrade pip
echo -e "${YELLOW}Upgrading pip...${NC}"
pip install --upgrade pip

# Install dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install -r requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"

# Setup environment file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    
    # Generate a random secret key
    SECRET_KEY=$(openssl rand -hex 32)
    sed -i "s/your-secret-key-change-in-production/$SECRET_KEY/" .env
    
    # Update CORS for production (allow all origins or specify your domain)
    sed -i 's/"http:\/\/localhost:5173","http:\/\/localhost:3000"/"*"/' .env
    
    # Update environment to production
    sed -i 's/ENVIRONMENT=development/ENVIRONMENT=production/' .env
    sed -i 's/DEBUG=true/DEBUG=false/' .env
    
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Initialize database if needed
if [ ! -f "omnihome.db" ]; then
    echo -e "${YELLOW}Initializing database...${NC}"
    python3 -c "from app.core.database import init_db; import asyncio; asyncio.run(init_db())"
    echo -e "${GREEN}✓ Database initialized${NC}"
else
    echo -e "${GREEN}✓ Database already exists${NC}"
fi

echo ""

# Setup Client
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Setting up Frontend Client${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

cd "$DEPLOY_DIR/client"

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Node.js dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Node.js dependencies already installed${NC}"
fi

# Build for production
echo -e "${YELLOW}Building frontend for production...${NC}"
npm run build
echo -e "${GREEN}✓ Frontend built successfully${NC}"

echo ""

# Setup Nginx configuration (optional)
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Nginx Configuration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

NGINX_CONF="/etc/nginx/sites-available/omnihome"
if [ -w "/etc/nginx/sites-available" ]; then
    echo -e "${YELLOW}Creating Nginx configuration...${NC}"
    sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # Frontend static files
    location / {
        root $DEPLOY_DIR/client/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Enable site
    if [ ! -L "/etc/nginx/sites-enabled/omnihome" ]; then
        sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
        echo -e "${GREEN}✓ Nginx configured${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Skipping Nginx configuration (no write permissions)${NC}"
    echo -e "${YELLOW}  You can configure Nginx manually later${NC}"
fi

echo ""

# Setup systemd services
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Systemd Service Configuration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Create systemd service for backend
BACKEND_SERVICE="/etc/systemd/system/omnihome-backend.service"
if [ -w "/etc/systemd/system" ]; then
    echo -e "${YELLOW}Creating systemd service for backend...${NC}"
    sudo tee "$BACKEND_SERVICE" > /dev/null <<EOF
[Unit]
Description=OmniHome Backend Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$DEPLOY_DIR/server
Environment="PATH=$DEPLOY_DIR/server/venv/bin"
ExecStart=$DEPLOY_DIR/server/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Create systemd service for frontend (using a simple HTTP server)
    FRONTEND_SERVICE="/etc/systemd/system/omnihome-frontend.service"
    sudo tee "$FRONTEND_SERVICE" > /dev/null <<EOF
[Unit]
Description=OmniHome Frontend Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$DEPLOY_DIR/client/dist
ExecStart=$DEPLOY_DIR/server/venv/bin/python -m http.server 5173
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Reload systemd
    sudo systemctl daemon-reload
    echo -e "${GREEN}✓ Systemd services created${NC}"
else
    echo -e "${YELLOW}⚠ Skipping systemd service creation (no write permissions)${NC}"
    echo -e "${YELLOW}  You can create services manually later${NC}"
fi

echo ""

# Deployment complete
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}To start the application:${NC}"
echo -e "  ${YELLOW}Option 1 (Manual):${NC}"
echo -e "    cd $DEPLOY_DIR && ./run-app.sh"
echo ""
echo -e "  ${YELLOW}Option 2 (Systemd - if configured):${NC}"
echo -e "    sudo systemctl start omnihome-backend"
echo -e "    sudo systemctl start omnihome-frontend"
echo -e "    sudo systemctl enable omnihome-backend"
echo -e "    sudo systemctl enable omnihome-frontend"
echo ""
echo -e "${BLUE}Access the application:${NC}"
echo -e "  ${GREEN}Frontend:${NC} http://$(hostname -I | awk '{print $1}'):5173"
echo -e "  ${GREEN}Backend API:${NC} http://$(hostname -I | awk '{print $1}'):3000"
echo -e "  ${GREEN}API Docs:${NC} http://$(hostname -I | awk '{print $1}'):3000/docs"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo -e "  ${YELLOW}Server log:${NC} $DEPLOY_DIR/server.log"
echo -e "  ${YELLOW}Client log:${NC} $DEPLOY_DIR/client.log"
echo ""
echo -e "${BLUE}To stop the application:${NC}"
echo -e "  ${YELLOW}Manual:${NC} cd $DEPLOY_DIR && ./stop-app.sh"
echo -e "  ${YELLOW}Systemd:${NC} sudo systemctl stop omnihome-backend omnihome-frontend"
echo ""
