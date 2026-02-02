# OmniHome Smart Home API Specification

## Overview
This document defines all the REST APIs required for the OmniHome smart home application. The API follows RESTful conventions and uses JSON for data exchange.

**Base URL:** `http://localhost:3000/api/v1`

**Authentication:** Bearer Token (JWT)

---

## Table of Contents
1. [Authentication](#authentication)
2. [Security System](#security-system)
3. [Climate Control](#climate-control)
4. [Garden & Utilities](#garden--utilities)
5. [Lighting Control](#lighting-control)
6. [User Management](#user-management)
7. [Activity Logs](#activity-logs)
8. [Camera System](#camera-system)

---

## Authentication

### 1. Login with PIN
Authenticate user using a 4-digit PIN code.

**Endpoint:** `POST /auth/login/pin`

**Request Body:**
```json
{
  "pin": "1234"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    },
    "expiresAt": "2026-02-03T19:30:00Z"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PIN",
    "message": "Invalid PIN code"
  }
}
```

---

### 2. Login with Biometric
Authenticate user using biometric data (FaceID/Fingerprint).

**Endpoint:** `POST /auth/login/biometric`

**Request Body:**
```json
{
  "biometricData": "base64_encoded_biometric_data",
  "biometricType": "faceid" | "fingerprint"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    },
    "expiresAt": "2026-02-03T19:30:00Z"
  }
}
```

---

### 3. Logout
Invalidate the current session token.

**Endpoint:** `POST /auth/logout`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 4. Refresh Token
Refresh an expired access token.

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "refresh_token_string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-02-03T19:30:00Z"
  }
}
```

---

## Security System

### 5. Get Security Status
Retrieve current security system status.

**Endpoint:** `GET /security/status`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "armed": true,
    "mode": "home" | "away" | "night",
    "lastArmedAt": "2026-02-02T08:15:00Z",
    "lastDisarmedAt": "2026-02-02T07:30:00Z",
    "sensors": {
      "frontDoor": {
        "locked": true,
        "lastActivity": "2026-02-02T10:00:00Z"
      },
      "backDoor": {
        "locked": true,
        "lastActivity": "2026-02-02T09:45:00Z"
      },
      "garageDoor": {
        "state": "closed" | "opening" | "open" | "obstacle",
        "lastActivity": "2026-02-02T09:45:00Z"
      },
      "motionDetectors": [
        {
          "id": "mot_001",
          "name": "Driveway",
          "status": "active",
          "lastTriggered": "2026-02-02T09:30:00Z"
        }
      ]
    }
  }
}
```

---

### 6. Arm/Disarm Security System
Toggle security system armed state.

**Endpoint:** `POST /security/arm`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "armed": true,
  "mode": "home" | "away" | "night"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "armed": true,
    "mode": "home",
    "armedAt": "2026-02-02T19:30:00Z"
  }
}
```

---

### 7. Trigger Panic Alert
Trigger emergency panic alert.

**Endpoint:** `POST /security/panic`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "location": "home",
  "type": "emergency" | "medical" | "fire"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "alertId": "alt_1234567890",
    "triggeredAt": "2026-02-02T19:30:00Z",
    "status": "active",
    "contactsNotified": ["emergency_services", "family"]
  }
}
```

---

### 8. Control Garage Door
Open or close the garage door.

**Endpoint:** `POST /security/garage/control`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "action": "open" | "close"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "state": "opening",
    "estimatedCompletion": "2026-02-02T19:32:00Z"
  }
}
```

---

### 9. Get Garage Door Status
Get current garage door status.

**Endpoint:** `GET /security/garage/status`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "state": "closed" | "opening" | "open" | "obstacle",
    "lastAction": "close",
    "lastActionAt": "2026-02-02T09:45:00Z",
    "obstacleDetected": false
  }
}
```

---

### 10. Control Door Lock
Lock or unlock a specific door.

**Endpoint:** `POST /security/doors/{doorId}/control`

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `doorId`: ID of the door (e.g., "front", "back")

**Request Body:**
```json
{
  "action": "lock" | "unlock"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "doorId": "front",
    "locked": true,
    "lockedAt": "2026-02-02T19:30:00Z"
  }
}
```

---

## Climate Control

### 11. Get Climate Status
Retrieve current climate control status.

**Endpoint:** `GET /climate/status`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "currentTemperature": 21,
    "targetTemperature": 22,
    "humidity": 45,
    "mode": "cool" | "heat" | "eco",
    "fanSpeed": "low" | "med" | "high",
    "powerUsage": 1.2,
    "active": true,
    "lastUpdated": "2026-02-02T19:25:00Z"
  }
}
```

---

### 12. Set Temperature
Set target temperature.

**Endpoint:** `POST /climate/temperature`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "temperature": 22
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "targetTemperature": 22,
    "previousTemperature": 21,
    "updatedAt": "2026-02-02T19:30:00Z"
  }
}
```

