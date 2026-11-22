from typing import Protocol

from app.schemas.robot import Snapshot


class ROSBridge(Protocol):
    """Read-only boundary for a future ROS 2 adapter.

    A real adapter must supply measured timestamps, truthful capabilities and
    independent RGB/depth status. Control requires a separately reviewed
    ownership + heartbeat + watchdog protocol; this interface cannot move motors.
    """

    async def read_snapshot(self) -> Snapshot: ...


class UnavailableROSBridge:
    async def read_snapshot(self) -> Snapshot:
        raise ConnectionError("ROS 2 bridge has not been implemented or verified")
