import requests

# 🎯 Agora sim! Usando o ID real do jogo: 760433
ID_JOGO = "760433"
URL_API = f"https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event={ID_JOGO}"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

print(f"🌐 Conectando à API de Esportes da ESPN para o jogo ID {ID_JOGO}...")
resposta = requests.get(URL_API, headers=headers)

if resposta.status_code == 200:
    dados = resposta.json()
    
    # 1. Extraindo informações do cabeçalho do jogo
    header = dados.get("header", {})
    competicao = header.get("competitions", [{}])[0]
    
    # Tempo de jogo e período (ex: 87', Fim de Jogo, etc.)
    status_texto = competicao.get("status", {}).get("type", {}).get("detail", "Em andamento")
    
    # 2. Extraindo os times e o placar real
    competidores = competicao.get("competitors", [])
    
    print("\n📊 ==========================================")
    print("      PITCHPULSE - DADOS REAIS DA ESPN")
    print("==============================================")
    print(f"⏱️ Status/Tempo: {status_texto}")
    print("----------------------------------------------")
    
    for time in competidores:
        nome_time = time.get("team", {}).get("displayName")
        gols = time.get("score", "0")
        home_away = "Casa" if time.get("homeAway") == "home" else "Fora"
        print(f"⚽ {nome_time} ({home_away}): {gols}")
        
    print("----------------------------------------------")
    
    # 3. Extraindo a última jogada/comentário (se houver)
    # Na API de partida, os comentários ficam em 'commentary' ou 'plays'
    comentarios = dados.get("commentary", [])
    if comentarios:
        ultimo_comentario = comentarios[0].get("text", "")
        print(f"📢 Último Lance: {ultimo_comentario}")
    else:
        # Alternativa caso esteja na estrutura de 'plays'
        lances = dados.get("plays", [])
        if lances:
            print(f"📢 Último Lance: {lances[-1].get('text', '')}")
        else:
            print("📢 Último Lance: Partida sendo atualizada pelos sistemas centrais.")
            
    print("==============================================")

else:
    print(f"❌ Falha crítica ao acessar a API. Status: {resposta.status_code}")