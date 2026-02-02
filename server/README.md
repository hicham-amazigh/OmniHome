# OmniHome Backend Server

FastAPI backend server for the OmniHome smart home application.

## Features

- **Authentication**: PIN-based and biometric authentication with JWT tokens
- **Security System**: Arm/disarm, panic alerts, garage door control, door lock control
- **Climate Control**: Temperature, fan speed, and mode management
- **Garden & Utilities**: Irrigation zones, watering schedules, water tank management
- **Lighting Control**: Master light control and individual light management
- **Camera System**: Camera list, streaming, snapshots, and recording
- **Activity Logging**: Comprehensive activity log with filtering
- **Dashboard**: Aggregated data for main dashboard

## Tech Stack

- **Framework**: FastAPI 0.109.0
- **Database**: SQLite with SQLAlchemy 2.0.25 (async)
- **Authentication**: JWT (python-jose) with bcrypt password hashing
- **Validation**: Pydantic 2.5.3

## Project Structure

```
server/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py          # Authentication endpoints
│   │       ├── security.py      # Security system endpoints
│   │       ├── climate.py      # Climate control endpoints
│   │       ├── garden.py       # Garden & utilities endpoints
│   │       ├── lighting.py     # Lighting control endpoints
│   │       ├── camera.py       # Camera system endpoints
│   │       ├── activity.py     # Activity log endpoints
│   │       ├── dashboard.py    # Dashboard endpoints
│   │       └── users.py        # User management endpoints
│   ├── core/
│   │   ├── config.py       # Application configuration
│   │   ├── database.py     # Database connection
│   │   └── security.py     # Security utilities (JWT, hashing)
│   ├── models/
│   │   ├── user.py
│   │   ├── session.py
│   │   ├── biometric.py
│   │   ├── security_system.py
│   │   ├── security_sensor.py
│   │   ├── door.py
│   │   ├── security_alert.py
│   │   ├── climate_settings.py
│   │   ├── climate_history.py
│   │   ├── garden_zone.py
│   │   ├── water_tank.py
│   │   ├── watering_schedule.py
│   │   ├── watering_history.py
│   │   ├── room.py
│   │   ├── light.py
│   │   ├── lighting_history.py
│   │   ├── camera.py
│   │   ├── camera_recording.py
│   │   ├── camera_snapshot.py
│   │   ├── activity_log.py
│   │   └── system_setting.py
│   └── schemas/
│       ├── common.py
│       ├── user.py
│       ├── token.py
│       ├── security.py
│       ├── climate.py
│       ├── garden.py
│       ├── lighting.py
│       ├── camera.py
│       ├── activity.py
│       └── dashboard.py
├── scripts/
│   └── init_db.py      # Database initialization script
├── main.py              # Application entry point
├── requirements.txt       # Python dependencies
└── README.md            # This file
```

## Installation

1. **Clone the repository**:
   ```bash
   cd server
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize the database**:
   ```bash
   python scripts/init_db.py
   ```

## Configuration

Create a `.env` file in the server directory:

```env
# API Settings
API_V1_STR=/api/v1
PROJECT_NAME=OmniHome API

# Environment
ENVIRONMENT=development
DEBUG=true

# CORS Settings
ALLOWED_ORIGINS=["http://localhost:5173","http://localhost:3000"]

# Database Settings
DATABASE_URL=sqlite+aiosqlite:///./omnihome.db

# Security Settings
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# PIN Settings
PIN_LENGTH=4
DEFAULT_PIN=1234

# Biometric Settings
BIOMETRIC_ENABLED=true

# WebSocket Settings
WS_HEARTBEAT_INTERVAL=30
```

## Running the Server

**Development mode**:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Production mode**:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/v1/auth/login/pin` - Login with PIN
- `POST /api/v1/auth/login/biometric` - Login with biometric
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh access token

### Security
- `GET /api/v1/security/status` - Get security status
- `POST /api/v1/security/arm` - Arm/disarm system
- `POST /api/v1/security/panic` - Trigger panic alert
- `GET /api/v1/security/garage/status` - Get garage door status
- `POST /api/v1/security/garage/control` - Control garage door
- `POST /api/v1/security/doors/{door_id}/control` - Control door lock

### Climate
- `GET /api/v1/climate/status` - Get climate status
- `POST /api/v1/climate/temperature` - Set temperature
- `POST /api/v1/climate/fan-speed` - Set fan speed
- `POST /api/v1/climate/mode` - Set climate mode
- `POST /api/v1/climate/apply` - Apply all settings

### Garden
- `GET /api/v1/garden/status` - Get garden status
- `POST /api/v1/garden/zones/{zone_id}/toggle` - Toggle zone
- `POST /api/v1/garden/zones/all` - Control all zones
- `POST /api/v1/garden/schedule` - Set watering schedule
- `GET /api/v1/garden/water-tank` - Get water tank status
- `POST /api/v1/garden/water-tank/refill` - Refill water tank

### Lighting
- `GET /api/v1/lighting/status` - Get lighting status
- `POST /api/v1/lighting/master` - Toggle all lights
- `POST /api/v1/lighting/lights/{light_id}/control` - Control individual light

### Cameras
- `GET /api/v1/cameras` - Get camera list
- `GET /api/v1/cameras/{camera_id}/stream` - Get stream URL
- `POST /api/v1/cameras/{camera_id}/snapshot` - Take snapshot
- `POST /api/v1/cameras/{camera_id}/record/start` - Start recording
- `POST /api/v1/cameras/{camera_id}/record/stop` - Stop recording

### Activity
- `GET /api/v1/activity/logs` - Get activity logs
- `GET /api/v1/activity/logs/{log_id}` - Get specific log entry

### Dashboard
- `GET /api/v1/dashboard` - Get dashboard data

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `POST /api/v1/users/change-pin` - Change PIN
- `POST /api/v1/users/biometric/register` - Register biometric

## Database

The application uses SQLite for data persistence. The database file (`omnihome.db`) will be created automatically when the server starts.

### Database Schema

See [`../docs/DATABASE_SCHEMA.md`](../docs/DATABASE_SCHEMA.md) for the complete database schema.

## Default Credentials

- **PIN**: 1234
- **Email**: admin@omnihome.com
- **Role**: admin

## Development

### Adding New Endpoints

1. Create Pydantic schemas in `app/schemas/`
2. Create route handlers in `app/api/v1/`
3. Register the router in `app/api/v1/__init__.py`
4. Update API documentation in `docs/API_SPECIFICATION.md`

### Database Migrations

For production use, consider using Alembic for database migrations:

```bash
alembic init alembic
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## License

MIT
