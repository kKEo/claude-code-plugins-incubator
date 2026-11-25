# Extension points

This chapter shows how behaviour is added to pingboard. The code has no plugin mechanism, no hooks and no registry: every feature is a small edit in the core, at one of the four places below.

## Add a command

Commands are sub-parsers in `cli.main()` (`pingboard/cli.py`) and one branch each in the `if args.cmd == …` chain below.

1. Register the sub-parser with a help line and its arguments. The existing `remove` command is the model:

   ```python
   r = sub.add_parser("remove", help="remove a URL from the list")
   r.add_argument("url")
   ```

2. Add the branch. Read the list with `store.read(cfg.data_file)`, and report a user error with `sys.exit("pingboard: …")`:

   ```python
   elif args.cmd == "remove":
       targets = store.read(cfg.data_file)
       if args.url not in targets:
           sys.exit(f"pingboard: {args.url} is not in the list")
       store.write(cfg.data_file, [t for t in targets if t != args.url])
   ```

3. Add a test in `tests/test_cli.py` that calls `cli.main([...])`, and a section in the operator guide's [Commands and flags](../../operator/config/commands.md).

## Add a setting

1. Add a field to `Config` in `pingboard/config.py`.
2. Read it in `load()` with a default, following the existing lines:

   ```python
   timeout=float(os.environ.get("PINGBOARD_TIMEOUT", "5")),
   ```

3. Pass the value to the function that needs it; do not read `os.environ` anywhere else.
4. Add a row to [Environment variables and settings](../../operator/config/environment.md), and a default to `test_defaults` in `tests/test_config.py`.

## Add an HTTP path

Paths are branches in `Handler.do_GET()` (`pingboard/server.py`). Take `lock` while reading `results` or `checks_total`, and answer with `self._send(code, content_type, body)`:

```python
elif self.path == "/api/status":
    with lock:
        body = json.dumps([r.__dict__ for r in results.values()])
    self._send(200, "application/json", body)
```

Add the branch before the final `else`, which answers `404`. Document the path in [HTTP endpoints](../../operator/config/http.md).

## Add a metric

Metrics are lines built in the `/metrics` branch of `Handler.do_GET()`. A counter needs a module-level variable that `loop()` updates under `lock`, as `checks_total` does; a per-target value is one more list comprehension over `results`:

```python
lines += [f'pingboard_target_up{{url="{u}"}} {int(r.up)}' for u, r in results.items()]
```

Name it `pingboard_<what>_<unit>` and add a row to [Metrics and logs](../../operator/monitoring/signals.md).

## Change what "up" means

The rule is one expression in `check.check()` (`pingboard/check.py`): `status < 400`. It is stated in the user guide, the operator guide and the tester guide, so a change here is a change to all three.
