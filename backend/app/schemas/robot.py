from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class Model(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)


class Velocity(Model):
    vx: float
    vy: float
    wz: float


class Pose(Model):
    x: float
    y: float
    yaw: float


class Wheel(Model):
    wheel: Literal["FL", "FR", "RL", "RR"]
    rpm: float
    velocity: float


class IMU(Model):
    acceleration: tuple[float, float, float]
    angular: tuple[float, float, float]
    orientation: tuple[float, float, float]


class Lidar(Model):
    ranges: list[float] = Field(max_length=20000)
    rate: float
    min: float
    max: float
    nearest: float


class Camera(Model):
    rgb: bool = False
    depth: bool = False
    fps: float | None = None
    rgbUrl: str | None = None
    depthUrl: str | None = None


class TrackedObject(Model):
    id: int
    label: str
    confidence: float = Field(ge=0, le=1)
    distance: float = Field(ge=0)
    velocity: float
    risk: Literal["High", "Medium", "Low"]
    box: tuple[float, float, float, float]
    position: tuple[float, float] | None = None
    predicted: list[tuple[float, float]]


class Navigation(Model):
    mapping: bool = False
    localized: bool = False
    nav2: bool = False
    status: str = "Unavailable"
    goal: Pose | None = None


class RobotStatus(Model):
    state: Literal["DEMO", "OFFLINE", "CONNECTING", "STOPPED", "MANUAL", "AUTONOMOUS", "FAULT"]
    robot: str
    hardwareConnected: bool = False
    rosConnected: bool = False
    ownership: Literal["manual", "autonomous"] | None = None
    battery: float | None = None
    voltage: float | None = None
    temperature: float | None = None
    moving: bool | None = None
    controlVerified: bool = False


class Telemetry(Model):
    velocity: Velocity
    commanded: Velocity
    pose: Pose
    wheels: list[Wheel]
    imu: IMU
    lidar: Lidar
    camera: Camera = Field(default_factory=Camera)
    tracks: list[TrackedObject] = Field(default_factory=list)
    navigation: Navigation = Field(default_factory=Navigation)


class RobotEvent(Model):
    id: str
    time: str
    level: Literal["info", "warning", "critical"]
    title: str
    detail: str


class Snapshot(Model):
    source: Literal["demo", "live", "unavailable"]
    timestamp: str
    status: RobotStatus
    telemetry: Telemetry | None = None
    events: list[RobotEvent] = Field(default_factory=list)
