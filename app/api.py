import os
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException

app = FastAPI(title="PitchPulse API")

def conectar_banco():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "container_banco_pitchpulse"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "senha_secreta"),
        database=os.getenv("DB_NAME", "meu_banco")
    )

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
        
        return partidas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao conectar ao banco de dados: {str(e)}")