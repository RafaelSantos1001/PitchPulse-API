import json
import os
import requests
import psycopg2
from datetime import datetime

def conectar_banco():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "container_banco_pitchpulse"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "senha_secreta"),
        database=os.getenv("DB_NAME", "meu_banco")
    )

def carregar_e_salvar_jogos():
    url_fifa = "https://api.fifa.com/api/v3/calendar/matches?language=en&count=500&idSeason=285023"
    caminho_json_local = "app/estrutura_copa.json"
    dados = None

    # 1. TENTA BUSCAR OS DADOS AO VIVO DA API DA FIFA
    try:
        print("🌐 Conectando à API viva da FIFA para buscar atualizações...")
        resposta = requests.get(url_fifa, timeout=10)
        if resposta.status_code == 200:
            dados = resposta.json()
            print("✅ Dados em tempo real obtidos com sucesso da FIFA!")
        else:
            print(f"⚠️ API da FIFA retornou status {resposta.status_code}. Usando fallback local...")
    except Exception as e:
        print(f"⚠️ Falha ao conectar na API da FIFA ({e}). Usando plano B (JSON local)...")

    # 2. PLANO B: SE A INTERNET FALHAR, USA O ARQUIVO LOCAL
    if dados is None:
        if not os.path.exists(caminho_json_local):
            print(f"❌ Erro crítico: Arquivo local {caminho_json_local} também não foi encontrado!")
            return
        with open(caminho_json_local, "r", encoding="utf-8") as f:
            dados = json.load(f)
        print("📦 Dados carregados a partir do arquivo local de segurança.")
        
    jogos = dados.get("Results", [])
    print(f"📊 Processando {len(jogos)} partidas no banco de dados...")

    conexao = conectar_banco()
    cursor = conexao.cursor()

    query_upsert = """
        INSERT INTO partidas 
        (id_match, numero_jogo, data_jogo, time_casa, time_fora, gols_casa, gols_fora, fase, estadio, cidade, status_jogo)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (id_match) 
        DO UPDATE SET
            gols_casa = EXCLUDED.gols_casa,
            gols_fora = EXCLUDED.gols_fora,
            status_jogo = EXCLUDED.status_jogo,
            time_casa = EXCLUDED.time_casa,
            time_fora = EXCLUDED.time_fora,
            fase = EXCLUDED.fase;
    """

    jogos_inseridos = 0

    for jogo in jogos:
        id_match = str(jogo.get("IdMatch"))
        numero_jogo = jogo.get("MatchNumber")
        
        data_str = jogo.get("Date")
        data_formatada = datetime.strptime(data_str, "%Y-%m-%dT%H:%M:%SZ") if data_str else None

        # --- TRATAMENTO DOS TIMES ---
        time_casa = "Desconhecido"
        if jogo.get("Home") and isinstance(jogo["Home"], dict):
            nomes_casa = jogo["Home"].get("Name", [])
            if nomes_casa and isinstance(nomes_casa, list):
                time_casa = nomes_casa[0].get("Description", "Desconhecido")
            if time_casa == "Desconhecido":
                time_casa = jogo["Home"].get("Abbreviation", jogo.get("PlaceHolderA", "A definir"))
        else:
            time_casa = jogo.get("PlaceHolderA", "A definir")

        time_fora = "Desconhecido"
        if jogo.get("Away") and isinstance(jogo["Away"], dict):
            nomes_fora = jogo["Away"].get("Name", [])
            if nomes_fora and isinstance(nomes_fora, list):
                time_fora = nomes_fora[0].get("Description", "Desconhecido")
            if time_fora == "Desconhecido":
                time_fora = jogo["Away"].get("Abbreviation", jogo.get("PlaceHolderB", "A definir"))
        else:
            time_fora = jogo.get("PlaceHolderB", "A definir")

        status_jogo = str(jogo.get("MatchStatus", "1"))

        # CORREÇÃO: Se o jogo não começou ('1'), mantém os gols como nulos no banco
        if status_jogo == "1":
            gols_casa = None
            gols_fora = None
        else:
            gols_casa = jogo.get("HomeTeamScore")
            gols_fora = jogo.get("AwayTeamScore")
            if gols_casa is None: gols_casa = 0
            if gols_fora is None: gols_fora = 0

        # --- FASE DO JOGO ---
        fase = "Fase Desconhecida"
        fases = jogo.get("StageName", [])
        if fases and isinstance(fases, list):
            fase = fases[0].get("Description", "Fase Desconhecida")
        
        if "Group" not in fase and jogo.get("GroupName"):
            grupos_lista = jogo.get("GroupName", [])
            if grupos_lista:
                fase = f"First Stage - {grupos_lista[0].get('Description', '')}"

        stadium_info = jogo.get("Stadium", {})
        estadios = stadium_info.get("Name", [])
        estadio = estadios[0].get("Description") if estadios else "Não definido"
        
        cidades = stadium_info.get("CityName", [])
        cidade = cidades[0].get("Description") if cidades else "Não definida"

        dados_partida = (id_match, numero_jogo, data_formatada, time_casa, time_fora, gols_casa, gols_fora, fase, estadio, cidade, status_jogo)
        
        try:
            cursor.execute(query_upsert, dados_partida)
            jogos_inseridos += 1
        except Exception as e:
            print(f"⚠️ Erro ao inserir o jogo número {numero_jogo}: {e}")
            conexao.rollback()
            continue

    conexao.commit()
    cursor.close()
    conexao.close()
    
    print(f"✅ Sucesso! {jogos_inseridos} jogos foram atualizados com os dados oficiais!")

if __name__ == "__main__":
    carregar_e_salvar_jogos()