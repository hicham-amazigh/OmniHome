# OmniHome Database Schema

## Overview
This document defines the database schema for the OmniHome smart home application. The schema is designed to support all features including authentication, security, climate control, garden/irrigation, lighting, and activity logging.

**Database Technology:** PostgreSQL (recommended) or MySQL

---

## Table of Contents
1. [Users](#users)
2. [Sessions](#sessions)
3. [Biometrics](#biometrics)
4. [SecuritySystem](#securitysystem)
5. [SecuritySensors](#securitysensors)
6. [Doors](#doors)
7. [SecurityAlerts](#securityalerts)
8. [ClimateSettings](#climatesettings)
9. [ClimateHistory](#climatehistory)
10. [GardenZones](#gardenzones)
11. [WaterTank](#watertank)
12. [WateringSchedule](#wateringschedule)
13. [WateringHistory](#wateringhistory)
14. [Rooms](#rooms)
15. [Lights](#lights)
16. [LightingHistory](#lightinghistory)
17. [Cameras](#cameras)
18. [CameraRecordings](#camerarecordings)
19. [CameraSnapshots](#camerasnapshots)
20. [ActivityLogs](#activitylogs)
21. [SystemSettings](#systemsettings)

---

## Users

Stores user account information.

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'guest')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Fields:**
- `id`: Unique user identifier (UUID)
- `name`: User's full name
- `email`: User's email address (unique)
- `pin_hash`: Hashed 4-digit PIN code
- `role`: User role (admin, user, guest)
- `is_active`: Whether the account is active
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

---

## Sessions

Stores active user sessions for authentication.

```sql
CREATE TABLE sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    refresh_token_hash VARCHAR(255) NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

**Fields:**
- `id`: Unique session identifier (UUID)
- `user_id`: Reference to user
- `token_hash`: Hashed JWT access token
- `refresh_token_hash`: Hashed refresh token
- `ip_address`: IP address of the session
- `user_agent`: User agent string
- `expires_at`: Session expiration timestamp
- `created_at`: Session creation timestamp
- `last_accessed_at`: Last access timestamp

---

## Biometrics

Stores biometric data for authentication.

```sql
CREATE TABLE biometrics (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    biometric_type VARCHAR(50) NOT NULL CHECK (biometric_type IN ('faceid', 'fingerprint')),
    biometric_data TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, biometric_type)
);

CREATE INDEX idx_biometrics_user_id ON biometrics(user_id);
```

**Fields:**
- `id`: Unique biometric record identifier (UUID)
- `user_id`: Reference to user
- `biometric_type`: Type of biometric (faceid, fingerprint)
- `biometric_data`: Encoded biometric data
- `is_active`: Whether the biometric is active
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

---

## SecuritySystem

Stores the current security system state.

```sql
CREATE TABLE security_system (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    armed BOOLEAN DEFAULT false,
    mode VARCHAR(50) DEFAULT 'home' CHECK (mode IN ('home', 'away', 'night')),
    last_armed_at TIMESTAMP WITH TIME ZONE,
    last_disarmed_at TIMESTAMP WITH TIME ZONE,
    last_armed_by VARCHAR(36) REFERENCES users(id),
    last_disarmed_by VARCHAR(36) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Unique security system identifier (UUID)
- `armed`: Whether the system is armed
- `mode`: Security mode (home, away, night)
- `last_armed_at`: Last armed timestamp
- `last_disarmed_at`: Last disarmed timestamp
- `last_armed_by`: User who last armed the system
- `last_disarmed_by`: User who last disarmed the system
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

---

## SecuritySensors

Stores security sensor information and status.

```sql
CREATE TABLE security_sensors (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('motion', 'door', 'window', 'garage', 'camera')),
    location VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'offline')),
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_security_sensors_type ON security_sensors(type);
CREATE INDEX idx_security_sensors_status ON security_sensors(status);
```

**Fields:**
- `id`: Unique sensor identifier (UUID)
- `name`: Sensor name
- `type`: Sensor type (motion, door, window, garage, camera)
- `location`: Sensor location
- `status`: Sensor status (active, inactive, offline)
- `last_triggered_at`: Last triggered timestamp
- `last_activity_at`: Last activity timestamp
- `metadata`: Additional sensor data (JSON)
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

---

## Doors

Stores door lock status and information.

```sql
CREATE TABLE doors (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    door_id VARCHAR(50) UNIQUE NOT NULL,
    locked BOOLEAN DEFAULT true,
    last_locked_at TIMESTAMP WITH TIME ZONE,
    last_unlocked_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doors_door_id ON doors(door_id);
```

**Fields:**
- `id`: Unique door record identifier (UUID)
- `name`: Door name (e.g., "Front Door", "Back Door")
- `door_id`: Unique door identifier (e.g., "front", "back")
- `locked`: Whether the door is locked
- `last_locked_at`: Last locked timestamp
- `last_unlocked_at`: Last unlocked timestamp
- `last_activity_at`: Last activity timestamp
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

---

## SecurityAlerts

Stores security alerts and panic alerts.

```sql
CREATE TABLE security_alerts (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('panic', 'motion', 'door_open', 'garage_obstacle', 'intrusion')),
    severity VARCHAR(50) DEFAULT 'high' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'false_alarm')),
    triggered_by VARCHAR(36) REFERENCES users(id),
    sensor_id VARCHAR(36) REFERENCES security_sensors(id),
    details JSONB,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_security_alerts_type ON security_alerts(alert_type);
CREATE INDEX idx_security_alerts_status ON security_alerts(status);
CREATE INDEX idx_security_alerts_triggered_at ON security_alerts(triggered_at);
```

**Fields:**
- `id`: Unique alert identifier (UUID)
- `alert_type`: Type of alert (panic, motion, door_open, garage_obstacle, intrusion)
- `severity`: Alert severity (low, medium, high, critical)
- `location`: Alert location
- `status`: Alert status (active, acknowledged, resolved, false_alarm)
- `triggered_by`: User who triggered the alert (for panic)
- `sensor_id`: Sensor that triggered the alert
- `details`: Additional alert data (JSON)
- `triggered_at`: Alert triggered timestamp
- `acknowledged_at`: Alert acknowledged timestamp
- `resolved_at`: Alert resolved timestamp

---

## ClimateSettings

Stores current climate control settings.

```sql
CREATE TABLE climate_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    target_temperature INTEGER NOT NULL CHECK (target_temperature BETWEEN 16 AND 30),
    current_temperature DECIMAL(5,2),
    humidity INTEGER CHECK (humidity BETWEEN 0 AND 100),
    mode VARCHAR(50) DEFAULT 'cool' CHECK (mode IN ('cool', 'heat', 'eco')),
    fan_speed VARCHAR(50) DEFAULT 'med' CHECK (fan_speed IN ('low', 'med', 'high')),
    power_usage DECIMAL(10,2),
    active BOOLEAN DEFAULT true,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(36) REFERENCES users(id)
);
```

**Fields:**
- `id`: Unique climate settings identifier (UUID)
- `target_temperature`: Target temperature (16-30°C)
- `current_temperature`: Current temperature
- `humidity`: Current humidity percentage (0-100)
- `mode`: Climate mode (cool, heat, eco)
- `fan_speed`: Fan speed (low, med, high)
- `power_usage`: Current power usage in kW
- `active`: Whether climate control is active
- `last_updated_at`: Last update timestamp
- `updated_by`: User who last updated settings

---

## ClimateHistory

Stores historical climate data for analytics.

```sql
CREATE TABLE climate_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    temperature DECIMAL(5,2) NOT NULL,
    humidity INTEGER NOT NULL,
    mode VARCHAR(50) NOT NULL,
    fan_speed VARCHAR(50) NOT NULL,
    power_usage DECIMAL(10,2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_climate_history_recorded_at ON climate_history(recorded_at);
CREATE INDEX idx_climate_history_temperature ON climate_history(temperature);
```

**Fields:**
- `id`: Unique history record identifier (UUID)
- `temperature`: Recorded temperature
- `humidity`: Recorded humidity
- `mode`: Climate mode at recording time
- `fan_speed`: Fan speed at recording time
- `power_usage`: Power usage at recording time
- `recorded_at`: Recording timestamp

---

## GardenZones

Stores irrigation zone information and status.

```sql
CREATE TABLE garden_zones (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT false,
    soil_moisture INTEGER CHECK (soil_moisture BETWEEN 0 AND 100),
    last_watered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_garden_zones_zone_id ON garden_zones(zone_id);
CREATE INDEX idx_garden_zones_active ON garden_zones(active);
```

**Fields:**
- `id`: Unique zone record identifier (UUID)
- `zone_id`: Zone identifier (1, 2, 3, etc.)
- `name`: Zone name (e.g., "Front Yard", "Back Yard")
- `active`: Whether the zone is currently watering
- `soil_moisture`: Current soil moisture percentage (0-100)
- `last_watered_at`: Last watering timestamp
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

---

## WaterTank

Stores water tank information and level.

```sql
CREATE TABLE water_tank (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 100),
    capacity INTEGER NOT NULL DEFAULT 1000,
    available INTEGER NOT NULL,
    usage_today INTEGER DEFAULT 0,
    last_refilled_at TIMESTAMP WITH TIME ZONE,
    low_level_alert BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Unique water tank record identifier (UUID)
- `level`: Current water level percentage (0-100)
- `capacity`: Total tank capacity in liters
- `available`: Available water in liters
- `usage_today`: Water usage today in liters
- `last_refilled_at`: Last refill timestamp
- `low_level_alert`: Whether low level alert is active
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

---

## WateringSchedule

Stores watering schedule settings.

```sql
CREATE TABLE watering_schedule (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    time VARCHAR(5) NOT NULL, -- Format: HH:MM
    duration INTEGER NOT NULL CHECK (duration BETWEEN 5 AND 120),
    zones INTEGER[] NOT NULL, -- Array of zone IDs
    enabled BOOLEAN DEFAULT true,
    days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7], -- 1=Monday, 7=Sunday
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Unique schedule identifier (UUID)
- `time`: Watering time (HH:MM format)
- `duration`: Watering duration in minutes (5-120)
- `zones`: Array of zone IDs to water
- `enabled`: Whether the schedule is enabled
- `days_of_week`: Days of week to water (1=Monday, 7=Sunday)
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

---

## WateringHistory

Stores historical watering data.

```sql
CREATE TABLE watering_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    water_used INTEGER NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    triggered_by VARCHAR(50) CHECK (triggered_by IN ('schedule', 'manual', 'auto'))
);

CREATE INDEX idx_watering_history_zone_id ON watering_history(zone_id);
CREATE INDEX idx_watering_history_started_at ON watering_history(started_at);
```

**Fields:**
- `id`: Unique history record identifier (UUID)
- `zone_id`: Zone identifier
- `duration`: Watering duration in minutes
- `water_used`: Water used in liters
- `started_at`: Watering start timestamp
- `completed_at`: Watering completion timestamp
- `triggered_by`: Trigger type (schedule, manual, auto)

---

## Rooms

Stores room information for lighting control.

```sql
CREATE TABLE rooms (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Unique room identifier (UUID)
- `name`: Room name (e.g., "Living Room", "Bedroom")
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

---

## Lights

Stores light information and status.

```sql
CREATE TABLE lights (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    light_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    room_id VARCHAR(36) REFERENCES rooms(id) ON DELETE SET NULL,
    on BOOLEAN DEFAULT false,
    brightness INTEGER CHECK (brightness BETWEEN 0 AND 100),
    color VARCHAR(7), -- Hex color code
    power_usage DECIMAL(10,2),
    last_toggled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lights_light_id ON lights(light_id);
CREATE INDEX idx_lights_room_id ON lights(room_id);
CREATE INDEX idx_lights_on ON lights(on);
```

**Fields:**
- `id`: Unique light record identifier (UUID)
- `light_id`: Unique light identifier
- `name`: Light name
- `room_id`: Reference to room
- `on`: Whether the light is on
- `brightness`: Brightness level (0-100)
- `color`: Light color (hex code)
- `power_usage`: Power usage in watts
- `last_toggled_at`: Last toggle timestamp
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

---

## LightingHistory

Stores historical lighting data for analytics.

```sql
CREATE TABLE lighting_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    light_id VARCHAR(50) NOT NULL,
    on BOOLEAN NOT NULL,
    brightness INTEGER,
    power_usage DECIMAL(10,2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lighting_history_light_id ON lighting_history(light_id);
CREATE INDEX idx_lighting_history_recorded_at ON lighting_history(recorded_at);
```

**Fields:**
- `id`: Unique history record identifier (UUID)
- `light_id`: Light identifier
- `on`: Whether the light was on
- `brightness`: Brightness level at recording time
- `power_usage`: Power usage at recording time
- `recorded_at`: Recording timestamp

---

## Cameras

Stores camera information and status.

```sql
CREATE TABLE cameras (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    camera_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'error')),
    resolution VARCHAR(50),
    stream_url TEXT,
    hls_url TEXT,
    thumbnail_url TEXT,
    is_recording BOOLEAN DEFAULT false,
    last_online_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cameras_camera_id ON cameras(camera_id);
CREATE INDEX idx_cameras_status ON cameras(status);
```

**Fields:**
- `id`: Unique camera record identifier (UUID)
- `camera_id`: Unique camera identifier
- `name`: Camera name
- `location`: Camera location
- `status`: Camera status (online, offline, error)
- `resolution`: Camera resolution (e.g., "1080p")
- `stream_url`: RTSP stream URL
- `hls_url`: HLS stream URL
- `thumbnail_url`: Thumbnail image URL
- `is_recording`: Whether currently recording
- `last_online_at`: Last online timestamp
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

---

## CameraRecordings

Stores camera recording information.

```sql
CREATE TABLE camera_recordings (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    camera_id VARCHAR(50) NOT NULL REFERENCES cameras(camera_id),
    recording_id VARCHAR(50) UNIQUE NOT NULL,
    video_url TEXT NOT NULL,
    duration INTEGER NOT NULL,
    file_size BIGINT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    triggered_by VARCHAR(50) CHECK (triggered_by IN ('manual', 'motion', 'schedule')),
    metadata JSONB
);

CREATE INDEX idx_camera_recordings_camera_id ON camera_recordings(camera_id);
CREATE INDEX idx_camera_recordings_started_at ON camera_recordings(started_at);
```

**Fields:**
- `id`: Unique recording record identifier (UUID)
- `camera_id`: Camera identifier
- `recording_id`: Unique recording identifier
- `video_url`: Video file URL
- `duration`: Recording duration in seconds
- `file_size`: File size in bytes
- `started_at`: Recording start timestamp
- `completed_at`: Recording completion timestamp
- `triggered_by`: Trigger type (manual, motion, schedule)
- `metadata`: Additional recording data (JSON)

---

## CameraSnapshots

Stores camera snapshot information.

```sql
CREATE TABLE camera_snapshots (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    camera_id VARCHAR(50) NOT NULL REFERENCES cameras(camera_id),
    snapshot_id VARCHAR(50) UNIQUE NOT NULL,
    image_url TEXT NOT NULL,
    file_size BIGINT,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    triggered_by VARCHAR(50) CHECK (triggered_by IN ('manual', 'motion'))
);

CREATE INDEX idx_camera_snapshots_camera_id ON camera_snapshots(camera_id);
CREATE INDEX idx_camera_snapshots_captured_at ON camera_snapshots(captured_at);
```

**Fields:**
- `id`: Unique snapshot record identifier (UUID)
- `camera_id`: Camera identifier
- `snapshot_id`: Unique snapshot identifier
- `image_url`: Image file URL
- `file_size`: File size in bytes
- `captured_at`: Capture timestamp
- `triggered_by`: Trigger type (manual, motion)

---

## ActivityLogs

Stores all system activity logs.

```sql
CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    event VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('security', 'climate', 'garden', 'lighting', 'camera', 'user', 'system')),
    details JSONB,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX idx_activity_logs_type ON activity_logs(type);
CREATE INDEX idx_activity_logs_category ON activity_logs(category);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
```

**Fields:**
- `id`: Unique log entry identifier (UUID)
- `timestamp`: Log timestamp
- `event`: Event description
- `type`: Log type (info, warning, success, error)
- `category`: Log category (security, climate, garden, lighting, camera, user, system)
- `details`: Additional event data (JSON)
- `user_id`: User who triggered the event (if applicable)

---

## SystemSettings

Stores global system settings.

```sql
CREATE TABLE system_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    value_type VARCHAR(50) DEFAULT 'string' CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_settings_key ON system_settings(key);
```

**Fields:**
- `id`: Unique setting identifier (UUID)
- `key`: Setting key (unique)
- `value`: Setting value
- `value_type`: Value type (string, number, boolean, json)
- `description`: Setting description
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

**Default Settings:**
```sql
INSERT INTO system_settings (key, value, value_type, description) VALUES
('security.auto_arm_delay', '30', 'number', 'Auto-arm delay in minutes after leaving'),
('security.panic_contacts', '["emergency_services", "family"]', 'json', 'Contacts to notify on panic alert'),
('climate.eco_temperature', '24', 'number', 'Default eco mode temperature'),
('garden.default_watering_duration', '30', 'number', 'Default watering duration in minutes'),
('garden.low_water_threshold', '20', 'number', 'Low water tank alert threshold percentage'),
('lighting.auto_off_delay', '60', 'number', 'Auto-off delay in minutes when no motion'),
('camera.motion_detection_enabled', 'true', 'boolean', 'Enable motion detection on cameras'),
('camera.recording_retention_days', '30', 'number', 'Number of days to retain recordings');
```

---

## Database Triggers

### Update Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_biometrics_updated_at BEFORE UPDATE ON biometrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_system_updated_at BEFORE UPDATE ON security_system
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_sensors_updated_at BEFORE UPDATE ON security_sensors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doors_updated_at BEFORE UPDATE ON doors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garden_zones_updated_at BEFORE UPDATE ON garden_zones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_water_tank_updated_at BEFORE UPDATE ON water_tank
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watering_schedule_updated_at BEFORE UPDATE ON watering_schedule
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lights_updated_at BEFORE UPDATE ON lights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cameras_updated_at BEFORE UPDATE ON cameras
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Database Views

### Dashboard View

```sql
CREATE OR REPLACE VIEW dashboard_view AS
SELECT
    (SELECT armed FROM security_system) AS security_armed,
    (SELECT mode FROM security_system) AS security_mode,
    (SELECT target_temperature FROM climate_settings) AS climate_temperature,
    (SELECT mode FROM climate_settings) AS climate_mode,
    (SELECT time FROM watering_schedule WHERE enabled = true LIMIT 1) AS garden_next_watering,
    (SELECT AVG(soil_moisture) FROM garden_zones) AS garden_soil_moisture,
    (SELECT COUNT(*) FROM lights WHERE on = true) AS lighting_active_lights,
    (SELECT SUM(power_usage) FROM lights WHERE on = true) AS lighting_power_usage;
```

---

## Initial Data

### Default Rooms

```sql
INSERT INTO rooms (id, name) VALUES
('room_001', 'Living Room'),
('room_002', 'Bedroom'),
('room_003', 'Kitchen'),
('room_004', 'Bathroom'),
('room_005', 'Garage');
```

### Default Lights

```sql
INSERT INTO lights (light_id, name, room_id, on, brightness, color, power_usage) VALUES
('light_001', 'Main Light', 'room_001', true, 80, '#FFFFFF', 20),
('light_002', 'Ambient Light', 'room_001', true, 50, '#FFD700', 10),
('light_003', 'Ceiling Light', 'room_002', true, 70, '#FFFFFF', 15),
('light_004', 'Kitchen Light', 'room_003', true, 90, '#FFFFFF', 25),
('light_005', 'Bathroom Light', 'room_004', true, 80, '#FFFFFF', 15),
('light_006', 'Garage Light', 'room_005', true, 100, '#FFFFFF', 30);
```

### Default Garden Zones

```sql
INSERT INTO garden_zones (zone_id, name, soil_moisture) VALUES
(1, 'Front Yard', 65),
(2, 'Back Yard', 70),
(3, 'Side Garden', 60);
```

### Default Security Sensors

```sql
INSERT INTO security_sensors (name, type, location, status) VALUES
('Driveway Motion', 'motion', 'Driveway', 'active'),
('Front Door', 'door', 'Front Door', 'active'),
('Back Door', 'door', 'Back Door', 'active'),
('Garage Door', 'garage', 'Garage', 'active');
```

### Default Doors

```sql
INSERT INTO doors (name, door_id, locked) VALUES
('Front Door', 'front', true),
('Back Door', 'back', true),
('Garage Door', 'garage', true);
```

### Default Cameras

```sql
INSERT INTO cameras (camera_id, name, location, status, resolution) VALUES
('cam_001', 'Driveway Camera', 'Driveway', 'online', '1080p'),
('cam_002', 'Front Door Camera', 'Front Door', 'online', '1080p');
```

### Default Climate Settings

```sql
INSERT INTO climate_settings (target_temperature, current_temperature, humidity, mode, fan_speed, power_usage) VALUES
(22, 21, 45, 'cool', 'med', 1.2);
```

### Default Water Tank

```sql
INSERT INTO water_tank (level, capacity, available, usage_today) VALUES
(75, 1000, 750, 125);
```

### Default Watering Schedule

```sql
INSERT INTO watering_schedule (time, duration, zones, enabled, days_of_week) VALUES
('18:00', 30, ARRAY[1, 2, 3], true, ARRAY[1, 2, 3, 4, 5, 6, 7]);
```

### Default Security System

```sql
INSERT INTO security_system (armed, mode) VALUES
(true, 'home');
```

---

## ER Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    Users    │───────│  Sessions   │       │ Biometrics  │
└─────────────┘       └─────────────┘       └─────────────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│SecuritySystem│ │ClimateSettings│ │ActivityLogs  │ │SecurityAlerts│
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
       │                    │
       │                    │
┌──────────────┐     ┌──────────────┐
│SecuritySensors│     │ClimateHistory│
└──────────────┘     └──────────────┘
       │
       ├──────────────┐
       │              │
┌──────────────┐ ┌──────────────┐
│     Doors    │ │   Cameras    │
└──────────────┘ └──────────────┘
                       │
       ├───────────────┼──────────────┐
       │               │              │
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│CameraRecordings││CameraSnapshots││ActivityLogs  │
└──────────────┘ └──────────────┘ └──────────────┘

┌──────────────┐     ┌──────────────┐
│  GardenZones │─────│WateringHistory│
└──────────────┘     └──────────────┘
       │
       │
┌──────────────┐     ┌──────────────┐
│ WaterTank    │─────│WateringSchedule│
└──────────────┘     └──────────────┘

┌──────────────┐     ┌──────────────┐
│    Rooms     │─────│    Lights     │
└──────────────┘     └──────────────┘
                            │
                            │
                     ┌──────────────┐
                     │LightingHistory│
                     └──────────────┘

┌──────────────┐
│SystemSettings│
└──────────────┘
```

---

## Backup and Maintenance

### Backup Strategy

1. **Daily Full Backups**: Full database backup at 2:00 AM
2. **Hourly Incremental Backups**: WAL archiving for point-in-time recovery
3. **Retention**: Keep daily backups for 30 days, weekly backups for 12 weeks

### Maintenance Tasks

1. **Vacuum and Analyze**: Run weekly to reclaim space and update statistics
2. **Index Rebuild**: Run monthly for heavily used indexes
3. **Log Rotation**: Archive old activity logs monthly
4. **Data Cleanup**: Remove old camera recordings and snapshots based on retention policy

---

## Security Considerations

1. **Connection Security**: Use SSL/TLS for all database connections
2. **Password Hashing**: Use bcrypt or Argon2 for PIN hashing
3. **Row-Level Security**: Implement RLS policies for multi-tenant scenarios
4. **Audit Logging**: Log all sensitive operations
5. **Regular Updates**: Keep database software updated with security patches
