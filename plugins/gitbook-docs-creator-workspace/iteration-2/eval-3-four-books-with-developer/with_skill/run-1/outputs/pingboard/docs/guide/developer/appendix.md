# Appendix: names in the code

These are the names you meet in the code, in alphabetical order, with the word users and operators see when it differs.

| Name | Where | Meaning |
|---|---|---|
| `cfg` | everywhere | The `Config` instance, by convention the name of the argument that carries it. |
| `check()` | `pingboard/check.py` | Makes one request to one URL and returns a `Result`. Never raises. |
| `checks_total` | `pingboard/server.py` | Module-level count of checks since start. Operators see it as the metric `pingboard_checks_total`. |
| `Config` | `pingboard/config.py` | Frozen dataclass with all settings. |
| `data_file` | `Config` field | Path of the targets file. Operators set it with `PINGBOARD_DATA`. |
| `Handler` | `pingboard/server.py` | The `BaseHTTPRequestHandler` subclass that answers every HTTP request. |
| `load()` | `pingboard/config.py` | Reads the environment and returns a `Config`. |
| `lock` | `pingboard/server.py` | The `threading.Lock` that guards `results` and `checks_total`. |
| `loop()` | `pingboard/server.py` | The body of the checker thread. The guides call one pass of it a round. |
| `millis` | `Result` field | Duration of a check in milliseconds. |
| `Result` | `pingboard/check.py` | Dataclass with the outcome of one check. |
| `results` | `pingboard/server.py` | Module-level dictionary from URL to its latest `Result`. |
| `serve()` | `pingboard/server.py` | Starts the checker thread and the HTTP server. |
| `targets` | `pingboard/store.py`, the JSON key | The list of URLs. Users call one of them an address. |
| `up` | `Result` field | `True` when the status was below 400 within the timeout. |
