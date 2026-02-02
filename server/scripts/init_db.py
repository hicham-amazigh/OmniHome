"""
Database Initialization Script
Creates the database tables and inserts initial data
"""

import asyncio
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.security import get_password_hash
from app.models import (
    User, Session, Biometric, SecuritySystem, SecuritySensor, Door,
    SecurityAlert, ClimateSettings, ClimateHistory, GardenZone, WaterTank,
    WateringSchedule, WateringHistory, Room, Light, LightingHistory,
    Camera, CameraRecording, CameraSnapshot, ActivityLog, SystemSetting
)


async def init_database():
    """Initialize the database with tables and initial data."""
    
    # Create async engine
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(lambda sync_conn: Base.metadata.create_all(sync_conn))
    
    print("Database tables created successfully!")
    
    # Create session
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check if data already exists
        result = await session.execute(select(User).limit(1))
        if result.scalar_one_or_none():
            print("Database already initialized. Skipping initial data insertion.")
            return
        
        print("Inserting initial data...")
        
        # Create default user
        default_user = User(
            id=str(uuid.uuid4()),
            name="Admin User",
            email="admin@omnihome.com",
            pin_hash=get_password_hash(settings.DEFAULT_PIN),
            role="admin",
            is_active=True
        )
        session.add(default_user)
        await session.flush()
        
        # Create default rooms
        rooms = [
            Room(id=str(uuid.uuid4()), name="Living Room"),
            Room(id=str(uuid.uuid4()), name="Bedroom"),
            Room(id=str(uuid.uuid4()), name="Kitchen"),
            Room(id=str(uuid.uuid4()), name="Bathroom"),
            Room(id=str(uuid.uuid4()), name="Garage"),
        ]
        session.add_all(rooms)
        await session.flush()
        
        # Create default lights
        lights = [
            Light(id=str(uuid.uuid4()), light_id="light_001", name="Main Light", room_id=rooms[0].id, on=True, brightness=80, color="#FFFFFF", power_usage=20),
            Light(id=str(uuid.uuid4()), light_id="light_002", name="Ambient Light", room_id=rooms[0].id, on=True, brightness=50, color="#FFD700", power_usage=10),
            Light(id=str(uuid.uuid4()), light_id="light_003", name="Ceiling Light", room_id=rooms[1].id, on=True, brightness=70, color="#FFFFFF", power_usage=15),
            Light(id=str(uuid.uuid4()), light_id="light_004", name="Kitchen Light", room_id=rooms[2].id, on=True, brightness=90, color="#FFFFFF", power_usage=25),
            Light(id=str(uuid.uuid4()), light_id="light_005", name="Bathroom Light", room_id=rooms[3].id, on=True, brightness=80, color="#FFFFFF", power_usage=15),
            Light(id=str(uuid.uuid4()), light_id="light_006", name="Garage Light", room_id=rooms[4].id, on=True, brightness=100, color="#FFFFFF", power_usage=30),
        ]
        session.add_all(lights)
        
        # Create default garden zones
        garden_zones = [
            GardenZone(id=str(uuid.uuid4()), zone_id=1, name="Front Yard", soil_moisture=65),
            GardenZone(id=str(uuid.uuid4()), zone_id=2, name="Back Yard", soil_moisture=70),
            GardenZone(id=str(uuid.uuid4()), zone_id=3, name="Side Garden", soil_moisture=60),
        ]
        session.add_all(garden_zones)
        
        # Create default security sensors
        security_sensors = [
            SecuritySensor(id=str(uuid.uuid4()), name="Driveway Motion", sensor_type="motion", location="Driveway", status="active"),
            SecuritySensor(id=str(uuid.uuid4()), name="Front Door", sensor_type="door", location="Front Door", status="active"),
            SecuritySensor(id=str(uuid.uuid4()), name="Back Door", sensor_type="door", location="Back Door", status="active"),
            SecuritySensor(id=str(uuid.uuid4()), name="Garage Door", sensor_type="garage", location="Garage", status="active"),
        ]
        session.add_all(security_sensors)
        
        # Create default doors
        doors = [
            Door(id=str(uuid.uuid4()), name="Front Door", door_id="front", locked=True),
            Door(id=str(uuid.uuid4()), name="Back Door", door_id="back", locked=True),
            Door(id=str(uuid.uuid4()), name="Garage Door", door_id="garage", locked=True),
        ]
        session.add_all(doors)
        
        # Create default cameras
        cameras = [
            Camera(id=str(uuid.uuid4()), camera_id="cam_001", name="Driveway Camera", location="Driveway", status="online", resolution="1080p"),
            Camera(id=str(uuid.uuid4()), camera_id="cam_002", name="Front Door Camera", location="Front Door", status="online", resolution="1080p"),
        ]
        session.add_all(cameras)
        
        # Create default climate settings
        climate_settings = ClimateSettings(
            id=str(uuid.uuid4()),
            target_temperature=22,
            current_temperature=21,
            humidity=45,
            mode="cool",
            fan_speed="med",
            power_usage=1.2,
            active=True
        )
        session.add(climate_settings)
        
        # Create default water tank
        water_tank = WaterTank(
            id=str(uuid.uuid4()),
            level=75,
            capacity=1000,
            available=750,
            usage_today=125
        )
        session.add(water_tank)
        
        # Create default watering schedule
        watering_schedule = WateringSchedule(
            id=str(uuid.uuid4()),
            time="18:00",
            duration=30,
            zones=[1, 2, 3],
            enabled=True,
            days_of_week=[1, 2, 3, 4, 5, 6, 7]
        )
        session.add(watering_schedule)
        
        # Create default security system
        security_system = SecuritySystem(
            id=str(uuid.uuid4()),
            armed=True,
            mode="home"
        )
        session.add(security_system)
        
        # Create default system settings
        system_settings = [
            SystemSetting(id=str(uuid.uuid4()), key="security.auto_arm_delay", value="30", value_type="number", description="Auto-arm delay in minutes after leaving"),
            SystemSetting(id=str(uuid.uuid4()), key="security.panic_contacts", value='["emergency_services", "family"]', value_type="json", description="Contacts to notify on panic alert"),
            SystemSetting(id=str(uuid.uuid4()), key="climate.eco_temperature", value="24", value_type="number", description="Default eco mode temperature"),
            SystemSetting(id=str(uuid.uuid4()), key="garden.default_watering_duration", value="30", value_type="number", description="Default watering duration in minutes"),
            SystemSetting(id=str(uuid.uuid4()), key="garden.low_water_threshold", value="20", value_type="number", description="Low water tank alert threshold percentage"),
            SystemSetting(id=str(uuid.uuid4()), key="lighting.auto_off_delay", value="60", value_type="number", description="Auto-off delay in minutes when no motion"),
            SystemSetting(id=str(uuid.uuid4()), key="camera.motion_detection_enabled", value="true", value_type="boolean", description="Enable motion detection on cameras"),
            SystemSetting(id=str(uuid.uuid4()), key="camera.recording_retention_days", value="30", value_type="number", description="Number of days to retain recordings"),
        ]
        session.add_all(system_settings)
        
        # Create default activity logs
        activity_logs = [
            ActivityLog(id=str(uuid.uuid4()), timestamp=datetime.now(), event="Front Door Opened", log_type="info", category="security", details={"doorId": "front", "userId": default_user.id}),
            ActivityLog(id=str(uuid.uuid4()), timestamp=datetime.now(), event="Garage Door Closed", log_type="info", category="security", details={"doorId": "garage"}),
            ActivityLog(id=str(uuid.uuid4()), timestamp=datetime.now(), event="Motion Detected - Driveway", log_type="warning", category="security", details={"sensorId": security_sensors[0].id, "location": "Driveway"}),
            ActivityLog(id=str(uuid.uuid4()), timestamp=datetime.now(), event="System Armed", log_type="success", category="security", details={"mode": "home", "userId": default_user.id}),
        ]
        session.add_all(activity_logs)
        
        await session.commit()
        print("Initial data inserted successfully!")
    
    await engine.dispose()
    print("Database initialization complete!")


if __name__ == "__main__":
    from sqlalchemy import select
    from app.core.database import Base
    
    asyncio.run(init_database())
