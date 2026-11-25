import pytest
from pingboard import cli


def test_add_rejects_non_http(monkeypatch, tmp_path):
    monkeypatch.setenv("PINGBOARD_DATA", str(tmp_path / "t.json"))
    with pytest.raises(SystemExit):
        cli.main(["add", "ftp://example.org"])
