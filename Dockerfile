FROM python:3.10-slim

WORKDIR /code

# Instala dependências do sistema para o banco de dados
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Instala dependências do Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia todos os arquivos do projeto para dentro da imagem do container
COPY . .