import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from psycopg2.extras import RealDictCursor

# Inicializa o app apenas UMA vez com o título correto
app = FastAPI(title="PitchPulse API", version="1.0.0")

# Configura o CORS corretamente (apenas um bloco)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite que o Live Server (porta 5500) aceda à API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daqui para baixo continua o seu código normal...
def obter_conexao_banco():
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST", "banco_pitchpulse"),
            database=os.getenv("DB_NAME", "placar_futebol"),
            user=os.getenv("DB_USER", "postgres"),
            password=os.getenv("DB_PASSWORD", "postgres_password")
        )
        return conn
    except Exception as e:
        print(f"❌ [API] Erro ao conectar no PostgreSQL: {e}")
        return None

@app.get("/")
def raiz():
    return {"status": "Online", "projeto": "PitchPulse API", "pedrinho_status": "Pé-quente 👣"}

@app.get("/partidas")
def listar_partidas():
    conn = obter_conexao_banco()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro interno ao conectar ao banco de dados.")
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT 
                p.id_match, 
                p.status, 
                p.gols_casa, 
                p.gols_fora,
                p.grupo_nome,
                t_casa.nome as casa_nome,
                t_casa.emoji as casa_emoji,
                t_fora.nome as fora_nome,
                t_fora.emoji as fora_emoji
            FROM partidas p
            JOIN times t_casa ON p.id_casa = t_casa.id_time
            JOIN times t_fora ON p.id_fora = t_fora.id_time
            ORDER BY p.id_match ASC;
        """)
        partidas = cursor.fetchall()
        cursor.close()
        conn.close()
        return {"total_partidas": len(partidas), "partidas": partidas}
    except Exception as e:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/grupos")
def obter_classificacao_grupos():
    conn = obter_conexao_banco()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco.")
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
    
        cursor.execute("SELECT id_time, nome, grupo, emoji FROM times;")
        todos_times = cursor.fetchall()
        
        grupos = {}
        mapeamento_nomes = {}
        
        for t in todos_times:
            # Mantendo a lógica de exibição customizada das bandeiras e sufixos
            siglas = {"Espanha": "ES", "França": "FR", "Brasil": "BR", "Alemanha": "DE", 
                      "Noruega": "NO", "Japão": "JP", "Uruguai": "UY", "Argentina": "AR", 
                      "Inglaterra": "Inglaterra 🏴\u200d󠁧󠁢󠁥󠁮󠁧󠁿", "Argélia": "DZ", "Itália": "IT", "Marrocos": "MA"}
            
            sufixo = siglas.get(t["nome"], "")
            if t["nome"] == "Inglaterra":
                nome_exibicao = "Inglaterra 🏴\u200d󠁧󠁢󠁥󠁮󠁧󠁿"
            else:
                nome_exibicao = f"{t['nome']} {t['emoji']}".strip()
            
            mapeamento_nomes[t["id_time"]] = nome_exibicao
            nome_grupo = f"Grupo {t['grupo']}"
            
            if nome_grupo not in grupos:
                grupos[nome_grupo] = {}
                
            grupos[nome_grupo][nome_exibicao] = {
                "nome": nome_exibicao, 
                "pontos": 0, 
                "jogos": 0, 
                "gols_pro": 0, 
                "gols_contra": 0, 
                "saldo_gols": 0
            }

        cursor.execute("SELECT id_casa, id_fora, gols_casa, gols_fora, grupo_nome FROM partidas;")
        partidas = cursor.fetchall()
        
        cursor.close()
        conn.close()

        for jogo in partidas:
            if jogo["gols_casa"] is not None and jogo["gols_fora"] is not None:
                nome_grupo = f"Grupo {jogo['grupo_nome']}"
                time_casa = mapeamento_nomes.get(jogo["id_casa"])
                time_fora = mapeamento_nomes.get(jogo["id_fora"])
                
                if not time_casa or not time_fora:
                    continue

                g_casa = jogo["gols_casa"]
                g_fora = jogo["gols_fora"]

                grupos[nome_grupo][time_casa]["jogos"] += 1
                grupos[nome_grupo][time_casa]["gols_pro"] += g_casa
                grupos[nome_grupo][time_casa]["gols_contra"] += g_fora

                grupos[nome_grupo][time_fora]["jogos"] += 1
                grupos[nome_grupo][time_fora]["gols_pro"] += g_fora
                grupos[nome_grupo][time_fora]["gols_contra"] += g_casa

                if g_casa > g_fora:
                    grupos[nome_grupo][time_casa]["pontos"] += 3
                elif g_fora > g_casa:
                    grupos[nome_grupo][time_fora]["pontos"] += 3
                else:
                    grupos[nome_grupo][time_casa]["pontos"] += 1
                    grupos[nome_grupo][time_fora]["pontos"] += 1

        resultado_formatado = {}
        for nome_grupo, times_do_grupo in grupos.items():
            for t in times_do_grupo.values():
                t["saldo_gols"] = t["gols_pro"] - t["gols_contra"]
            
            times_ordenados = sorted(times_do_grupo.values(), key=lambda x: (x["pontos"], x["saldo_gols"]), reverse=True)
            resultado_formatado[nome_grupo] = times_ordenados

        return resultado_formatado

    except Exception as e:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=f"Erro ao processar classificação: {str(e)}")