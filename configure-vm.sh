#!/bin/bash

# OmniHome VM Configuration Script
# This script configures the VM for OmniHome deployment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   OmniHome VM Configuration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Error: This script must be run as root (sudo)${NC}"
    echo -e "${YELLOW}Usage: sudo ./configure-vm.sh${NC}"
    exit 1
fi

# Deployment directory
DEPLOY_DIR="/app/OmniHome"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Update System
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 1: Updating System${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}Updating package lists...${NC}"
apt-get update -y
echo -e "${GREEN}✓ System updated${NC}"
echo ""

# Step 2: Install System Dependencies
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 2: Installing System Dependencies${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}Installing Python and pip...${NC}"
apt-get install -y python3 python3-pip python3-venv
echo -e "${GREEN}✓ Python installed${NC}"

echo -e "${YELLOW}Installing Node.js and npm...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
echo -e "${GREEN}✓ Node.js installed${NC}"

echo -e "${YELLOW}Installing Nginx...${NC}"
apt-get install -y nginx
echo -e "${GREEN}✓ Nginx installed${NC}"

echo -e "${YELLOW}Installing OpenSSL...${NC}"
apt-get install -y openssl
echo -e "${GREEN}✓ OpenSSL installed${NC}"

echo -e "${YELLOW}Installing other utilities...${NC}"
apt-get install -y git curl wget ufw
echo -e "${GREEN}✓ Utilities installed${NC}"
echo ""

# Step 3: Create Application User
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 3: Creating Application User${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if id "omnihome" &>/dev/null; then
    echo -e "${GREEN}✓ User 'omnihome' already exists${NC}"
else
    echo -e "${YELLOW}Creating 'omnihome' user...${NC}"
    useradd -r -s /bin/bash -d /app/OmniHome omnihome
    echo -e "${GREEN}✓ User 'omnihome' created${NC}"
fi
echo ""

# Step 4: Setup Directory Structure
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 4: Setting Up Directory Structure${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ ! -d "$DEPLOY_DIR" ]; then
    echo -e "${YELLOW}Creating deployment directory...${NC}"
    mkdir -p "$DEPLOY_DIR"
    echo -e "${GREEN}✓ Deployment directory created${NC}"
else
    echo -e "${GREEN}✓ Deployment directory already exists${NC}"
fi

echo -e "${YELLOW}Setting ownership and permissions...${NC}"
chown -R omnihome:omnihome "$DEPLOY_DIR"
chmod -R 755 "$DEPLOY_DIR"
echo -e "${GREEN}✓ Ownership and permissions set${NC}"
echo ""

# Step 5: Configure Firewall
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 5: Configuring Firewall${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}Allowing SSH...${NC}"
ufw allow 22/tcp
echo -e "${GREEN}✓ SSH allowed${NC}"

echo -e "${YELLOW}Allowing HTTP...${NC}"
ufw allow 80/tcp
echo -e "${GREEN}✓ HTTP allowed${NC}"

echo -e "${YELLOW}Allowing HTTPS...${NC}"
ufw allow 443/tcp
echo -e "${GREEN}✓ HTTPS allowed${NC}"

echo -e "${YELLOW}Allowing Backend API port...${NC}"
ufw allow 3000/tcp
echo -e "${GREEN}✓ Backend API port allowed${NC}"

echo -e "${YELLOW}Allowing Frontend port...${NC}"
ufw allow 5173/tcp
echo -e "${GREEN}✓ Frontend port allowed${NC}"

echo -e "${YELLOW}Enabling firewall...${NC}"
ufw --force enable
echo -e "${GREEN}✓ Firewall enabled${NC}"
echo ""

# Step 6: Configure Nginx
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 6: Configuring Nginx${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ -f "$DEPLOY_DIR/omnihome-nginx.conf" ]; then
    echo -e "${YELLOW}Copying Nginx configuration...${NC}"
    cp "$DEPLOY_DIR/omnihome-nginx.conf" /etc/nginx/sites-available/omnihome
    
    # Remove default site if it exists
    if [ -L "/etc/nginx/sites-enabled/default" ]; then
        rm /etc/nginx/sites-enabled/default
    fi
    
    # Enable omnihome site
    if [ ! -L "/etc/nginx/sites-enabled/omnihome" ]; then
        ln -s /etc/nginx/sites-available/omnihome /etc/nginx/sites-enabled/
    fi
    
    # Test configuration
    if nginx -t; then
        echo -e "${GREEN}✓ Nginx configuration valid${NC}"
        systemctl reload nginx
        echo -e "${GREEN}✓ Nginx reloaded${NC}"
    else
        echo -e "${RED}✗ Nginx configuration test failed${NC}"
        echo -e "${YELLOW}Please check the configuration manually${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Nginx configuration file not found at $DEPLOY_DIR/omnihome-nginx.conf${NC}"
    echo -e "${YELLOW}Skipping Nginx configuration${NC}"
fi
echo ""

# Step 7: Configure Systemd Services
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 7: Configuring Systemd Services${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Update service files with correct user
if [ -f "$DEPLOY_DIR/omnihome-backend.service" ]; then
    echo -e "${YELLOW}Installing backend service...${NC}"
    cp "$DEPLOY_DIR/omnihome-backend.service" /etc/systemd/system/
    sed -i 's/User=www-data/User=omnihome/g' /etc/systemd/system/omnihome-backend.service
    sed -i 's/Group=www-data/Group=omnihome/g' /etc/systemd/system/omnihome-backend.service
    echo -e "${GREEN}✓ Backend service installed${NC}"
fi

if [ -f "$DEPLOY_DIR/omnihome-frontend.service" ]; then
    echo -e "${YELLOW}Installing frontend service...${NC}"
    cp "$DEPLOY_DIR/omnihome-frontend.service" /etc/systemd/system/
    sed -i 's/User=www-data/User=omnihome/g' /etc/systemd/system/omnihome-frontend.service
    sed -i 's/Group=www-data/Group=omnihome/g' /etc/systemd/system/omnihome-frontend.service
    echo -e "${GREEN}✓ Frontend service installed${NC}"
fi

# Reload systemd
systemctl daemon-reload
echo -e "${GREEN}✓ Systemd reloaded${NC}"
echo ""

# Step 8: Configure Log Rotation
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 8: Configuring Log Rotation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

cat > /etc/logrotate.d/omnihome <<EOF
/app/OmniHome/server.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 omnihome omnihome
}

/app/OmniHome/client.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 omnihome omnihome
}
EOF

