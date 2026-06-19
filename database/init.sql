CREATE TABLE IF NOT EXISTS placar_futebol (
    id SERIAL PRIMARY KEY,
    id_jogo INT UNIQUE,
    time_casa VARCHAR(100),
    time_fora VARCHAR(100),
    gols_casa INT DEFAULT 0,
    gols_fora INT DEFAULT 0,
    escanteios_casa INT DEFAULT 0,
    escanteios_fora INT DEFAULT 0,
    status_jogo VARCHAR(50) NOT NULL,
    ultimo_lance VARCHAR(255),
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);