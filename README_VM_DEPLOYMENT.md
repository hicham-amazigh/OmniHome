# OmniHome VM Deployment Quick Start

This is a quick start guide for deploying OmniHome on your online VM at `/app/OmniHome/`.

## Quick Start (3 Steps)

### 1. Install Prerequisites

```bash
# Update system
sudo apt-get update

# Install Python
sudo apt-get install -y python3 python3-pip python3-venv

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx (optional but recommended)
sudo apt-get install -y nginx
```

### 2. Run Deployment Script

```bash
cd /app/OmniHome
chmod +x deploy.sh
./deploy.sh
```

### 3. Start the Application

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

- **Frontend**: `http://<your-vm-ip>:5173`
- **Backend API**: `http://<your-vm-ip>:3000`
- **API Docs**: `http://<your-vm-ip>:3000/docs`

## Get Your VM IP

```bash
hostname -I | awk '{print $1}'
```

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

## Troubleshooting

### Port Already in Use

```bash
sudo lsof -i :3000
sudo lsof -i :5173
sudo kill -9 <PID>
```

### Permission Issues

```bash
chmod +x /app/OmniHome/*.sh
sudo chown -R $USER:$USER /app/OmniHome
```

### Database Issues

```bash
cd /app/OmniHome/server
source venv/bin/activate
python3 -c "from app.core.database import init_db; import asyncio; asyncio.run(init_db())"
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
