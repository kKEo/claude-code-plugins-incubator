"""API tests: start the handler against a temporary database."""
import importlib
import os


def load(tmp_path, **env):
    os.environ["NOTEKEEP_DB"] = str(tmp_path / "n.db")
    os.environ.update(env)
    import notekeep
    return importlib.reload(notekeep)


def test_default_port(tmp_path):
    os.environ.pop("NOTEKEEP_PORT", None)
    assert load(tmp_path).PORT == 7070


def test_schema_created(tmp_path):
    nk = load(tmp_path)
    assert nk.db().execute("SELECT count(*) FROM notes").fetchone()[0] == 0
