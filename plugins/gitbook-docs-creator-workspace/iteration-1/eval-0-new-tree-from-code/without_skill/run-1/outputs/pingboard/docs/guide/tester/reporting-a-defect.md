# Reporting a defect

Report defects as issues in the repository:
<https://github.com/example/pingboard/issues>.

## Before you report

- Reproduce the problem with a throwaway targets file and local test targets
  from [Test environment](test-environment.md), so that the report does not
  depend on a website that others cannot reach.
- Check the known weaknesses below.

## What a report contains

| Item | How to get it |
| --- | --- |
| pingboard version or commit | `pip show pingboard`, `git rev-parse HEAD` |
| Python version | `python --version` |
| Operating system | |
| Settings | `env \| grep PINGBOARD_` |
| Steps | The exact commands, in order |
| Expected result | With a reference to the page of the guide or the test case ID |
| Actual result | Full output, exit code (`echo $?`), and for `pingboard serve` the log at `PINGBOARD_LOG_LEVEL=debug` |
| Content of the targets file | When the problem concerns the list |

Remove internal host names and other confidential data before you post
output.

## Known weaknesses

These are documented behaviour of version 0.6.0, not new defects:

| Behaviour | Documented in |
| --- | --- |
| An invalid targets file stops the check loop while `/healthz` still answers `ok` | Operator guide, Architecture and Troubleshooting |
| Results of removed targets stay until a restart | User guide, Managing targets |
| Non-numeric settings give a traceback instead of a message | Operator guide, Configuration |
| Target URLs are not escaped on the dashboard and in the metrics | Operator guide, Security |
| The dashboard has no authentication | Operator guide, Security |
