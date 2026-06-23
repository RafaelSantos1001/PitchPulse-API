import requests
import json

# A URL da API oculta que você pescou no F12!
URL_API = "https://api.fifa.com/api/v3/calendar/matches?language=en&count=500&idSeason=285023"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, gecu Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json"
}

def analisar_api_fifa():
    print("🕵️‍♂️ Conectando diretamente à API oficial da FIFA...")
    try:
        resposta = requests.get(URL_API, headers=headers, timeout=10)
        
        if resposta.status_code == 200:
            dados = resposta.json()
            print("✅ GOLAÇO! Resposta recebida com sucesso da API!")
            
            # Vamos salvar o JSON completo na sua pasta app/ para estudarmos os campos
            with open("app/estrutura_copa.json", "w", encoding="utf-8") as f:
                json.dump(dados, f, indent=4, ensure_ascii=False)
            print("💾 O JSON estruturado foi salvo em 'app/estrutura_copa.json'!")
            
            # Verificando as chaves principais do dicionário retornado
            if isinstance(dados, dict):
                print(f"\nChaves principais do JSON: {list(dados.keys())}")
                
                # Se a chave clássica 'Results' estiver no topo, vamos ver quantos jogos vieram
                if "Results" in dados:
                    total_jogos = len(dados["Results"])
                    print(f"📊 Total de partidas encontradas nesse payload: {total_jogos}")
                    
                    if total_jogos > 0:
                        print("\n🔍 Analisando a estrutura do primeiro jogo:")
                        primeiro_jogo = dados["Results"][0]
                        # Printa as chaves de dentro de um jogo para sabermos onde ficam os gols e os times
                        print(f"Campos disponíveis no objeto do jogo: {list(primeiro_jogo.keys())}")
            else:
                print(f"⚠️ O formato retornado é uma lista com {len(dados)} elementos.")
                
        else:
            print(f"❌ Erro de comunicação com a API da FIFA. Status: {resposta.status_code}")
            
    except Exception as e:
        print(f"❌ Falha ao processar a requisição: {e}")

if __name__ == "__main__":
    analisar_api_fifa()