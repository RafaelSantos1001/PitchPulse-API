-- ========================================================
-- PITCHPULSE API - CONFIGURAÇÃO NATIVA DA FASE 2
-- ========================================================

-- Criação da tabela principal adaptada para os dados reais da FIFA
CREATE TABLE IF NOT EXISTS partidas (
    id_match VARCHAR(50) PRIMARY KEY,
    status VARCHAR(10),
    gols_casa INT DEFAULT 0,
    gols_fora INT DEFAULT 0,
    grupo_nome VARCHAR(100),
    casa_nome VARCHAR(100),
    casa_emoji VARCHAR(10),
    fora_nome VARCHAR(100),
    fora_emoji VARCHAR(10)
);

-- Limpa os dados antigos para evitar conflitos na reinicialização do container
TRUNCATE TABLE partidas CASCADE;