FROM python:3.10-slim

WORKDIR /code

RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Garante que todo o código da pasta atual vá para dentro de /code no container
COPY . .