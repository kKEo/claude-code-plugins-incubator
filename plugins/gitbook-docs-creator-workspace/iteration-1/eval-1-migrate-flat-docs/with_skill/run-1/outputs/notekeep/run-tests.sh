#!/bin/sh
# Runs the whole suite. CI calls this script.
set -e
python3 -m pytest -q tests
python3 -m py_compile notekeep.py
