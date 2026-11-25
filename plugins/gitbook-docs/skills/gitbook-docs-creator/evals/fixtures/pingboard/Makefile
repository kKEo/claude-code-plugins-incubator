.PHONY: test lint run

test:
	python -m pytest -q

lint:
	python -m ruff check pingboard tests

run:
	python -m pingboard.cli serve
