from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.core.config import Settings
from app.services.robot import RobotService
from app.services.settings_store import SettingsStore
from app.websocket.telemetry import router as ws_router


def create_app(settings: Settings | None = None) -> FastAPI:
    config = settings or Settings()
    app = FastAPI(title="PBL6 Robot Console API", version="1.0.0", description="Safe demo/status foundation. No physical movement or STOP endpoint is implemented.")
    app.state.settings = config
    app.state.robot = RobotService(config)
    app.state.store = SettingsStore(config.settings_file)
    app.add_middleware(CORSMiddleware, allow_origins=config.cors_origins,
                       allow_methods=["GET", "PUT"], allow_headers=["Content-Type"], allow_credentials=False)
    app.include_router(api_router)
    app.include_router(ws_router)
    return app


app = create_app()
