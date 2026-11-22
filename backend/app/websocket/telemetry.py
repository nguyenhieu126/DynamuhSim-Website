import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


@router.websocket("/ws/telemetry")
async def telemetry_socket(websocket: WebSocket):
    origin = websocket.headers.get("origin")
    if origin and origin not in websocket.app.state.settings.cors_origins:
        await websocket.close(code=1008)
        return
    await websocket.accept()
    try:
        while True:
            snapshot = websocket.app.state.robot.snapshot()
            await websocket.send_json(snapshot.model_dump(mode="json"))
            # Receive/discard frames solely to detect disconnect; incoming data is NEVER a command.
            try:
                await asyncio.wait_for(websocket.receive_text(), timeout=.5)
            except asyncio.TimeoutError:
                continue
    except (WebSocketDisconnect, RuntimeError):
        return
