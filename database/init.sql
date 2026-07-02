CREATE TABLE IF NOT EXISTS partidas (
    id_match VARCHAR(50) PRIMARY KEY,
    status VARCHAR(10),
    gols_casa INT DEFAULT 0,
    gols_fora INT DEFAULT 0,
    grupo_nome VARCHAR(100),
    casa_nome VARCHAR(100),
    casa_emoji VARCHAR(255),
    fora_nome VARCHAR(100),
    fora_emoji VARCHAR(255),
    tempo_jogo VARCHAR(10),
    data_jogo TIMESTAMP,
    estadio_nome VARCHAR(150),
    fase_nome VARCHAR(100),
    numero_jogo INT
);

TRUNCATE TABLE partidas CASCADE;