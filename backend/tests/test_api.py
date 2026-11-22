import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app
from app.schemas.robot import Snapshot


@pytest.fixture
def client(tmp_path):
    return TestClient(create_app(Settings(data_mode="demo", settings_file=tmp_path / "settings.json")))


def test_health_is_not_hardware_success(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "mode": "demo", "hardware_connected": False,
                               "ros_connected": False, "physical_control_enabled": False}


def test_demo_telemetry_labels_and_capabilities(client):
    snap = Snapshot.model_validate(client.get("/api/robot/telemetry").json())
    assert snap.source == "demo" and snap.status.state == "DEMO"
    assert not snap.status.hardwareConnected and not snap.status.rosConnected
    assert not snap.status.controlVerified and snap.status.ownership is None
    assert snap.telemetry and not snap.telemetry.camera.rgb and not snap.telemetry.camera.depth
    assert not snap.telemetry.navigation.nav2
    assert snap.telemetry.velocity.vx == 0


def test_live_does_not_fabricate_values(tmp_path):
    live = TestClient(create_app(Settings(data_mode="live", settings_file=tmp_path / "live.json")))
    snap = Snapshot.model_validate(live.get("/api/robot/telemetry").json())
    assert snap.source == "unavailable" and snap.telemetry is None
    assert snap.status.state == "OFFLINE" and snap.status.moving is None
    assert snap.status.battery is None and snap.status.temperature is None
    assert live.put("/api/settings", json={}).status_code == 423


@pytest.mark.parametrize("path", ["/api/robot/move", "/api/robot/stop", "/api/cmd_vel", "/api/navigation/goal"])
def test_no_unverified_physical_control_endpoints(client, path):
    assert client.post(path, json={"vx": 1}).status_code == 404


def test_websocket_is_status_only(client):
    with client.websocket_connect("/ws/telemetry", headers={"origin": "http://localhost:8080"}) as ws:
        assert ws.receive_json()["source"] == "demo"
        ws.send_text('{"command":"move", "vx":1}')
        frame = ws.receive_json()
        assert frame["telemetry"]["commanded"]["vx"] == 0
        assert frame["status"]["hardwareConnected"] is False


def test_websocket_rejects_unknown_origin(client):
    from starlette.websockets import WebSocketDisconnect
    with pytest.raises(WebSocketDisconnect):
        with client.websocket_connect("/ws/telemetry", headers={"origin": "https://untrusted.invalid"}):
            pass


def test_settings_validate_and_persist_only_demo(client):
    data = client.get("/api/settings").json()
    data["robotName"] = "Demo lab robot"
    result = client.put("/api/settings", json=data)
    assert result.status_code == 200 and result.json()["hardware_changed"] is False
    assert client.get("/api/settings").json()["robotName"] == "Demo lab robot"
    assert client.put("/api/settings", json={**data, "autoStop": False}).status_code == 422
    assert client.put("/api/settings", json={**data, "commandTimeout": 2, "watchdogTimeout": 1}).status_code == 422
    assert client.put("/api/settings", json={**data, "safetySpeed": 1.5}).status_code == 422


def test_settings_locked_when_moving(client):
    snapshot = client.app.state.robot.snapshot()
    snapshot.status.moving = True
    client.app.state.robot.snapshot = lambda: snapshot
    assert client.put("/api/settings", json={}).status_code == 423


def test_invalid_settings_file_is_preserved(client):
    path = client.app.state.settings.settings_file
    path.write_text("invalid-json")
    assert client.get("/api/settings").status_code == 503
    assert path.read_text() == "invalid-json"
