LOG_FILE ?= server.log

.DEFAULT_GOAL := help

.PHONY: help setup setup-pi lock env run logs simulate test lint lint-fix clean

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

setup:
	uv sync

setup-pi:
	python3 -m venv .venv
	.venv/bin/pip install --upgrade pip
	.venv/bin/pip install -r requirements.txt
	@echo "done - run with: .venv/bin/python -m main"

lock:
	uv export --no-hashes --no-dev --no-emit-project --format requirements-txt -o requirements.txt

env:
	@test -f .env || (cp .env.example .env && echo "created .env - edit RECIPIENT_PUBKEY / PUBLIC_SERVER_URL")

run: env
	$(PY) -m main

logs:
	@touch $(LOG_FILE) && tail -f $(LOG_FILE)

simulate:
	@test -n "$(REF)" || (echo "usage: make simulate REF=<reference>" && exit 1)
	$(PY) -m scripts.simulate_buyer $(REF)

test:
	$(PY) -m pytest

lint:
	$(PY) -m ruff check .
	$(PY) -m ruff format --check .

lint-fix:
	$(PY) -m ruff check --fix .
	$(PY) -m ruff format .

clean:
	rm -f $(LOG_FILE) .local_buyer_keypair.json
	find . -type d -name __pycache__ -exec rm -rf {} +

# use `uv run` on dev machines, the plain venv on the Pi (where uv isn't installed)
PY := $(shell command -v uv >/dev/null 2>&1 && echo "uv run python" || echo ".venv/bin/python")
