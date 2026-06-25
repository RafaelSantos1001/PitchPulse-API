import requests

url = "https://api.fifa.com/api/v3/calendar/matches?language=en&count=500&idSeason=285023"
try:
    print("🌐 Baixando dados completos da FIFA...")
    res = requests.get(url, timeout=10).json()
    jogos_alvo = [41, 42, 43, 44, 45, 46, 47]
    
    print("\n📊 --- STATUS DOS JOGOS RECENTES NA API ---")
    encontrados = 0
    for j in res.get("Results", []):
        num = j.get("MatchNumber")
        if num in jogos_alvo:
            encontrados += 1
            casa = j.get("Home", {}).get("Abbreviation", "???")
            fora = j.get("Away", {}).get("Abbreviation", "???")
            status = j.get("MatchStatus")
            g_casa = j.get("HomeTeamScore")
            g_fora = j.get("AwayTeamScore")
            
            status_txt = "Finalizado (0)" if status == 0 else "Ao Vivo (3)" if status == 3 else "Agendado (1)"
            
            print(f"Jogo {num} [{casa} x {fora}]: Status={status_txt} | Placar na API={g_casa}x{g_fora}")
            
    if encontrados == 0:
        print("⚠️ Nenhum dos jogos da rodada foi localizado no JSON.")
except Exception as e:
    print(f"❌ Erro ao analisar a API: {e}")