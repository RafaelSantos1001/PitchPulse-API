import os
import time
import psycopg2
from psycopg2.extras import execute_batch
import cloudscraper


FORMATO_BANDEIRA = "sq"
TAMANHO_BANDEIRA = "2"


def montar_url_bandeira(picture_url_template):
    """Preenche os placeholders {format}/{size} do PictureUrl da FIFA."""
    if not picture_url_template or not isinstance(picture_url_template, str):
        return None
    return (
        picture_url_template
        .replace("{format}", FORMATO_BANDEIRA)
        .replace("{size}", TAMANHO_BANDEIRA)
    )


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

def rodar_coletor():
    print("🚀 [Scraper] Coletor cirúrgico da Fase 2 iniciado...")

    try:
        database_url = os.getenv("DATABASE_URL")
        if database_url:
            conn = psycopg2.connect(database_url)
        else:
            host = os.getenv("DB_HOST", "banco_pitchpulse")
            user = os.getenv("DB_USER", "postgres")
            password = os.getenv("DB_PASSWORD", "postgres_password")
            dbname = os.getenv("DB_NAME", "placar_futebol")
            conn = psycopg2.connect(host=host, user=user, password=password, database=dbname)
        cursor = conn.cursor()
    except Exception as e:
        print(f"❌ [Scraper] Não conseguiu conectar ao banco: {e}")
        return

    dados_fifa = puxar_dados_fifa()
    if not dados_fifa or "Results" not in dados_fifa:
        print("⚠️ [Scraper] Nenhum dado válido recebido da FIFA nesta rodada.")
        cursor.close()
        conn.close()
        return

    lista_jogos = dados_fifa["Results"]
    dados_para_salvar = []

    for jogo in lista_jogos:
        id_match = jogo.get("IdMatch")
        status_raw = jogo.get("MatchStatus")
        
        status = "FIN" if status_raw == 0 else "3" if status_raw == 3 else "1"
        
        g_casa = jogo.get("HomeTeamScore") if jogo.get("HomeTeamScore") is not None else 0
        g_fora = jogo.get("AwayTeamScore") if jogo.get("AwayTeamScore") is not None else 0
        
        grupo_lista = jogo.get("GroupName", [])
        grupo_nome = "Fase Final"
        if grupo_lista and isinstance(grupo_lista, list) and len(grupo_lista) > 0:
            grupo_nome = grupo_lista[0].get("Description", "Fase Final")
        
        casa_info = jogo.get("Home", {}) or {}
        fora_info = jogo.get("Away", {}) or {}
        
        casa_nome = "A Definir"
        if casa_info.get("TeamName") and isinstance(casa_info["TeamName"], list) and len(casa_info["TeamName"]) > 0:
            casa_nome = casa_info["TeamName"][0].get("Description", "A Definir")
        elif isinstance(casa_info.get("TeamName"), str):
            casa_nome = casa_info["TeamName"]
            
        fora_nome = "A Definir"
        if fora_info.get("TeamName") and isinstance(fora_info["TeamName"], list) and len(fora_info["TeamName"]) > 0:
            fora_nome = fora_info["TeamName"][0].get("Description", "A Definir")
        elif isinstance(fora_info.get("TeamName"), str):
            fora_nome = fora_info["TeamName"]
        
        casa_emoji = montar_url_bandeira(casa_info.get("PictureUrl"))
        fora_emoji = montar_url_bandeira(fora_info.get("PictureUrl"))

        tempo_jogo = jogo.get("MatchTime") or None

        data_jogo = jogo.get("LocalDate") or jogo.get("Date") or None

        stadium_info = jogo.get("Stadium", {}) or {}
        estadio_nome = None
        nome_lista = stadium_info.get("Name", [])
        if nome_lista and isinstance(nome_lista, list) and len(nome_lista) > 0:
            estadio_nome = nome_lista[0].get("Description")

        cidade_nome = None
        cidade_lista = stadium_info.get("CityName", [])
        if cidade_lista and isinstance(cidade_lista, list) and len(cidade_lista) > 0:
            cidade_nome = cidade_lista[0].get("Description")

        if estadio_nome and cidade_nome:
            estadio_completo = f"{estadio_nome} ({cidade_nome})"
        elif estadio_nome:
            estadio_completo = estadio_nome
        else:
            estadio_completo = None

        fase_lista = jogo.get("StageName", [])
        fase_nome = None
        if fase_lista and isinstance(fase_lista, list) and len(fase_lista) > 0:
            fase_nome = fase_lista[0].get("Description")

        numero_jogo = jogo.get("MatchNumber")
        
        if id_match is None: 
            continue
            
        dados_para_salvar.append((
            str(id_match), status, g_casa, g_fora, str(grupo_nome), 
            str(casa_nome), casa_emoji, str(fora_nome), fora_emoji, tempo_jogo,
            data_jogo, estadio_completo, fase_nome, numero_jogo
        ))

    query = """
        INSERT INTO partidas (id_match, status, gols_casa, gols_fora, grupo_nome, casa_nome, casa_emoji, fora_nome, fora_emoji, tempo_jogo, data_jogo, estadio_nome, fase_nome, numero_jogo)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id_match) 
        DO UPDATE SET 
            fase_nome = EXCLUDED.fase_nome,
            numero_jogo = EXCLUDED.numero_jogo,
            status = EXCLUDED.status,
            gols_casa = EXCLUDED.gols_casa,
            gols_fora = EXCLUDED.gols_fora,
            grupo_nome = EXCLUDED.grupo_nome,
            casa_nome = EXCLUDED.casa_nome,
            casa_emoji = EXCLUDED.casa_emoji,
            fora_nome = EXCLUDED.fora_nome,
            fora_emoji = EXCLUDED.fora_emoji,
            tempo_jogo = EXCLUDED.tempo_jogo,
            data_jogo = EXCLUDED.data_jogo,
            estadio_nome = EXCLUDED.estadio_nome;
    """

    try:
        execute_batch(cursor, query, dados_para_salvar)
        conn.commit()
        print(f"✅ [Scraper] Processamento concluído! {len(dados_para_salvar)} jogos salvos em lote com sucesso.")
    except Exception as e:
        print(f"❌ [Scraper] Erro durante o salvamento em lote: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":

    LOOP_CONTINUO = os.getenv("SCRAPER_LOOP_CONTINUO", "true").lower() not in ("false", "0", "nao", "não")

    if not LOOP_CONTINUO:
        print("▶️ [Scraper] Modo execução única (SCRAPER_LOOP_CONTINUO=false).")
        rodar_coletor()
        raise SystemExit(0)


    INTERVALO_SEGUNDOS = int(os.getenv("SCRAPER_INTERVALO_SEGUNDOS", "60"))

    print(f"🔁 [Scraper] Modo contínuo ativado — coletando a cada {INTERVALO_SEGUNDOS}s.")

    while True:
        try:
            rodar_coletor()
        except Exception as e:

            print(f"❌ [Scraper] Erro inesperado no ciclo de coleta: {e}")

        print(f"⏳ [Scraper] Aguardando {INTERVALO_SEGUNDOS}s até a próxima coleta...")
        time.sleep(INTERVALO_SEGUNDOS)