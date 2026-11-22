from fastapi import APIRouter, HTTPException, Request

from app.schemas.robot import RobotStatus, Snapshot
from app.schemas.settings import DemoSettings

router = APIRouter(prefix="/api")


@router.get("/health")
def health(request: Request):
    return {"status": "ok", "mode": request.app.state.settings.data_mode,
            "hardware_connected": False, "ros_connected": False, "physical_control_enabled": False}


@router.get("/robot/status", response_model=RobotStatus)
def status(request: Request):
    return request.app.state.robot.snapshot().status


@router.get("/robot/telemetry", response_model=Snapshot)
def telemetry(request: Request):
    return request.app.state.robot.snapshot()


@router.get("/settings", response_model=DemoSettings)
def get_settings(request: Request):
    try:
        return request.app.state.store.read()
    except (ValueError, OSError) as error:
        raise HTTPException(503, "Stored demo settings are invalid or unreadable; file preserved") from error


@router.put("/settings")
def save_settings(settings: DemoSettings, request: Request):
    if request.app.state.settings.data_mode != "demo":
        raise HTTPException(423, "Live settings locked: no verified hardware settings adapter")
    if request.app.state.robot.snapshot().status.moving is not False:
        raise HTTPException(423, "Settings locked while motion state is moving or unknown")
    try:
        request.app.state.store.save(settings)
    except OSError as error:
        raise HTTPException(503, "Unable to persist demo settings") from error
    return {"saved": True, "scope": "demo_only", "hardware_changed": False}
