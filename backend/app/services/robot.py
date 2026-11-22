import math
from datetime import datetime, timezone

from app.core.config import Settings
from app.schemas.robot import (
    Camera, IMU, Lidar, Navigation, Pose, RobotEvent, RobotStatus,
    Snapshot, Telemetry, Velocity, Wheel,
)


class RobotService:
    """Safe status provider. No device drivers, ROS publisher or movement methods."""

    def __init__(self, settings: Settings):
        self.settings = settings

    def snapshot(self) -> Snapshot:
        now = datetime.now(timezone.utc)
        is_demo = self.settings.data_mode == "demo"
        status = RobotStatus(
            state="DEMO" if is_demo else "OFFLINE", robot=self.settings.robot_name,
            battery=78 if is_demo else None, voltage=24.1 if is_demo else None,
            temperature=52 if is_demo else None, moving=False if is_demo else None,
        )
        telemetry = None
        if is_demo:
            phase = math.sin(now.timestamp() / 2)
            telemetry = Telemetry(
                velocity=Velocity(vx=0, vy=0, wz=0), commanded=Velocity(vx=0, vy=0, wz=0),
                pose=Pose(x=2.416, y=1.983, yaw=27.6),
                wheels=[Wheel(wheel=w, rpm=0, velocity=0) for w in ("FL", "FR", "RL", "RR")],
                imu=IMU(acceleration=(.06*phase, .1*phase, 9.81), angular=(0, 0, .01*phase), orientation=(.5, -1.2, 27.6)),
                lidar=Lidar(ranges=[3.4+.65*math.sin(i*.13) for i in range(180)], rate=10, min=.15, max=12, nearest=.68),
                camera=Camera(), navigation=Navigation(status="Demo only; ROS 2/Nav2 unavailable"),
            )
        return Snapshot(
            source="demo" if is_demo else "unavailable", timestamp=now.isoformat(),
            status=status, telemetry=telemetry,
            events=[RobotEvent(id="adapter-status", time=now.strftime("%H:%M:%S"), level="info",
                              title="Demo backend" if is_demo else "Hardware unavailable",
                              detail="No Jetson, ESP32, ROS 2, Nav2, AI or hardware drivers are connected.")],
        )
