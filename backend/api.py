import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI(title="PitchPulse API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco de dados")
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT id_match, status, gols_casa, gols_fora, grupo_nome, 
                   casa_nome, casa_emoji, fora_nome, fora_emoji, tempo_jogo,
                   data_jogo, estadio_nome, fase_nome, numero_jogo
            FROM partidas 
            ORDER BY numero_jogo ASC NULLS LAST, id_match ASC;
        """)
        partidas = cursor.fetchall()
        cursor.close()
        conn.close()
        return partidas
    except Exception as e:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=f"Erro ao buscar partidas: {str(e)}")

@app.get("/classificacao")
def obter_classificacao():
    conn = obter_conexao_banco()
    if not conn:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco de dados")
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("SELECT * FROM partidas;")
        jogos = cursor.fetchall()
        cursor.close()
        conn.close()

        # Processamento dinâmico dos grupos baseado nos jogos reais do banco
        grupos = {}
        for jogo in jogos:
            nome_grupo = jogo["grupo_nome"] or "Outros"
            if nome_grupo not in grupos:
                grupos[nome_grupo] = {}

            for time_prefixo in ["casa", "fora"]:
                nome_time = jogo[f"{time_prefixo}_nome"]
                emoji_time = jogo[f"{time_prefixo}_emoji"]
                
                if nome_time not in grupos[nome_grupo]:
                    grupos[nome_grupo][nome_time] = {
                        "time_nome": nome_time,
                        "time_emoji": emoji_time,
                        "pontos": 0, "jogos": 0, "vitorias": 0, "empates": 0, "derrotas": 0,
                        "gols_pro": 0, "gols_contra": 0, "saldo_gols": 0
                    }

            if jogo["status"] == "FIN" or jogo["status"] == "3":
                g_casa = jogo["gols_casa"] or 0
                g_fora = jogo["gols_fora"] or 0
                t_casa = jogo["casa_nome"]
                t_fora = jogo["fora_nome"]

                grupos[nome_grupo][t_casa]["jogos"] += 1
                grupos[nome_grupo][t_casa]["gols_pro"] += g_casa
                grupos[nome_grupo][t_casa]["gols_contra"] += g_fora

                grupos[nome_grupo][t_fora]["jogos"] += 1
                grupos[nome_grupo][t_fora]["gols_pro"] += g_fora
                grupos[nome_grupo][t_fora]["gols_contra"] += g_casa

                if g_casa > g_fora:
                    grupos[nome_grupo][t_casa]["pontos"] += 3
                    grupos[nome_grupo][t_casa]["vitorias"] += 1
                    grupos[nome_grupo][t_fora]["derrotas"] += 1
                elif g_fora > g_casa:
                    grupos[nome_grupo][t_fora]["pontos"] += 3
                    grupos[nome_grupo][t_fora]["vitorias"] += 1
                    grupos[nome_grupo][t_casa]["derrotas"] += 1
                else:
                    grupos[nome_grupo][t_casa]["pontos"] += 1
                    grupos[nome_grupo][t_fora]["pontos"] += 1
                    grupos[nome_grupo][t_casa]["empates"] += 1
                    grupos[nome_grupo][t_fora]["empates"] += 1

        resultado_formatado = {}
        for nome_grupo, times_do_grupo in grupos.items():
            for t in times_do_grupo.values():
                t["saldo_gols"] = t["gols_pro"] - t["gols_contra"]
            
            times_ordenados = sorted(
                times_do_grupo.values(), 
                key=lambda x: (x["pontos"], x["saldo_gols"], x["gols_pro"]), 
                reverse=True
            )
            resultado_formatado[nome_grupo] = times_ordenados

        return resultado_formatado
    except Exception as e:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=f"Erro ao processar classificação: {str(e)}")