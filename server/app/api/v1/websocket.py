"""
WebSocket Routes for Real-time Updates
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from typing import Set, Dict, Any
import json
import logging

from app.core.security import decode_token

logger = logging.getLogger(__name__)

router = APIRouter()


class ConnectionManager:
    """Manages WebSocket connections and subscriptions."""
    
    def __init__(self):
        # Store active connections: {connection_id: {"websocket": websocket, "user_id": user_id, "subscriptions": set}}
        self.active_connections: Dict[str, Dict[str, Any]] = {}
        # Store subscriptions by channel: {channel: set(connection_ids)}
        self.channel_subscriptions: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, connection_id: str, user_id: str) -> None:
        """Accept a new WebSocket connection."""
        await websocket.accept()
        self.active_connections[connection_id] = {
            "websocket": websocket,
            "user_id": user_id,
            "subscriptions": set()
        }
        logger.info(f"WebSocket connection established: {connection_id} for user {user_id}")
    
    def disconnect(self, connection_id: str) -> None:
        """Remove a WebSocket connection."""
        if connection_id in self.active_connections:
            # Remove from all channel subscriptions
            subscriptions = self.active_connections[connection_id]["subscriptions"]
            for channel in subscriptions:
                if channel in self.channel_subscriptions:
                    self.channel_subscriptions[channel].discard(connection_id)
            
            del self.active_connections[connection_id]
            logger.info(f"WebSocket connection closed: {connection_id}")
    
    def subscribe(self, connection_id: str, channels: list) -> None:
        """Subscribe a connection to specific channels."""
        if connection_id not in self.active_connections:
            return
        
        for channel in channels:
            # Add to channel subscriptions
            if channel not in self.channel_subscriptions:
                self.channel_subscriptions[channel] = set()
            self.channel_subscriptions[channel].add(connection_id)
            
            # Add to connection's subscriptions
            self.active_connections[connection_id]["subscriptions"].add(channel)
        
        logger.info(f"Connection {connection_id} subscribed to channels: {channels}")
    
    def unsubscribe(self, connection_id: str, channels: list) -> None:
        """Unsubscribe a connection from specific channels."""
        if connection_id not in self.active_connections:
            return
        
        for channel in channels:
            # Remove from channel subscriptions
            if channel in self.channel_subscriptions:
                self.channel_subscriptions[channel].discard(connection_id)
            
            # Remove from connection's subscriptions
            self.active_connections[connection_id]["subscriptions"].discard(channel)
        
        logger.info(f"Connection {connection_id} unsubscribed from channels: {channels}")
    
    async def broadcast(self, channel: str, message: Dict[str, Any]) -> None:
        """Broadcast a message to all connections subscribed to a channel."""
        if channel not in self.channel_subscriptions:
            return
        
        disconnected_connections = []
        
        for connection_id in self.channel_subscriptions[channel]:
            if connection_id in self.active_connections:
                try:
                    websocket = self.active_connections[connection_id]["websocket"]
                    await websocket.send_json(message)
                except Exception as e:
                    logger.error(f"Error sending message to {connection_id}: {e}")
                    disconnected_connections.append(connection_id)
        
        # Clean up disconnected connections
        for connection_id in disconnected_connections:
            self.disconnect(connection_id)


# Global connection manager instance
manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT authentication token")
):
    """
    WebSocket endpoint for real-time updates.
    
    Authentication: Send token in query string: ws://localhost:3000/ws?token={token}
    
    Supported Events:
    
    Server → Client:
    - security.status.changed: Security status changed
    - security.alarm.triggered: Security alarm triggered
    - climate.status.changed: Climate status changed
    - garden.zone.changed: Irrigation zone status changed
    - lighting.status.changed: Lighting status changed
    - activity.log.new: New activity log entry
    - camera.motion.detected: Motion detected on camera
    
    Client → Server:
    - subscribe: Subscribe to specific events
    - unsubscribe: Unsubscribe from events
    
    Subscribe Example:
    {
      "event": "subscribe",
      "channels": ["security.status.changed", "climate.status.changed"]
    }
    """
    # Verify token
    try:
        payload = decode_token(token)
        if not payload:
            await websocket.close(code=4001, reason="Invalid token")
            return
        user_id = payload.get("sub")
        if not user_id:
            await websocket.close(code=4001, reason="Invalid token: missing user ID")
            return
    except Exception as e:
        logger.error(f"WebSocket authentication failed: {e}")
        await websocket.close(code=4001, reason="Invalid token")
        return
    
    # Generate connection ID
    connection_id = f"{user_id}_{id(websocket)}"
    
    # Accept connection
    await manager.connect(websocket, connection_id, user_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            event = message.get("event")
            channels = message.get("channels", [])
            
            if event == "subscribe":
                # Subscribe to channels
                manager.subscribe(connection_id, channels)
                await websocket.send_json({
                    "event": "subscribed",
                    "channels": channels,
                    "status": "success"
                })
            
            elif event == "unsubscribe":
                # Unsubscribe from channels
                manager.unsubscribe(connection_id, channels)
                await websocket.send_json({
                    "event": "unsubscribed",
                    "channels": channels,
                    "status": "success"
                })
            
            else:
                # Unknown event
                await websocket.send_json({
                    "event": "error",
                    "message": f"Unknown event: {event}",
                    "status": "error"
                })
    
    except WebSocketDisconnect:
        manager.disconnect(connection_id)
    except Exception as e:
        logger.error(f"WebSocket error for {connection_id}: {e}")
        manager.disconnect(connection_id)


# Helper functions for broadcasting events (can be called from other modules)

async def broadcast_security_status_changed(data: Dict[str, Any]) -> None:
    """Broadcast security status change event."""
    await manager.broadcast("security.status.changed", {
        "event": "security.status.changed",
        "data": data
    })


async def broadcast_security_alarm_triggered(data: Dict[str, Any]) -> None:
    """Broadcast security alarm triggered event."""
    await manager.broadcast("security.alarm.triggered", {
        "event": "security.alarm.triggered",
        "data": data
    })


async def broadcast_climate_status_changed(data: Dict[str, Any]) -> None:
    """Broadcast climate status change event."""
    await manager.broadcast("climate.status.changed", {
        "event": "climate.status.changed",
        "data": data
    })


async def broadcast_garden_zone_changed(data: Dict[str, Any]) -> None:
    """Broadcast garden zone status change event."""
    await manager.broadcast("garden.zone.changed", {
        "event": "garden.zone.changed",
        "data": data
    })


async def broadcast_lighting_status_changed(data: Dict[str, Any]) -> None:
    """Broadcast lighting status change event."""
    await manager.broadcast("lighting.status.changed", {
        "event": "lighting.status.changed",
        "data": data
    })


async def broadcast_activity_log_new(data: Dict[str, Any]) -> None:
    """Broadcast new activity log event."""
    await manager.broadcast("activity.log.new", {
        "event": "activity.log.new",
        "data": data
    })


async def broadcast_camera_motion_detected(data: Dict[str, Any]) -> None:
    """Broadcast camera motion detected event."""
    await manager.broadcast("camera.motion.detected", {
        "event": "camera.motion.detected",
        "data": data
    })
