"""The list of targets: one JSON file, rewritten atomically on every change."""
import json
import os
from pathlib import Path
from typing import List


def read(path: Path) -> List[str]:
    if not path.exists():
        return []
    return json.loads(path.read_text())["targets"]


def write(path: Path, targets: List[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps({"targets": sorted(set(targets))}, indent=2))
    os.replace(tmp, path)
