import time
import requests
import psycopg2

# ID do jogo ao vivo da Áustria vs Jordânia (Mapeado corretamente com ponto)
LEAGUE = "fifa.worldcup"  # Exemplo de liga, ajuste conforme necessário
JOGO_ID = "760437"
URL_ESPN = f"https://site.api.espn.com/apis/site/v2/sports/soccer/{LEAGUE}/summary?event={JOGO_ID}"

def conectar_banco():
    return psycopg2.connect(
        dbname="meu_banco",
        user="postgres",
        password="senha_secreta",
        host="banco_pitchpulse",
        port="5432"
    )

def buscar_dados_espn():
    try:
        resposta = requests.get(URL_ESPN, timeout=10)
        if resposta.status_code != 200:
            print(f"⚠️ ESPN retornou status {resposta.status_code}")
            return None
            
        dados = response_json = resposta.json()
        
        # Garante a captura segura do cabeçalho do jogo
        header = dados.get('header', {})
        competitions = header.get('competitions', [{}])
        if not competitions:
            print("⚠️ Nenhuma competição encontrada no JSON.")
            return None
            
        competitions = competitions[0]
        competidores = competitions.get('competitors', [])
        
        if len(competidores) < 2:
            print("⚠️ Menos de 2 competidores encontrados.")
            return None
            
        # Identificação robusta de casa/fora
        casa = competidores[0] if competidores[0].get('homeAway') == 'home' else competidores[1]
        fora = competidores[1] if competidores[0].get('homeAway') == 'home' else competidores[0]
        
        time_casa = casa.get('team', {}).get('displayName', 'Casa')
        time_fora = fora.get('team', {}).get('displayName', 'Fora')
        gols_casa = int(casa.get('score', 0))
        gols_fora = int(fora.get('score', 0))
        status_jogo = competitions.get('status', {}).get('type', {}).get('detail', "FT")
        
        # Captura de lances e gols
        key_events = dados.get('keyEvents', [])
        ultimo_lance = key_events[0].get('text', 'Partida encerrada.') if key_events else 'Fim da partida.'
        
        # Inicializa as variáveis de estatísticas
        escanteios_c, escanteios_f = 0, 0
        faltas_c, faltas_f = 0, 0
        amarelos_c, amarelos_f = 0, 0
        vermelhos_c, vermelhos_f = 0, 0
        
        # Coleta das estatísticas estruturadas
        statistics = []
        boxscore = dados.get('boxscore', {})
        
        # Tenta a rota 1: boxscore global
        if boxscore and boxscore.get('statistics'):
            statistics = boxscore.get('statistics', [])
            
        # Tenta a rota 2: estatísticas diretas por competidor
        if not statistics:
            for comp in competidores:
                for stat_item in comp.get('statistics', []):
                    name_stat = stat_item.get('name')
                    val_stat = stat_item.get('displayValue') or str(stat_item.get('value', '0'))
                    
                    found = False
                    for existing in statistics:
                        if existing.get('name') == name_stat:
                            if comp.get('homeAway') == 'home':
                                existing['stats'][0] = val_stat
                            else:
                                existing['stats'][1] = val_stat
                            found = True
                            break
                    
                    if not found:
                        statistics.append({
                            'name': name_stat,
                            'stats': [val_stat, '0'] if comp.get('homeAway') == 'home' else ['0', val_stat]
                        })

        # Processamento seguro dos valores coletados
        for stat in statistics:
            name = stat.get('name', '')
            stats_values = stat.get('stats', ['0', '0'])
            
            clean_c = ''.join(filter(str.isdigit, str(stats_values[0])))
            clean_f = ''.join(filter(str.isdigit, str(stats_values[1])))
            
            val_c = int(clean_c) if clean_c else 0
            val_f = int(clean_f) if clean_f else 0
            
            n_low = name.lower()
            if n_low in ['corners', 'cornerkicks', 'corner_kicks', 'escanteios']:
                escanteios_c += val_c
                escanteios_f += val_f
            elif n_low in ['foulscommitted', 'fouls', 'faltas']:
                faltas_c += val_c
                faltas_f += val_f
            elif n_low in ['yellowcards', 'yellow_cards', 'cartoes_amarelos']:
                amarelos_c += val_c
                amarelos_f += val_f
            elif n_low in ['redcards', 'red_cards', 'cartoes_vermelhos']:
                vermelhos_c += val_c
                vermelhos_f += val_f

        # Monta os detalhes dos gols
        lista_gols = []
        for event in key_events:
            if event.get('type', {}).get('text') == 'Goal':
                tempo = event.get('clock', {}).get('displayValue', "0'")
                jogador = event.get('text', '').split(' - ')[0]
                lista_gols.append(f"⚽ {jogador} ({tempo})")
        
        detalhes_gols = " | ".join(lista_gols) if lista_gols else "Nenhum gol listado."

        return {
            "time_casa": time_casa, "time_fora": time_fora,
            "gols_casa": gols_casa, "gols_fora": gols_fora,
            "status_jogo": status_jogo, "ultimo_lance": ultimo_lance,
            "escanteios_casa": escanteios_c, "escanteios_fora": escanteios_f,
            "faltas_casa": faltas_c, "faltas_fora": faltas_f,
            "cartoes_amarelos_casa": amarelos_c, "cartoes_amarelos_fora": amarelos_f,
            "cartoes_vermelhos_casa": vermelhos_c, "cartoes_vermelhos_fora": vermelhos_f,
            "detalhes_gols": detalhes_gols
        }
    except Exception as e:
        print(f"❌ Erro crítico no parseamento da ESPN: {e}")
    return None

# Loop de Execução Principal (Seu bloco que chama a gravação no banco)
if __name__ == "__main__":
    print(f"🔄 Scraper iniciado para o jogo {JOGO_ID}...")
    while True:
        dados_partida = buscar_dados_espn()
        if dados_partida:
            try:
                conexao = conectar_banco()
                cursor = conexao.cursor()
                
                # Query para atualizar ou inserir mantendo o banco atualizado
                query = """
                INSERT INTO placar_futebol (
                    time_casa, time_fora, gols_casa, gols_fora, status_jogo, ultimo_lance,
                    escanteios_casa, escanteios_fora, faltas_casa, faltas_fora,
                    cartoes_amarelos_casa, cartoes_amarelos_fora, cartoes_vermelhos_casa, cartoes_vermelhos_fora, detalhes_gols
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """
                cursor.execute(query, (
                    dados_partida["time_casa"], dados_partida["time_fora"],
                    dados_partida["gols_casa"], dados_partida["gols_fora"],
                    dados_partida["status_jogo"], dados_partida["ultimo_lance"],
                    dados_partida["escanteios_casa"], dados_partida["escanteios_fora"],
                    dados_partida["faltas_casa"], dados_partida["faltas_fora"],
                    dados_partida["cartoes_amarelos_casa"], dados_partida["cartoes_amarelos_fora"],
                    dados_partida["cartoes_vermelhos_casa"], dados_partida["cartoes_vermelhos_fora"],
                    dados_partida["detalhes_gols"]
                ))
                conexao.commit()
                cursor.close()
                conexao.close()
                print("💾 Dados salvos com sucesso no Banco!")
            except Exception as e:
                print(f"❌ Erro ao salvar dados no Banco: {e}")
        
        print("💤 Aguardando 30 segundos para a próxima checagem...")
        time.sleep(30)