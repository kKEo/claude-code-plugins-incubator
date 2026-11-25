from pingboard import store


def test_roundtrip_sorted_unique(tmp_path):
    f = tmp_path / "t.json"
    store.write(f, ["https://b.example", "https://a.example", "https://b.example"])
    assert store.read(f) == ["https://a.example", "https://b.example"]


def test_missing_file_is_empty(tmp_path):
    assert store.read(tmp_path / "none.json") == []
