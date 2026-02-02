# OmniHome VM Deployment Quick Start

This is a quick start guide for deploying OmniHome on your online VM at `/app/OmniHome/`.

## Quick Start (4 Steps)

### 1. Configure the VM

Run the VM configuration script to set up the system:

```bash
# Upload the configure-vm.sh script to your VM
# Make it executable
chmod +x configure-vm.sh

# Run the configuration script (requires sudo)
sudo ./configure-vm.sh
```

This script will:
- Update the system
- Install Python, Node.js, Nginx, and other dependencies
- Create the `omnihome` user
- Set up directory structure
- Configure firewall (ports 22, 80, 443, 3000, 5173)
- Configure Nginx
- Install systemd services
- Configure log rotation
- Generate a secure secret key

### 2. Upload Application Files

Upload your application files to `/app/OmniHome/` on the VM.

```bash
# Using scp (from your local machine)
scp -r /path/to/omnihome/* root@<your-vm-ip>:/app/OmniHome/

# Or using git (on the VM)
cd /app/OmniHome
sudo -u omnihome git clone <your-repository-url> .
```

### 3. Run Deployment Script

```bash
cd /app/OmniHome
chmod +x deploy.sh
sudo -u omnihome ./deploy.sh
```

### 4. Start the Application

```bash
# Option A: Manual start (for testing)
./run-app.sh

# Option B: Systemd services (for production)
sudo systemctl start omnihome-backend
sudo systemctl start omnihome-frontend
sudo systemctl enable omnihome-backend
sudo systemctl enable omnihome-frontend
```

## Access Your Application

- **Frontend**: `http://<your-vm-ip>/` (via Nginx) or `http://<your-vm-ip>:5173` (direct)
- **Backend API**: `http://<your-vm-ip>/api/` (via Nginx) or `http://<your-vm-ip>:3000` (direct)
- **API Docs**: `http://<your-vm-ip>/docs` (via Nginx) or `http://<your-vm-ip>:3000/docs` (direct)

## Get Your VM IP

```bash
hostname -I | awk '{print $1}'
```

## VM Configuration Details

### User Account

The configuration script creates a dedicated user `omnihome` for running the application:

- **Username**: `omnihome`
- **Home Directory**: `/app/OmniHome`
- **Shell**: `/bin/bash`

### Firewall Rules

The following ports are opened by default:

| Port | Protocol | Purpose |
|------|----------|---------|
| 22   | TCP      | SSH access |
| 80   | TCP      | HTTP (Nginx) |
| 443  | TCP      | HTTPS (Nginx) |
| 3000 | TCP      | Backend API (direct) |
| 5173 | TCP      | Frontend (direct) |

### Systemd Services

Two systemd services are created:

1. **omnihome-backend**: Runs the FastAPI backend server
2. **omnihome-frontend**: Runs the frontend static file server

Both services are configured to:
- Start automatically on boot (when enabled)
- Restart automatically on failure
- Run as the `omnihome` user
- Log to systemd journal

### Log Rotation

Application logs are automatically rotated:

- **Location**: `/app/OmniHome/server.log` and `/app/OmniHome/client.log`
- **Rotation**: Daily
- **Retention**: 7 days
- **Compression**: Enabled

## Useful Commands

### Check Service Status

```bash
# Check backend
sudo systemctl status omnihome-backend

# Check frontend
sudo systemctl status omnihome-frontend
```

### View Logs

```bash
# Backend logs
sudo journalctl -u omnihome-backend -f

# Frontend logs
sudo journalctl -u omnihome-frontend -f

# Manual mode logs
tail -f /app/OmniHome/server.log
tail -f /app/OmniHome/client.log
```

### Stop Services

```bash
# Manual mode
./stop-app.sh

# Systemd mode
sudo systemctl stop omnihome-backend
sudo systemctl stop omnihome-frontend
```

### Restart Services

```bash
# Systemd mode
sudo systemctl restart omnihome-backend
sudo systemctl restart omnihome-frontend
```

