-- ========================================================
-- 1. CRIAÇÃO DAS TABELAS (COPA DO MUNDO / EURO)
-- ========================================================

CREATE TABLE IF NOT EXISTS times (
    id_time INT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    grupo VARCHAR(5) NOT NULL,
    emoji VARCHAR(30) -- Aumentado para 30 para suportar os emojis complexos (como 🏴󠁧󠁢󠁳🇪)
);

CREATE TABLE IF NOT EXISTS partidas (
    id_match INT PRIMARY KEY,
    id_casa INT REFERENCES times(id_time),
    id_fora INT REFERENCES times(id_time),
    gols_casa INT,
    gols_fora INT,
    status INT NOT NULL, -- 0: Encerrado, 3: Ao Vivo, 1: Agendado
    grupo_nome VARCHAR(5)
);

TRUNCATE TABLE partidas CASCADE;
TRUNCATE TABLE times CASCADE;

-- ========================================================
-- 2. INSERÇÃO DOS TIMES (TODOS OS GRUPOS)
-- ========================================================

-- Grupo A
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (1, 'Alemanha', 'A', '🇩🇪');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (2, 'Escócia', 'A', '🏴󠁧󠁢󠁳🇪');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (3, 'Hungria', 'A', '🇭🇺');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (4, 'Suíça', 'A', '🇨🇭');

-- Grupo B
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (5, 'Espanha', 'B', '🇪🇸');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (6, 'Croácia', 'B', '🇭🇷');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (7, 'Itália', 'B', '🇮🇹');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (8, 'Albânia', 'B', '🇦🇱');

-- Grupo C
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (9, 'Eslovênia', 'C', '🇸🇮');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (10, 'Dinamarca', 'C', '🇩🇰');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (11, 'Sérvia', 'C', '🇷🇸');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (12, 'Inglaterra', 'C', '🏴󠁧󠁢󠁥󠁮󠁧󠁿');

-- Grupo D
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (13, 'Polônia', 'D', '🇵🇱');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (14, 'Holanda', 'D', '🇳🇱');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (15, 'Áustria', 'D', '🇦🇹');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (16, 'França', 'D', '🇫🇷');

-- Grupo E
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (17, 'Bélgica', 'E', '🇧🇪');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (18, 'Eslováquia', 'E', '🇸🇰');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (19, 'Romênia', 'E', '🇷🇴');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (20, 'Ucrânia', 'E', '🇺🇦');

-- Grupo F
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (21, 'Turquia', 'F', '🇹🇷');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (22, 'Geórgia', 'F', '🇬🇪');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (23, 'Portugal', 'F', '🇵🇹');
INSERT INTO times (id_time, nome, grupo, emoji) VALUES (24, 'República Tcheca', 'F', '🇨🇿');


-- ========================================================
-- 3. INSERÇÃO DAS PARTIDAS (EXEMPLOS DAS RODADAS)
-- ========================================================

-- Rodada 1
INSERT INTO partidas (id_match, id_casa, id_fora, gols_casa, gols_fora, status, grupo_nome) VALUES (101, 1, 2, 5, 1, 0, 'A'); -- Alemanha 5x1 Escócia (Encerrado)
INSERT INTO partidas (id_match, id_casa, id_fora, gols_casa, gols_fora, status, grupo_nome) VALUES (102, 3, 4, 1, 3, 0, 'A'); -- Hungria 1x3 Suíça (Encerrado)
INSERT INTO partidas (id_match, id_casa, id_fora, gols_casa, gols_fora, status, grupo_nome) VALUES (103, 5, 6, 3, 0, 0, 'B'); -- Espanha 3x0 Croácia (Encerrado)
INSERT INTO partidas (id_match, id_casa, id_fora, gols_casa, gols_fora, status, grupo_nome) VALUES (104, 7, 8, 2, 1, 0, 'B'); -- Itália 2x1 Albânia (Encerrado)

-- Rodada 2
INSERT INTO partidas (id_match, id_casa, id_fora, gols_casa, gols_fora, status, grupo_nome) VALUES (105, 1, 3, 2, 0, 0, 'A'); -- Alemanha 2x0 Hungria (Encerrado)
INSERT INTO partidas (id_match, id_casa, id_fora, gols_casa, gols_fora, status, grupo_nome) VALUES (106, 2, 4, 1, 1, 0, 'A'); -- Escócia 1x1 Suíça (Encerrado)
INSERT INTO partidas (id_match, id_casa, id_fora, gols_casa, gols_fora, status, grupo_nome) VALUES (107, 6, 8, 2, 2, 0, 'B'); -- Croácia 2x2 Albânia (Encerrado)
INSERT INTO partidas (id_match, id_casa, id_fora, gols_casa, gols_fora, status, grupo_nome) VALUES (108, 5, 7, 1, 0, 0, 'B'); -- Espanha 1x0 Itália (Encerrado)

-- Exemplos de Jogos Ao Vivo (Status 3) e Agendados (Status 1)
INSERT INTO partidas (id_match, id_casa, id_fora, gols_casa, gols_fora, status, grupo_nome) VALUES (109, 14, 16, 2, 2, 3, 'D'); -- Holanda 2x2 França (Ao Vivo)
INSERT INTO partidas (id_match, id_casa, id_fora, gols_casa, gols_fora, status, grupo_nome) VALUES (110, 23, 24, null, null, 1, 'F'); -- Portugal x Rep. Tcheca (Agendado)