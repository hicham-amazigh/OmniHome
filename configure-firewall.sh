#!/bin/bash

# OmniHome Firewall Configuration Script
# This script configures the firewall for OmniHome deployment

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   OmniHome Firewall Configuration${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Error: This script must be run as root (sudo)${NC}"
    echo -e "${YELLOW}Usage: sudo ./configure-firewall.sh${NC}"
    exit 1
fi

# Function to check if ufw is installed
check_ufw() {
    if ! command -v ufw &> /dev/null; then
        echo -e "${YELLOW}Installing UFW firewall...${NC}"
        apt-get update -y
        apt-get install -y ufw
        echo -e "${GREEN}✓ UFW installed${NC}"
    else
        echo -e "${GREEN}✓ UFW is already installed${NC}"
    fi
}

# Function to configure firewall rules
configure_rules() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Configuring Firewall Rules${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    # Allow SSH (important to do this first to avoid locking yourself out)
    echo -e "${YELLOW}Allowing SSH (port 22)...${NC}"
    ufw allow 22/tcp
    echo -e "${GREEN}✓ SSH allowed${NC}"

    # Allow HTTP
    echo -e "${YELLOW}Allowing HTTP (port 80)...${NC}"
    ufw allow 80/tcp
    echo -e "${GREEN}✓ HTTP allowed${NC}"

    # Allow HTTPS
    echo -e "${YELLOW}Allowing HTTPS (port 443)...${NC}"
    ufw allow 443/tcp
    echo -e "${GREEN}✓ HTTPS allowed${NC}"

    # Allow Backend API port
    echo -e "${YELLOW}Allowing Backend API (port 3000)...${NC}"
    ufw allow 3000/tcp
    echo -e "${GREEN}✓ Backend API allowed${NC}"

    # Allow Frontend port
    echo -e "${YELLOW}Allowing Frontend (port 5173)...${NC}"
    ufw allow 5173/tcp
    echo -e "${GREEN}✓ Frontend allowed${NC}"

    # Optional: Allow custom ports if specified
    if [ -n "$CUSTOM_PORTS" ]; then
        echo -e "${YELLOW}Allowing custom ports: $CUSTOM_PORTS${NC}"
        for port in $CUSTOM_PORTS; do
            ufw allow $port/tcp
            echo -e "${GREEN}✓ Port $port allowed${NC}"
        done
    fi
}

# Function to enable firewall
enable_firewall() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Enabling Firewall${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    echo -e "${YELLOW}Enabling UFW firewall...${NC}"
    ufw --force enable
    echo -e "${GREEN}✓ Firewall enabled${NC}"
}

# Function to display status
display_status() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Firewall Status${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    ufw status verbose
}

# Function to display summary
display_summary() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   Configuration Complete!${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    echo -e "${GREEN}Summary:${NC}"
    echo -e "  ${GREEN}✓${NC} Firewall configured"
    echo -e "  ${GREEN}✓${NC} SSH (port 22) allowed"
    echo -e "  ${GREEN}✓${NC} HTTP (port 80) allowed"
    echo -e "  ${GREEN}✓${NC} HTTPS (port 443) allowed"
    echo -e "  ${GREEN}✓${NC} Backend API (port 3000) allowed"
    echo -e "  ${GREEN}✓${NC} Frontend (port 5173) allowed"
    echo ""

    echo -e "${BLUE}Useful Commands:${NC}"
    echo -e "  ${YELLOW}Check status:${NC} sudo ufw status"
    echo -e "  ${YELLOW}Allow port:${NC} sudo ufw allow <port>/tcp"
    echo -e "  ${YELLOW}Deny port:${NC} sudo ufw deny <port>/tcp"
    echo -e "  ${YELLOW}Disable firewall:${NC} sudo ufw disable"
    echo -e "  ${YELLOW}Reset firewall:${NC} sudo ufw reset"
    echo ""

    echo -e "${YELLOW}⚠️  Important:${NC}"
    echo -e "  Make sure you can still access your VM via SSH before closing this session."
    echo -e "  If you get locked out, you may need to access your VM through the cloud provider's console."
    echo ""
}

# Main execution
check_ufw
configure_rules
enable_firewall
display_status
display_summary
