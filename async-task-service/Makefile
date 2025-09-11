PY=python
PIP=pip

.PHONY: venv install dev lint type format precommit docker-up docker-down run publish

venv:
	$(PY) -m venv .venv
	. .venv/bin/activate
	pip install -U pip

install:
	$(PIP) install -r requirements.txt

dev:
	$(PIP) install -r requirements.txt -r requirements-dev.txt
	pre-commit install

lint:
	ruff check --fix

format:
	ruff format

type:
	mypy src

precommit:
	pre-commit run --all-files

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down -v

run:
	$(PY) src/consumer.py

publish:
	$(PY) src/publish_test_message.py


