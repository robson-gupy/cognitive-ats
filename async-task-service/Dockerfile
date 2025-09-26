# syntax=docker/dockerfile:1

FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends \
	ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

FROM base AS builder
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --prefix=/install -r /app/requirements.txt

FROM base AS runtime

# Cria usuário não-root
RUN useradd -u 10001 -m appuser
USER appuser

COPY --from=builder /install /usr/local
COPY src /app/src

CMD ["python", "src/consumer.py"]