---

### 13. Set Fan Speed
Set HVAC fan speed.

**Endpoint:** `POST /climate/fan-speed`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "fanSpeed": "low" | "med" | "high"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "fanSpeed": "med",
    "updatedAt": "2026-02-02T19:30:00Z"
  }
}
```

---

### 14. Set Climate Mode
Set climate control mode.

**Endpoint:** `POST /climate/mode`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "mode": "cool" | "heat" | "eco"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "mode": "cool",
    "previousMode": "heat",
    "updatedAt": "2026-02-02T19:30:00Z"
  }
}
```

---

### 15. Apply Climate Settings
Apply multiple climate settings at once.

**Endpoint:** `POST /climate/apply`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "temperature": 22,
  "fanSpeed": "med",
  "mode": "cool"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "temperature": 22,
    "fanSpeed": "med",
    "mode": "cool",
    "appliedAt": "2026-02-02T19:30:00Z"
  }
}
```

---

## Garden & Utilities

### 16. Get Garden Status
Retrieve current garden and irrigation status.

**Endpoint:** `GET /garden/status`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "zones": [
      {
        "id": 1,
        "name": "Front Yard",
        "active": false,
        "soilMoisture": 65,
        "lastWateredAt": "2026-02-02T06:00:00Z"
      },
      {
        "id": 2,
        "name": "Back Yard",
        "active": false,
        "soilMoisture": 70,
        "lastWateredAt": "2026-02-02T06:00:00Z"
      },
      {
        "id": 3,
        "name": "Side Garden",
        "active": false,
        "soilMoisture": 60,
        "lastWateredAt": "2026-02-02T06:00:00Z"
      }
    ],
    "waterTank": {
      "level": 75,
      "capacity": 1000,
      "available": 750,
      "usageToday": 125
    },
    "nextWatering": {
      "time": "18:00",
      "date": "2026-02-02",
      "duration": 30
    },
    "weather": {
      "temperature": 28,
      "condition": "sunny",
      "humidity": 45
    }
  }
}
```

---

### 17. Toggle Irrigation Zone
Activate or deactivate a specific irrigation zone.

**Endpoint:** `POST /garden/zones/{zoneId}/toggle`

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `zoneId`: Zone ID (1, 2, or 3)

**Request Body:**
```json
{
  "active": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "zoneId": 1,
    "active": true,
    "activatedAt": "2026-02-02T19:30:00Z"
  }
}
```

---

### 18. Set All Zones
Activate or deactivate all irrigation zones.

**Endpoint:** `POST /garden/zones/all`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "active": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "activeZones": [1, 2, 3],
    "updatedAt": "2026-02-02T19:30:00Z"
  }
}
```

---

### 19. Set Watering Schedule
Set the watering schedule.

**Endpoint:** `POST /garden/schedule`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "time": "18:00",
  "duration": 30,
  "zones": [1, 2, 3]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "scheduledTime": "18:00",
    "duration": 30,
    "zones": [1, 2, 3],
    "nextWatering": "2026-02-02T18:00:00Z",
    "updatedAt": "2026-02-02T19:30:00Z"
  }
}
```

---

### 20. Get Water Tank Status
Get current water tank level and status.

**Endpoint:** `GET /garden/water-tank`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "level": 75,
    "capacity": 1000,
    "available": 750,
    "usageToday": 125,
    "lastRefilledAt": "2026-02-01T10:00:00Z",
    "lowLevelAlert": false
  }
}
```

---

### 21. Refill Water Tank
Start water tank refill process.

**Endpoint:** `POST /garden/water-tank/refill`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "refillStarted": true,
    "estimatedCompletion": "2026-02-02T20:00:00Z",
    "startedAt": "2026-02-02T19:30:00Z"
  }
}
```

---

## Lighting Control

### 22. Get Lighting Status
Retrieve current lighting status.

