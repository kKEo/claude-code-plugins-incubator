import pytest
from pingboard import config


def test_defaults(monkeypatch):
    for k in ("PINGBOARD_PORT", "PINGBOARD_INTERVAL", "PINGBOARD_TIMEOUT"):
        monkeypatch.delenv(k, raising=False)
    cfg = config.load()
    assert (cfg.port, cfg.interval, cfg.timeout) == (8080, 60, 5.0)


def test_interval_floor(monkeypatch):
    monkeypatch.setenv("PINGBOARD_INTERVAL", "2")
    with pytest.raises(SystemExit):
        config.load()
