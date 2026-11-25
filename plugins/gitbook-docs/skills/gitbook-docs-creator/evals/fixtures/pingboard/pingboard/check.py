"""One check: a GET request; up means a status below 400 within the timeout."""
import time
import urllib.error
import urllib.request
from dataclasses import dataclass


@dataclass
class Result:
    url: str
    up: bool
    status: int
    millis: int
    error: str = ""


def check(url: str, timeout: float) -> Result:
    start = time.monotonic()
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "pingboard"})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            status = resp.status
        return Result(url, status < 400, status, int((time.monotonic() - start) * 1000))
    except urllib.error.HTTPError as e:
        return Result(url, False, e.code, int((time.monotonic() - start) * 1000), str(e))
    except Exception as e:  # DNS failure, refused connection, timeout
        return Result(url, False, 0, int((time.monotonic() - start) * 1000), str(e))