## Configure Nginx (Optional)

If you want to use Nginx as a reverse proxy:

```bash
# Copy configuration
sudo cp /app/OmniHome/omnihome-nginx.conf /etc/nginx/sites-available/omnihome

# Enable site
sudo ln -s /etc/nginx/sites-available/omnihome /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

Then access at `http://<your-vm-ip>/` instead of `:5173`.

## Manual Configuration (Alternative to configure-vm.sh)

If you prefer to configure the VM manually instead of using the [`configure-vm.sh`](configure-vm.sh) script:

### 1. Update System

```bash
sudo apt-get update
```

### 2. Install Dependencies

```bash
# Install Python
sudo apt-get install -y python3 python3-pip python3-venv

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt-get install -y nginx

# Install OpenSSL
sudo apt-get install -y openssl
```

### 3. Create Application User

```bash
sudo useradd -r -s /bin/bash -d /app/OmniHome omnihome
```

### 4. Setup Directory Structure

```bash
sudo mkdir -p /app/OmniHome
sudo chown -R omnihome:omnihome /app/OmniHome
sudo chmod -R 755 /app/OmniHome
```

### 5. Configure Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Backend API
sudo ufw allow 5173/tcp  # Frontend
sudo ufw --force enable
```

### 6. Configure Nginx

```bash
sudo cp /app/OmniHome/omnihome-nginx.conf /etc/nginx/sites-available/omnihome
sudo ln -s /etc/nginx/sites-available/omnihome /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Install Systemd Services

```bash
sudo cp /app/OmniHome/omnihome-backend.service /etc/systemd/system/
sudo cp /app/OmniHome/omnihome-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
```

### 8. Configure Log Rotation

```bash
sudo tee /etc/logrotate.d/omnihome > /dev/null <<EOF
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
```

## Troubleshooting

### Virtual Environment Issues

If you encounter the error `venv/bin/activate: No such file or directory`:

```bash
cd /app/OmniHome/server
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Port Already in Use

```bash
sudo lsof -i :3000
sudo lsof -i :5173
sudo kill -9 <PID>
```

### Permission Issues

```bash
chmod +x /app/OmniHome/*.sh
sudo chown -R omnihome:omnihome /app/OmniHome
```

### Database Issues

```bash
cd /app/OmniHome/server
sudo -u omnihome bash -c "source venv/bin/activate && python3 -c \"from app.core.database import init_db; import asyncio; asyncio.run(init_db())\""
```

### Service Won't Start

Check service status and logs:

```bash
# Check backend status
sudo systemctl status omnihome-backend

# Check frontend status
sudo systemctl status omnihome-frontend

# View backend logs
sudo journalctl -u omnihome-backend -n 50

# View frontend logs
sudo journalctl -u omnihome-frontend -n 50

# Follow logs in real-time
sudo journalctl -u omnihome-backend -f
```

### Nginx Issues

```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# View Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Reload Nginx
sudo systemctl reload nginx
```

### Firewall Issues

```bash
# Check firewall status
sudo ufw status

# Allow a port
sudo ufw allow <port>/tcp

# Disable firewall temporarily
sudo ufw disable
```

### Frontend Build Failed

```bash
cd /app/OmniHome/client
sudo -u omnihome bash -c "rm -rf node_modules package-lock.json && npm install && npm run build"
```

## Full Documentation

For detailed deployment instructions, see [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Security Notes

⚠️ **Important**: For production deployment:

1. Generate a secure secret key: `openssl rand -hex 32`
2. Update `SECRET_KEY` in `/app/OmniHome/server/.env`
3. Update `ALLOWED_ORIGINS` to your specific domain
4. Configure HTTPS/SSL certificates
5. Set up firewall rules

## Support

If you encounter issues:

1. Check the logs
2. Verify all prerequisites are installed
3. Ensure ports 3000 and 5173 are not blocked
4. See [`DEPLOYMENT.md`](DEPLOYMENT.md) for detailed troubleshooting
