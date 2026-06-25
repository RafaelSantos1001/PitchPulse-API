CREATE TABLE IF NOT EXISTS partidas (
    id_match VARCHAR(50) PRIMARY KEY,
    numero_jogo INT UNIQUE,
    data_jogo TIMESTAMP,
    time_casa VARCHAR(100),
    time_fora VARCHAR(100),
    gols_casa INT,
    gols_fora INT,
    fase VARCHAR(100),
    estadio VARCHAR(100),
    cidade VARCHAR(100),
    status_jogo VARCHAR(10)
);