echo -e "${GREEN}✓ Log rotation configured${NC}"
echo ""

# Step 9: Generate Secure Secret Key
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 9: Generating Secure Secret Key${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

SECRET_KEY=$(openssl rand -hex 32)
echo -e "${GREEN}Generated secret key: $SECRET_KEY${NC}"
echo -e "${YELLOW}Save this key for your .env file!${NC}"
echo ""

# Step 10: Display Configuration Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Configuration Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${GREEN}Summary:${NC}"
echo -e "  ${GREEN}✓${NC} System updated"
echo -e "  ${GREEN}✓${NC} Dependencies installed (Python, Node.js, Nginx)"
echo -e "  ${GREEN}✓${NC} User 'omnihome' created"
echo -e "  ${GREEN}✓${NC} Directory structure configured"
echo -e "  ${GREEN}✓${NC} Firewall configured (ports 22, 80, 443, 3000, 5173)"
echo -e "  ${GREEN}✓${NC} Nginx configured"
echo -e "  ${GREEN}✓${NC} Systemd services installed"
echo -e "  ${GREEN}✓${NC} Log rotation configured"
echo ""

echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Upload your application files to $DEPLOY_DIR"
echo -e "  2. Run the deployment script:"
echo -e "     ${YELLOW}cd $DEPLOY_DIR && sudo -u omnihome ./deploy.sh${NC}"
echo -e "  3. Update the .env file with the generated secret key:"
echo -e "     ${YELLOW}SECRET_KEY=$SECRET_KEY${NC}"
echo -e "  4. Start the services:"
echo -e "     ${YELLOW}sudo systemctl start omnihome-backend${NC}"
echo -e "     ${YELLOW}sudo systemctl start omnihome-frontend${NC}"
echo -e "  5. Enable services to start on boot:"
echo -e "     ${YELLOW}sudo systemctl enable omnihome-backend${NC}"
echo -e "     ${YELLOW}sudo systemctl enable omnihome-frontend${NC}"
echo ""

echo -e "${BLUE}Access the application:${NC}"
echo -e "  ${GREEN}Frontend:${NC} http://$(hostname -I | awk '{print $1}')/"
echo -e "  ${GREEN}Backend API:${NC} http://$(hostname -I | awk '{print $1}')/api/"
echo -e "  ${GREEN}API Docs:${NC} http://$(hostname -I | awk '{print $1}')/docs"
echo ""

echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  ${YELLOW}Check service status:${NC} sudo systemctl status omnihome-backend"
echo -e "  ${YELLOW}View logs:${NC} sudo journalctl -u omnihome-backend -f"
echo -e "  ${YELLOW}Restart services:${NC} sudo systemctl restart omnihome-backend omnihome-frontend"
echo ""
