from typing import Literal

from pydantic import Field, model_validator

from app.schemas.robot import Model


class DemoSettings(Model):
    robotName: str = Field(default="PBL6-Robot01", min_length=1, max_length=48)
    language: Literal["English", "Vietnamese"] = "English"
    maxSpeed: float = Field(default=.8, ge=.01, le=2)
    maxAcceleration: float = Field(default=1.5, ge=.01, le=5)
    wheelRadius: float = Field(default=.048, ge=.01, le=.3)
    robotLength: float = Field(default=.32, ge=.1, le=2)
    robotWidth: float = Field(default=.3, ge=.1, le=2)
    aiModel: Literal["YOLOv8 (Human Detection)", "MobileNet-SSD", "Faster R-CNN"] = "YOLOv8 (Human Detection)"
    confidence: float = Field(default=.5, ge=.1, le=1)
    tracking: bool = True
    prediction: bool = True
    commandTimeout: float = Field(default=.5, ge=.1, le=2)
    watchdogTimeout: float = Field(default=1, ge=.2, le=5)
    autoStop: Literal[True] = True
    safetySpeed: float = Field(default=.8, ge=.01, le=2)

    @model_validator(mode="after")
    def safety_invariants(self):
        if not self.robotName.strip():
            raise ValueError("Robot name must not be blank")
        if self.commandTimeout >= self.watchdogTimeout:
            raise ValueError("Watchdog timeout must exceed command timeout")
        if self.safetySpeed > self.maxSpeed:
            raise ValueError("Safety speed cannot exceed maximum speed")
        return self
