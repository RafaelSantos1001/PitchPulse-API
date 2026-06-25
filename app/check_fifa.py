import cloudscraper

url = "https://api.fifa.com/api/v3/calendar/matches?language=en&count=500&idSeason=285023"

try:
    print("🌐 Tentando furar o bloqueio com o CloudScraper...")
    
    scraper = cloudscraper.create_scraper()
    resposta = scraper.get(url, timeout=15)
    
    print(f"📡 Status Code do Servidor: {resposta.status_code}")
    
    res = resposta.json()
    jogos_alvo = [41, 42, 43, 44]
    
    print("\n📊 --- STATUS DOS JOGOS RECENTES NA API ---")
    for j in res.get("Results", []):
        num = j.get("MatchNumber")
        if num in jogos_alvo:
            casa = j.get("Home", {}).get("Abbreviation", "???")
            fora = j.get("Away", {}).get("Abbreviation", "???")
            status = j.get("MatchStatus")
            g_casa = j.get("HomeTeamScore")
            g_fora = j.get("AwayTeamScore")
            
            status_txt = "Finalizado (0)" if status == 0 else "Ao Vivo (3)" if status == 3 else "Agendado (1)"
            print(f"Jogo {num} [{casa} x {fora}]: Status={status_txt} | Placar={g_casa}x{g_fora}")
            
except Exception as e:
    print(f"❌ Erro ao analisar a API: {e}")