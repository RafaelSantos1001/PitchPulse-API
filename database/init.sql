-- Criar tabela de placares dos jogos
CREATE TABLE IF NOT EXISTS placar_futebol (
    id SERIAL PRIMARY KEY,
    time_casa VARCHAR(50) NOT NULL,
    time_fora VARCHAR(50) NOT NULL,
    gols_casa INTEGER DEFAULT 0,
    gols_fora INTEGER DEFAULT 0,
    status VARCHAR(10) DEFAULT 'EM_BREVE'
);

-- Criar tabela de classificação dos grupos
CREATE TABLE IF NOT EXISTS classificacao_grupos (
    id SERIAL PRIMARY KEY,
    grupo VARCHAR(1) NOT NULL,
    time_nome VARCHAR(50) UNIQUE NOT NULL,
    pontos INTEGER DEFAULT 0,
    jogos INTEGER DEFAULT 0,
    vitorias INTEGER DEFAULT 0,
    empates INTEGER DEFAULT 0,
    derrotas INTEGER DEFAULT 0,
    gols_pro INTEGER DEFAULT 0,
    gols_contra INTEGER DEFAULT 0,
    saldo_gols INTEGER DEFAULT 0
);