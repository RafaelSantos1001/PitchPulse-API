import json
import os
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
    caminho_json = "app/estrutura_copa.json"
    
    if not os.path.exists(caminho_json):
        print(f"❌ Arquivo {caminho_json} não encontrado!")
        return

    with open(caminho_json, "r", encoding="utf-8") as f:
        dados = json.load(f)
        
    jogos = dados.get("Results", [])
    print(f"📊 Processando {len(jogos)} partidas encontradas no arquivo...")

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
            time_fora = EXCLUDED.time_fora;
    """

    jogos_inseridos = 0

    for jogo in jogos:
        id_match = str(jogo.get("IdMatch"))
        numero_jogo = jogo.get("MatchNumber")
        
        data_str = jogo.get("Date")
        data_formatada = datetime.strptime(data_str, "%Y-%m-%dT%H:%M:%SZ") if data_str else None

        if jogo.get("Home") and isinstance(jogo["Home"], dict):
            nomes_casa = jogo["Home"].get("Name", [])
            time_casa = nomes_casa[0].get("Description") if nomes_casa else "Desconhecido"
        else:
            time_casa = jogo.get("PlaceHolderA", "A definir")

        if jogo.get("Away") and isinstance(jogo["Away"], dict):
            nomes_fora = jogo["Away"].get("Name", [])
            time_fora = nomes_fora[0].get("Description") if nomes_fora else "Desconhecido"
        else:
            time_fora = jogo.get("PlaceHolderB", "A definir")

        gols_casa = jogo.get("HomeTeamScore")
        gols_fora = jogo.get("AwayTeamScore")

        fases = jogo.get("StageName", [])
        fase = fases[0].get("Description") if fases else "Fase Desconhecida"

        stadium_info = jogo.get("Stadium", {})
        estadios = stadium_info.get("Name", [])
        estadio = estadios[0].get("Description") if estadios else "Não definido"
        
        cidades = stadium_info.get("CityName", [])
        cidade = cidades[0].get("Description") if cidades else "Não definida"

        status_jogo = str(jogo.get("MatchStatus", "1"))

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
    
    print(f"✅ Sucesso! {jogos_inseridos} jogos foram salvos/atualizados no banco PostgreSQL!")

if __name__ == "__main__":
    carregar_e_salvar_jogos()