import os
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict

app = FastAPI(title="PitchPulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def conectar_banco():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "container_banco_pitchpulse"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "senha_secreta"),
        database=os.getenv("DB_NAME", "meu_banco")
    )


PLACARES_REAIS = {
    "NOR-SEN": {"gols_casa": 2, "gols_fora": 1, "status": "0"}, # Noruega 2 x 1 Senegal
    "FRA-IRQ": {"gols_casa": 3, "gols_fora": 0, "status": "0"}, # França 3 x 0 Iraque
    "ARG-AUT": {"gols_casa": 1, "gols_fora": 2, "status": "0"}, # Argentina 1 x 2 Áustria
    "JOR-ALG": {"gols_casa": 1, "gols_fora": 1, "status": "0"}, # Jordânia 1 x 1 Argélia
}

@app.get("/")
def raiz():
    return {"status": "PitchPulse API rodando com sucesso!"}

@app.get("/partidas")
def listar_partidas():
    try:
        conexao = conectar_banco()
        cursor = conexao.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT id_match, numero_jogo, data_jogo, time_casa, time_fora, 
                   gols_casa, gols_fora, fase, estadio, cidade, status_jogo 
            FROM partidas 
            ORDER BY numero_jogo ASC;
        """)
        partidas = cursor.fetchall()
        cursor.close()
        conexao.close()
        
        for jogo in partidas:
            casa = jogo["time_casa"]
            fora = jogo["time_fora"]
            chave_jogo = f"{casa}-{fora}"
            
            
            if chave_jogo in PLACARES_REAIS:
                jogo["gols_casa"] = PLACARES_REAIS[chave_jogo]["gols_casa"]
                jogo["gols_fora"] = PLACARES_REAIS[chave_jogo]["gols_fora"]
                jogo["status_jogo"] = PLACARES_REAIS[chave_jogo]["status"]

            status = str(jogo["status_jogo"])
            
            if status == "0":
                jogo["status_texto"] = "FT"
            elif status == "3":
                jogo["status_texto"] = "AO VIVO"
            else:
                if jogo["data_jogo"]:
                    dt = jogo["data_jogo"]
                    jogo["status_texto"] = dt.strftime("%d/%m às %H:%M")
                else:
                    jogo["status_texto"] = "A definir"
                    
            # Trata exibição visual de jogos futuros não forçados no painel
            if status == "1" and chave_jogo not in PLACARES_REAIS:
                jogo["gols_casa"] = ""
                jogo["gols_fora"] = ""
                jogo["divisor"] = "vs"
            else:
                jogo["divisor"] = "x"
                
        return partidas
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/classificacao")
def obtener_classificacao():
    try:
        conexao = conectar_banco()
        cursor = conexao.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT id_match, numero_jogo, time_casa, time_fora, gols_casa, gols_fora, fase, status_jogo 
            FROM partidas 
            WHERE (fase ILIKE '%Stage%' OR fase ILIKE '%Grupo%' OR fase ILIKE '%First%');
        """)
        jogos = cursor.fetchall()
        cursor.close()
        conexao.close()

        tabela = defaultdict(lambda: {"jogos": 0, "vitorias": 0, "empates": 0, "derrotas": 0, "gp": 0, "gc": 0, "sg": 0, "pontos": 0, "grupo": "Grupo A"})
        jogos_processados = set()

        for jogo in jogos:
            num_jogo = jogo["numero_jogo"]
            if num_jogo in jogos_processados:
                continue
                
            casa = jogo["time_casa"]
            fora = jogo["time_fora"]
            chave_jogo = f"{casa}-{fora}"

            if chave_jogo in PLACARES_REAIS:
                g_casa = PLACARES_REAIS[chave_jogo]["gols_casa"]
                g_fora = PLACARES_REAIS[chave_jogo]["gols_fora"]
                status_efetivo = PLACARES_REAIS[chave_jogo]["status"]
            else:
                g_casa = jogo["gols_casa"]
                g_fora = jogo["gols_fora"]
                status_efetivo = jogo["status_jogo"]

            
            if status_efetivo != "0" or g_casa is None or g_fora is None:
                continue

            if "Desconhecido" in casa or "A definir" in casa or "Placeholder" in casa:
                continue

            jogos_processados.add(num_jogo)

            fase_texto = jogo["fase"]
            grupo_nome = "Fase de Grupos"
            if "Group " in fase_texto:
                grupo_nome = "Grupo " + fase_texto.split("Group ")[1].strip()
            elif "Grupo " in fase_texto:
                grupo_nome = "Grupo " + fase_texto.split("Grupo ")[1].strip()

            tabela[casa]["grupo"] = grupo_nome
            tabela[fora]["grupo"] = grupo_nome

            tabela[casa]["jogos"] += 1
            tabela[fora]["jogos"] += 1
            tabela[casa]["gp"] += g_casa
            tabela[casa]["gc"] += g_fora
            tabela[fora]["gp"] += g_fora
            tabela[fora]["gc"] += g_casa

            if g_casa > g_fora:
                tabela[casa]["vitorias"] += 1
                tabela[casa]["pontos"] += 3
                tabela[fora]["derrotas"] += 1
            elif g_fora > g_casa:
                tabela[fora]["vitorias"] += 1
                tabela[fora]["pontos"] += 3
                tabela[casa]["derrotas"] += 1
            else:
                tabela[casa]["empates"] += 1
                tabela[casa]["pontos"] += 1
                tabela[fora]["empates"] += 1
                tabela[fora]["pontos"] += 1

            tabela[casa]["sg"] = tabela[casa]["gp"] - tabela[casa]["gc"]
            tabela[fora]["sg"] = tabela[fora]["gp"] - tabela[fora]["gc"]

        resultado_final = {}
        for time_nome, dados in tabela.items():
            g = dados["grupo"]
            if g not in resultado_final:
                resultado_final[g] = []
            dados["time"] = time_nome
            resultado_final[g].append(dados)

        for g in resultado_final:
            resultado_final[g] = sorted(resultado_final[g], key=lambda x: (-x["pontos"], -x["sg"], -x["gp"]))

        return resultado_final
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))