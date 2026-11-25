# csvjoin Operator Guide

This guide is for people who install csvjoin on machines other people use, or who run it from cron jobs, CI pipelines and scripts. It assumes you know the shell and the basics of running Python programs.

csvjoin is a single Python file. It is a batch tool: it reads two files, writes one result and exits. It has no service, no configuration file, no network access and no state between runs.

| Topic | Page |
| --- | --- |
| Put the tool on a machine or in an image | [Deployment](deployment.md) |
| The one setting: the row limit | [Configuration](configuration.md) |
| Call it from scripts and schedulers | [Running unattended](automation.md) |
| Memory, input size, input assumptions | [Limits and resource use](limits.md) |
| Exit codes and what each failure prints | [Failures and exit codes](failures.md) |
| Replace or remove an installation | [Upgrading and removing](upgrading.md) |

For how to use the tool itself, see the User Guide.

The source code is at <https://github.com/example/csvjoin>. csvjoin is released under the MIT licence.
