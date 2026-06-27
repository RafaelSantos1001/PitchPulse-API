import os
import time
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import cloudscraper 

def puxar_dados_fifa():
    url = "https://api.fifa.com/api/v3/calendar/matches?language=en&count=500&idSeason=285023"
    try:
        print("🌐 [Scraper] Coletando dados consolidados via CloudScraper...")
        scraper = cloudscraper.create_scraper()
        resposta = scraper.get(url, timeout=15)
        if resposta.status_code == 200:
            return resposta.json()
        return None
    except Exception as e:
        print(f"❌ [Scraper] Falha ao conectar na API da FIFA: {e}")
        return None

def garantir_banco_e_tabela():
    host = os.getenv("DB_HOST", "container_banco_pitchpulse")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "postgres_password")
    dbname = os.getenv("DB_NAME", "placar_futebol")

    conn = psycopg2.connect(host=host, user=user, password=password, database="postgres")
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{dbname}';")
    if not cursor.fetchone():
        cursor.execute(f"CREATE DATABASE {dbname};")
    cursor.close()
    conn.close()

    conn = psycopg2.connect(host=host, user=user, password=password, database=dbname)
    cursor = conn.cursor()
    # Criando a tabela unificada com todos os campos necessários para o front-end
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS partidas (
            id_match INT PRIMARY KEY,
            status INT,
            gols_casa INT,
            gols_fora INT,
            grupo_nome VARCHAR(50),
            casa_nome VARCHAR(100),
            casa_emoji VARCHAR(10),
            fora_nome VARCHAR(100),
            fora_emoji VARCHAR(10)
        );
    """)
    conn.commit()
    cursor.close()
    conn.close()

def salvar_no_banco(dados):
    if not dados: return
    try:
        garantir_banco_e_tabela()
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "container_banco_pitchpulse"),
            database=os.getenv("DB_NAME", "placar_futebol"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "postgres_password")
        )
        cursor = conn.cursor()
        jogos = dados.get("Results", [])
        
        for jogo in jogos:
            id_match = jogo.get("MatchNumber")
            status = jogo.get("MatchStatus")
            g_casa = jogo.get("HomeTeamScore")
            g_fora = jogo.get("AwayTeamScore")
            
            # Extraindo metadados extras diretamente do JSON estruturado da FIFA
            grupo_nome = "A"  # Fallback ou mapeamento dinâmico baseado em StageName se houver
            
            casa_info = jogo.get("Home", {}) or {}
            fora_info = jogo.get("Away", {}) or {}
            
            casa_nome = casa_info.get("TeamName", "A Definir")
            fora_nome = fora_info.get("TeamName", "A Definir")
            
            # Fallbacks amigáveis de emoji para as seleções
            casa_emoji = "🏳️"
            fora_emoji = "🏳️"
            
            if id_match is None: continue
                
            query = """
                INSERT INTO partidas (id_match, status, gols_casa, gols_fora, grupo_nome, casa_nome, casa_emoji, fora_nome, fora_emoji)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id_match) 
                DO UPDATE SET 
                    status = EXCLUDED.status,
                    gols_casa = EXCLUDED.gols_casa,
                    gols_fora = EXCLUDED.gols_fora,
                    grupo_nome = EXCLUDED.grupo_nome,
                    casa_nome = EXCLUDED.casa_nome,
                    fora_nome = EXCLUDED.fora_nome;
            """
            cursor.execute(query, (id_match, status, g_casa, g_fora, grupo_nome, casa_nome, casa_emoji, fora_nome, fora_emoji))
            
        conn.commit()
        cursor.close()
        conn.close()
        print("✅ [Scraper] Banco de dados populado com a nova estrutura!")
    except Exception as e:
        print(f"❌ [Scraper] Erro ao gravar dados estruturados: {e}")

if __name__ == "__main__":
    dados_futebol = puxar_dados_fifa()
    if dados_futebol:
        salvar_no_banco(dados_futebol)