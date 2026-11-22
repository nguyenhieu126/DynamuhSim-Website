import os
import tempfile
from pathlib import Path
from threading import Lock

from app.schemas.settings import DemoSettings


class SettingsStore:
    """Atomic demo-only JSON persistence. Never consumed by hardware drivers."""

    def __init__(self, path: Path):
        self.path = path
        self.lock = Lock()

    def read(self) -> DemoSettings:
        if not self.path.exists():
            return DemoSettings()
        return DemoSettings.model_validate_json(self.path.read_text())

    def save(self, settings: DemoSettings) -> None:
        with self.lock:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            filename = None
            try:
                with tempfile.NamedTemporaryFile(mode="w", dir=self.path.parent, delete=False) as temp:
                    filename = temp.name
                    temp.write(settings.model_dump_json(indent=2))
                    temp.flush()
                    os.fsync(temp.fileno())
                os.replace(filename, self.path)
            finally:
                if filename and os.path.exists(filename):
                    os.unlink(filename)
