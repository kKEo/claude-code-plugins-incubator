import os
import pytest


def test_show_missing_note_exits(tmp_path):
    os.environ["NOTEKEEP_DB"] = str(tmp_path / "n.db")
    import notekeep
    with pytest.raises(SystemExit):
        notekeep.main(["show", "nope"])
