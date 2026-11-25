"""Settings, read once from the environment."""
import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Config:
    port: int
    bind: str
    interval: int
    timeout: float
    data_file: Path
    log_level: str


def load() -> Config:
    interval = int(os.environ.get("PINGBOARD_INTERVAL", "60"))
    if interval < 5:
        raise SystemExit("pingboard: PINGBOARD_INTERVAL must be at least 5 seconds")
    return Config(
        port=int(os.environ.get("PINGBOARD_PORT", "8080")),
        bind=os.environ.get("PINGBOARD_BIND", "127.0.0.1"),
        interval=interval,
        timeout=float(os.environ.get("PINGBOARD_TIMEOUT", "5")),
        data_file=Path(os.environ.get("PINGBOARD_DATA", str(Path.home() / ".pingboard" / "targets.json"))),
        log_level=os.environ.get("PINGBOARD_LOG_LEVEL", "info"),
    )