**Endpoint:** `GET /lighting/status`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "masterOn": true,
    "activeLights": 12,
    "totalLights": 12,
    "powerUsage": 240,
    "rooms": [
      {
        "id": "room_001",
        "name": "Living Room",
        "lights": [
          {
            "id": "light_001",
            "name": "Main Light",
            "on": true,
            "brightness": 80,
            "color": "#FFFFFF"
          },
          {
            "id": "light_002",
            "name": "Ambient Light",
            "on": true,
            "brightness": 50,
            "color": "#FFD700"
          }
        ]
      },
      {
        "id": "room_002",
        "name": "Bedroom",
        "lights": [
          {
            "id": "light_003",
            "name": "Ceiling Light",
            "on": true,
            "brightness": 70,
            "color": "#FFFFFF"
          }
        ]
      }
    ]
  }
}
```

---

### 23. Toggle Master Light
Turn all lights on or off.

**Endpoint:** `POST /lighting/master`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "on": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "masterOn": true,
    "activeLights": 12,
    "powerUsage": 240,
    "updatedAt": "2026-02-02T19:30:00Z"
  }
}
```

---

### 24. Control Individual Light
Control a specific light.

**Endpoint:** `POST /lighting/lights/{lightId}/control`

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `lightId`: ID of the light

**Request Body:**
```json
{
  "on": true,
  "brightness": 80,
  "color": "#FFFFFF"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "lightId": "light_001",
    "on": true,
    "brightness": 80,
    "color": "#FFFFFF",
    "updatedAt": "2026-02-02T19:30:00Z"
  }
}
```

---

## User Management

### 25. Get User Profile
Get current user profile.

**Endpoint:** `GET /users/profile`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "usr_1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "createdAt": "2026-01-01T00:00:00Z",
    "preferences": {
      "theme": "dark",
      "notifications": true,
      "biometricEnabled": true
    }
  }
}
```

---

### 26. Update User Profile
Update user profile information.

**Endpoint:** `PUT /users/profile`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "preferences": {
    "theme": "dark",
    "notifications": true,
    "biometricEnabled": true
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "usr_1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "updatedAt": "2026-02-02T19:30:00Z"
  }
}
```

---

### 27. Change PIN
Change user PIN code.

**Endpoint:** `POST /users/change-pin`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "currentPin": "1234",
  "newPin": "5678"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "PIN changed successfully"
}
```

---

### 28. Register Biometric
Register biometric data for authentication.

**Endpoint:** `POST /users/biometric/register`

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "biometricData": "base64_encoded_biometric_data",
  "biometricType": "faceid" | "fingerprint"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "biometricId": "bio_1234567890",
    "biometricType": "faceid",
    "registeredAt": "2026-02-02T19:30:00Z"
  }
}
```

---

## Activity Logs

### 29. Get Activity Logs
Retrieve system activity logs.

**Endpoint:** `GET /activity/logs`

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `limit`: Number of entries to return (default: 50)
- `offset`: Pagination offset (default: 0)
- `type`: Filter by type (info, warning, success, error)
- `startDate`: Filter by start date (ISO 8601)
- `endDate`: Filter by end date (ISO 8601)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_001",
        "timestamp": "2026-02-02T10:00:00Z",
        "event": "Front Door Opened",
        "type": "info",
        "category": "security",
        "details": {
          "doorId": "front",
          "userId": "usr_1234567890"
        }
      },
      {
        "id": "log_002",
        "timestamp": "2026-02-02T09:45:00Z",
        "event": "Garage Door Closed",
        "type": "info",
        "category": "security",
        "details": {
          "doorId": "garage"
        }
      },
      {
        "id": "log_003",
        "timestamp": "2026-02-02T09:30:00Z",
        "event": "Motion Detected - Driveway",
        "type": "warning",
        "category": "security",
        "details": {
          "sensorId": "mot_001",
          "location": "Driveway"
        }
      },
      {
        "id": "log_004",
        "timestamp": "2026-02-02T08:15:00Z",
        "event": "System Armed",
        "type": "success",
        "category": "security",
        "details": {
          "mode": "away",
          "userId": "usr_1234567890"
        }
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

### 30. Get Activity Log by ID
Get a specific activity log entry.

**Endpoint:** `GET /activity/logs/{logId}`

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `logId`: ID of the log entry

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "log_001",
    "timestamp": "2026-02-02T10:00:00Z",
    "event": "Front Door Opened",
    "type": "info",
    "category": "security",
    "details": {
      "doorId": "front",
      "userId": "usr_1234567890"
    }
  }
}
```

---

## Camera System

### 31. Get Camera List
Get list of all available cameras.

**Endpoint:** `GET /cameras`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cameras": [
      {
        "id": "cam_001",
        "name": "Driveway Camera",
        "location": "Driveway",
        "status": "online",
        "resolution": "1080p",
        "isRecording": false
      },
      {
        "id": "cam_002",
        "name": "Front Door Camera",
        "location": "Front Door",
        "status": "online",
        "resolution": "1080p",
        "isRecording": false
      }
    ]
  }
}
```

