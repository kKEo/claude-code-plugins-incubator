# How to make common changes

Each recipe lists every place that a change of this kind touches, including tests and documentation. Use it as a checklist.

## Add a setting

Example: a setting for the `User-Agent` header.

1. `pingboard/config.py`: add a field to `Config` and read it in `load()` with a default. Validate it there if a wrong value can be detected, and stop with `raise SystemExit("pingboard: ...")`.
2. Pass the value to the code that needs it as an argument. For the example, `check.check` gets a new parameter, and its two callers, in `cli.py` and `server.py`, pass `cfg.user_agent`. Do not read the environment anywhere else.
3. `tests/test_config.py`: test the default and an override.
4. Documentation: add the variable to the settings table of the user guide (`user/src/commands.md`), to the operator guide (`operator/src/configuration.md`) and to the `Config` table of the [module reference](modules.md).

Remember that `config.load()` runs for every command. A new validation rule can make `pingboard list` fail for existing users, so validate only what is certainly wrong.

## Add an option to a command

Example: `pingboard list --json`.

1. `pingboard/cli.py`: add the argument to the parser of the command with `add_argument` and a `help` text; handle it in the branch of the command.
2. `tests/test_cli.py`: call `cli.main([...])` with and without the option. Set `PINGBOARD_DATA` to a temporary path.
3. Documentation: the command reference of the user guide (`user/src/commands.md`), and the page of the user guide that describes the command.

## Add a command

1. `pingboard/cli.py`: add a parser with `sub.add_parser("<name>", help="...")` and a new `elif args.cmd == "<name>":` branch. Keep the branch short; put real work into the module it belongs to.
2. Update the module docstring of `cli.py`, which lists the commands.
3. Tests and documentation as for an option. Also add the command to the first page of the user guide if it changes how people start.

## Add an HTTP route

Example: `/api/targets`, which returns the target list.

1. `pingboard/server.py`: add an `elif self.path == "/api/targets":` branch to `Handler.do_GET`, before the final `else`. Build the body, then call `self._send(code, content_type, body)`.
2. If the route reads `results` or `checks_total`, read them inside `with lock:` and call `_send` after the block.
3. The handler has no access to the configuration at present. A route that needs it, as the example does for the data file, needs a way to reach it; propose the approach in the issue before you write the code.
4. Tests: start `ThreadingHTTPServer(("127.0.0.1", 0), server.Handler)` in a thread and request the route. The tester guide has the pattern.
5. Documentation: the endpoints page of the operator guide (`operator/src/endpoints.md`) and the table of addresses in the user guide (`user/src/dashboard.md`).

## Add a metric

1. `pingboard/server.py`: collect the value where it arises, usually in `loop`, in a module-level variable that is changed under the lock. Add a line to the `/metrics` branch of `do_GET`.
2. Follow the naming convention: prefix `pingboard_`, unit as suffix, `_total` for counters.
3. Documentation: the metrics table of the operator guide (`operator/src/endpoints.md`), and the alert examples in `operator/src/monitoring.md` if the metric is useful for alerts.

## Add a field to a result

1. `pingboard/check.py`: add the field to `Result` **with a default value**, after the existing fields, and fill it in `check()`.
2. The field appears automatically in `pingboard check --json` and in `/api/status`, because both serialise `Result.__dict__`. Check that the value is serialisable as JSON.
3. Show it on the dashboard or in the text output of `check` only if the issue asks for it; both are separate format strings in `server.py` and `cli.py`.
4. Documentation: the field tables in the user guide (`user/src/checking.md`), the operator guide (`operator/src/endpoints.md`) and the [module reference](modules.md).

## Change what "up" means

The rule lives in one expression, `status < 400` in `check.check`. A change here alters the result of every installation, so it needs an issue and agreement first. The rule is documented on the first page of the user guide, in `user/src/checking.md` and in `operator/src/endpoints.md`.

## Raise the version

The version is the `version` field in `pyproject.toml` and nowhere else in the code. The operator guide names the version it describes in `operator/src/README.md` and `operator/src/upgrading.md`, and this guide in `README.md`; update them together. Maintainers raise the version, not individual pull requests.
