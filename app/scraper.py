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
        else:
            print(f"⚠️ [Scraper] Erro na resposta do servidor: Status {resposta.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ [Scraper] Falha ao conectar na API da FIFA: {e}")
        return None

def garantir_banco_e_tabela():
    host = os.getenv("DB_HOST", "container_banco_pitchpulse")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "senha_secreta")
    dbname = os.getenv("DB_NAME", "placar_futebol")

    conn = psycopg2.connect(host=host, user=user, password=password, database="postgres")
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{dbname}';")
    if not cursor.fetchone():
        print(f"🛠️ [Banco] Criando o banco de dados '{dbname}'...")
        cursor.execute(f"CREATE DATABASE {dbname};")
    
    cursor.close()
    conn.close()

    conn = psycopg2.connect(host=host, user=user, password=password, database=dbname)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS partidas (
            id_match INT PRIMARY KEY,
            status INT,
            gols_casa INT,
            gols_fora INT
        );
    """)
    conn.commit()
    cursor.close()
    conn.close()

def salvar_no_banco(dados):
    if not dados:
        print("⚠️ [Scraper] Nenhum dado recebido para salvar.")
        return
        
    try:
        garantir_banco_e_tabela()
        
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "container_banco_pitchpulse"),
            database=os.getenv("DB_NAME", "placar_futebol"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "senha_secreta")
        )
        cursor = conn.cursor()
        
        jogos = dados.get("Results", [])
        print(f"💾 [Scraper] Processando {len(jogos)} partidas para o banco de dados...")
        
        for jogo in jogos:
            id_match = jogo.get("MatchNumber")
            status = jogo.get("MatchStatus")
            g_casa = jogo.get("HomeTeamScore")
            g_fora = jogo.get("AwayTeamScore")
            
            query = """
                INSERT INTO partidas (id_match, status, gols_casa, gols_fora)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (id_match) 
                DO UPDATE SET 
                    status = EXCLUDED.status,
                    gols_casa = EXCLUDED.gols_casa,
                    gols_fora = EXCLUDED.gols_fora;
            """
            cursor.execute(query, (id_match, status, g_casa, g_fora))
            
        conn.commit()
        cursor.close()
        conn.close()
        print("✅ [Scraper] Banco de dados atualizado com sucesso!")
        
    except Exception as e:
        print(f"❌ [Scraper] Erro ao gravar no banco de dados: {e}")

if __name__ == "__main__":
    dados_futebol = puxar_dados_fifa()
    if dados_futebol:
        salvar_no_banco(dados_futebol)