---

### 32. Get Camera Stream URL
Get the streaming URL for a specific camera.

**Endpoint:** `GET /cameras/{cameraId}/stream`

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `cameraId`: ID of the camera

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "cameraId": "cam_001",
    "streamUrl": "rtsp://localhost:8554/cam_001",
    "hlsUrl": "http://localhost:8080/hls/cam_001.m3u8",
    "thumbnailUrl": "http://localhost:8080/thumbnails/cam_001.jpg"
  }
}
```

---

### 33. Take Camera Snapshot
Take a snapshot from a camera.

**Endpoint:** `POST /cameras/{cameraId}/snapshot`

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `cameraId`: ID of the camera

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "snapshotId": "snap_1234567890",
    "cameraId": "cam_001",
    "imageUrl": "http://localhost:8080/snapshots/snap_1234567890.jpg",
    "capturedAt": "2026-02-02T19:30:00Z"
  }
}
```

---

### 34. Start Camera Recording
Start recording from a camera.

**Endpoint:** `POST /cameras/{cameraId}/record/start`

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `cameraId`: ID of the camera

**Request Body:**
```json
{
  "duration": 60
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "recordingId": "rec_1234567890",
    "cameraId": "cam_001",
    "startedAt": "2026-02-02T19:30:00Z",
    "estimatedEnd": "2026-02-02T19:31:00Z"
  }
}
```

---

### 35. Stop Camera Recording
Stop recording from a camera.

**Endpoint:** `POST /cameras/{cameraId}/record/stop`

**Headers:** `Authorization: Bearer {token}`

**Path Parameters:**
- `cameraId`: ID of the camera

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "recordingId": "rec_1234567890",
    "cameraId": "cam_001",
    "stoppedAt": "2026-02-02T19:30:30Z",
    "duration": 30,
    "videoUrl": "http://localhost:8080/recordings/rec_1234567890.mp4"
  }
}
```

---

## Dashboard

### 36. Get Dashboard Data
Get aggregated data for the main dashboard.

**Endpoint:** `GET /dashboard`

**Headers:** `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "security": {
      "armed": true,
      "status": "Armed"
    },
    "climate": {
      "temperature": 22,
      "mode": "cool"
    },
    "garden": {
      "nextWatering": "18:00",
      "soilMoisture": 65
    },
    "lighting": {
      "masterOn": true,
      "activeLights": 12,
      "powerUsage": 240
    },
    "recentActivity": [
      {
        "time": "10:00 AM",
        "event": "Front Door Opened",
        "type": "info"
      },
      {
        "time": "09:45 AM",
        "event": "Garage Door Closed",
        "type": "info"
      }
    ]
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_PIN` | Invalid PIN code provided |
| `INVALID_BIOMETRIC` | Biometric authentication failed |
| `UNAUTHORIZED` | Invalid or expired token |
| `FORBIDDEN` | User does not have permission |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Request validation failed |
| `DEVICE_OFFLINE` | Device is offline or unreachable |
| `DEVICE_BUSY` | Device is busy with another operation |
| `INSUFFICIENT_RESOURCES` | Insufficient resources (e.g., water tank low) |

---

## WebSocket Events

For real-time updates, the API supports WebSocket connections.

**WebSocket URL:** `ws://localhost:3000/ws`

**Authentication:** Send token in query string: `ws://localhost:3000/ws?token={token}`

### Events

#### Server → Client

| Event | Description |
|-------|-------------|
| `security.status.changed` | Security status changed |
| `security.alarm.triggered` | Security alarm triggered |
| `climate.status.changed` | Climate status changed |
| `garden.zone.changed` | Irrigation zone status changed |
| `lighting.status.changed` | Lighting status changed |
| `activity.log.new` | New activity log entry |
| `camera.motion.detected` | Motion detected on camera |

#### Client → Server

| Event | Description |
|-------|-------------|
| `subscribe` | Subscribe to specific events |
| `unsubscribe` | Unsubscribe from events |

**Subscribe Example:**
```json
{
  "event": "subscribe",
  "channels": ["security.status.changed", "climate.status.changed"]
}
```
