# OmniHome Deployment Guide

This guide provides step-by-step instructions for deploying the OmniHome Smart Home application on an online VM.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start Deployment](#quick-start-deployment)
3. [Manual Deployment](#manual-deployment)
4. [Production Deployment with Systemd](#production-deployment-with-systemd)
5. [Nginx Configuration](#nginx-configuration)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **Python**: 3.8 or higher
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **RAM**: Minimum 2GB (4GB recommended)
- **Disk Space**: Minimum 5GB

### Required Software

Install the following packages on your VM:

```bash
# Update package list
sudo apt-get update

# Install Python and pip
sudo apt-get install -y python3 python3-pip python3-venv

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx (optional, for production)
sudo apt-get install -y nginx

# Install OpenSSL (for generating secret keys)
sudo apt-get install -y openssl
```

---

## Quick Start Deployment

The easiest way to deploy is using the provided deployment script.

### Step 1: Clone the Repository

```bash
# Navigate to the app directory
cd /app

# Clone the repository (if not already cloned)
git clone <your-repository-url> OmniHome

# Or if you already have the files, ensure they are in /app/OmniHome/
```

### Step 2: Run the Deployment Script

```bash
# Navigate to the project directory
cd /app/OmniHome

# Make the script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

The deployment script will:
- Check for required dependencies
- Set up the Python virtual environment
- Install Python dependencies
- Create and configure the `.env` file
- Initialize the database
- Install Node.js dependencies
- Build the frontend for production
- Configure Nginx (if permissions allow)
- Create systemd services (if permissions allow)

### Step 3: Start the Application

After deployment, you can start the application in two ways:

#### Option 1: Manual Start (Development Mode)

```bash
cd /app/OmniHome
./run-app.sh
```

#### Option 2: Systemd Services (Production Mode)

```bash
# Start the services
sudo systemctl start omnihome-backend
sudo systemctl start omnihome-frontend

# Enable services to start on boot
sudo systemctl enable omnihome-backend
sudo systemctl enable omnihome-frontend
```

### Step 4: Access the Application

- **Frontend**: `http://<your-vm-ip>:5173`
- **Backend API**: `http://<your-vm-ip>:3000`
- **API Documentation**: `http://<your-vm-ip>:3000/docs`

---

## Manual Deployment

If you prefer to deploy manually or need more control over the process:

### Step 1: Setup Backend

```bash
# Navigate to server directory
cd /app/OmniHome/server

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env

# Generate a secure secret key
SECRET_KEY=$(openssl rand -hex 32)
sed -i "s/your-secret-key-change-in-production/$SECRET_KEY/" .env

# Update environment for production
sed -i 's/ENVIRONMENT=development/ENVIRONMENT=production/' .env
sed -i 's/DEBUG=true/DEBUG=false/' .env

# Update CORS (allow all origins or specify your domain)
sed -i 's/"http:\/\/localhost:5173","http:\/\/localhost:3000"/"*"/' .env

# Initialize database
python3 -c "from app.core.database import init_db; import asyncio; asyncio.run(init_db())"
```

### Step 2: Setup Frontend

```bash
# Navigate to client directory
cd /app/OmniHome/client

# Install dependencies
npm install

# Build for production
npm run build
```

### Step 3: Start Services

```bash
# Start backend (in a terminal)
cd /app/OmniHome/server
source venv/bin/activate
python3 main.py

# Start frontend (in another terminal)
cd /app/OmniHome/client/dist
python3 -m http.server 5173
```

---

## Production Deployment with Systemd

For a production deployment, use systemd services to manage the application.

### Step 1: Copy Service Files

```bash
# Copy backend service file
sudo cp /app/OmniHome/omnihome-backend.service /etc/systemd/system/

# Copy frontend service file
sudo cp /app/OmniHome/omnihome-frontend.service /etc/systemd/system/
```

### Step 2: Reload Systemd

```bash
sudo systemctl daemon-reload
```

### Step 3: Start and Enable Services

```bash
# Start services
sudo systemctl start omnihome-backend
sudo systemctl start omnihome-frontend

# Enable services to start on boot
sudo systemctl enable omnihome-backend
sudo systemctl enable omnihome-frontend
```

### Step 4: Check Service Status

```bash
# Check backend status
sudo systemctl status omnihome-backend

# Check frontend status
sudo systemctl status omnihome-frontend

# View logs
sudo journalctl -u omnihome-backend -f
sudo journalctl -u omnihome-frontend -f
```

### Step 5: Manage Services

```bash
# Stop services
sudo systemctl stop omnihome-backend
sudo systemctl stop omnihome-frontend

# Restart services
sudo systemctl restart omnihome-backend
sudo systemctl restart omnihome-frontend

# Disable services
sudo systemctl disable omnihome-backend
sudo systemctl disable omnihome-frontend
```

---

## Nginx Configuration

For production use, configure Nginx as a reverse proxy.

### Step 1: Copy Nginx Configuration

```bash
# Copy the Nginx configuration file
sudo cp /app/OmniHome/omnihome-nginx.conf /etc/nginx/sites-available/omnihome
```

### Step 2: Enable the Site

```bash
# Create a symbolic link
sudo ln -s /etc/nginx/sites-available/omnihome /etc/nginx/sites-enabled/

# Test the configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 3: Configure Firewall

```bash
# Allow HTTP traffic
sudo ufw allow 80/tcp

# Allow HTTPS traffic (if using SSL)
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### Step 4: Access via Nginx

After configuring Nginx, access the application at:
- **Frontend**: `http://<your-vm-ip>/`
- **Backend API**: `http://<your-vm-ip>/api/`
- **API Documentation**: `http://<your-vm-ip>/docs`

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

If you get an error that port 3000 or 5173 is already in use:

```bash
# Find the process using the port
sudo lsof -i :3000
sudo lsof -i :5173

# Kill the process
sudo kill -9 <PID>
```

#### 2. Permission Denied

If you get permission errors:

```bash
# Make scripts executable
chmod +x /app/OmniHome/deploy.sh
chmod +x /app/OmniHome/run-app.sh
chmod +x /app/OmniHome/stop-app.sh

# Fix ownership
sudo chown -R $USER:$USER /app/OmniHome
```

#### 3. Database Initialization Failed

If database initialization fails:

```bash
cd /app/OmniHome/server
source venv/bin/activate
python3 -c "from app.core.database import init_db; import asyncio; asyncio.run(init_db())"
```

#### 4. Frontend Build Failed

If the frontend build fails:

```bash
cd /app/OmniHome/client
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 5. Service Won't Start

If systemd services won't start:

```bash
# Check service status for errors
sudo systemctl status omnihome-backend
sudo systemctl status omnihome-frontend

# View detailed logs
sudo journalctl -u omnihome-backend -n 50
sudo journalctl -u omnihome-frontend -n 50
```

#### 6. Nginx Configuration Errors

If Nginx configuration fails:

```bash
# Test configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Logs

- **Server logs**: `/app/OmniHome/server.log`
- **Client logs**: `/app/OmniHome/client.log`
- **Systemd logs**: `sudo journalctl -u omnihome-backend -f`
- **Nginx logs**: `/var/log/nginx/`

### Getting Help

If you encounter issues not covered here:

1. Check the logs for error messages
2. Verify all prerequisites are installed
3. Ensure all environment variables are set correctly
4. Check that ports 3000 and 5173 are not blocked by firewall

---

## Security Considerations

### Production Checklist

- [ ] Change the `SECRET_KEY` in `.env` to a strong random value
- [ ] Update `ALLOWED_ORIGINS` to your specific domain instead of `*`
- [ ] Set `DEBUG=false` in production
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Regularly update dependencies
- [ ] Monitor logs for suspicious activity
- [ ] Implement backup strategy for the database

### Generating a Secure Secret Key

```bash
openssl rand -hex 32
```

---

## Updating the Application

### Update Code

```bash
cd /app/OmniHome
git pull origin main
```

### Update Backend

```bash
cd /app/OmniHome/server
source venv/bin/activate
pip install -r requirements.txt --upgrade
```

### Update Frontend

```bash
cd /app/OmniHome/client
npm install
npm run build
```

### Restart Services

```bash
sudo systemctl restart omnihome-backend
sudo systemctl restart omnihome-frontend
```

---

## Backup and Restore

### Backup Database

```bash
cp /app/OmniHome/server/omnihome.db /app/OmniHome/server/omnihome.db.backup
```

### Restore Database

```bash
cp /app/OmniHome/server/omnihome.db.backup /app/OmniHome/server/omnihome.db
```

---

## Additional Resources

- [API Documentation](docs/API_SPECIFICATION.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Frontend Guidelines](client/guidelines/Guidelines.md)
