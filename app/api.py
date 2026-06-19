from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2

app = FastAPI()

# ATENÇÃO: Garante que o CORS está liberado para o seu index.html não travar!
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/placar")
def obter_placar():
    try:
        conexao = psycopg2.connect(
            dbname="meu_banco",
            user="postgres",
            password="senha_secreta",
            host="banco_pitchpulse",
            port="5432"
        )
        cursor = conexao.cursor()
        
        # Buscando TODAS as novas colunas no banco
        cursor.execute("""
            SELECT time_casa, time_fora, gols_casa, gols_fora, status_jogo, ultimo_lance,
                   escanteios_casa, escanteios_fora, faltas_casa, faltas_fora,
                   cartoes_amarelos_casa, cartoes_amarelos_fora, cartoes_vermelhos_casa, cartoes_vermelhos_fora,
                   detalhes_gols
            FROM placar_futebol 
            ORDER BY id DESC LIMIT 1;
        """)
        resultado = cursor.fetchone()
        
        cursor.close()
        conexao.close()
        
        if resultado:
            return {
                "time_casa": resultado[0],
                "time_fora": resultado[1],
                "gols_casa": resultado[2],
                "gols_fora": resultado[3],
                "status_jogo": resultado[4],
                "ultimo_lance": resultado[5],
                "escanteios_casa": resultado[6],
                "escanteios_fora": resultado[7],
                "faltas_casa": resultado[8],
                "faltas_fora": resultado[9],
                "cartoes_amarelos_casa": resultado[10],
                "cartoes_amarelos_fora": resultado[11],
                "cartoes_vermelhos_casa": resultado[12],
                "cartoes_vermelhos_fora": resultado[13],
                "detalhes_gols": resultado[14]
            }
        return {"erro": "Nenhum dado encontrado no banco."}
    except Exception as e:
        return {"erro": f"Erro de banco: {str(e)}"}