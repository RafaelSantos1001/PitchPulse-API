import psycopg2
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:postgres_password@localhost:5432/placar_futebol"
)

def carregar_dados_iniciais():
    print("🚀 Iniciando a carga de dados profissional no PitchPulse...")
    conexao = None
    
    try:
        conexao = psycopg2.connect(DATABASE_URL)
        cursor = conexao.cursor()

        jogos_passados = [
            ('Canadá', 'Catar', 6, 0, 'FIN'),
            ('Suíça', 'Bósnia', 4, 1, 'FIN'),
            ('Chéquia', 'África do Sul', 1, 1, 'FIN')
        ]

        print("-> Inserindo histórico de partidas passadas...")
        for casa, fora, g_casa, g_fora, status in jogos_passados:
            cursor.execute("""
                INSERT INTO placar_futebol (time_casa, time_fora, gols_casa, gols_fora, status)
                VALUES (%s, %s, %s, %s, %s);
            """, (casa, fora, g_casa, g_fora, status))

        dados_grupos = [
            ('A', 'Canadá', 3, 1, 1, 0, 0, 6, 0, 6),
            ('A', 'Catar', 0, 1, 0, 0, 1, 0, 6, -6),
            ('B', 'Suíça', 3, 1, 1, 0, 0, 4, 1, 3),
            ('B', 'Bósnia', 0, 1, 0, 0, 1, 1, 4, -3),
            ('C', 'Chéquia', 1, 1, 0, 1, 0, 1, 1, 0),
            ('C', 'África do Sul', 1, 1, 0, 1, 0, 1, 1, 0),
        ]

        print("-> Atualizando tabela de classificação dos grupos...")
        for grupo, time, pts, j, v, e, d, gp, gc, sg in dados_grupos:
            cursor.execute("""
                INSERT INTO classificacao_grupos (grupo, time_nome, pontos, jogos, vitorias, empates, derrotas, gols_pro, gols_contra, saldo_gols)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            """, (grupo, time, pts, j, v, e, d, gp, gc, sg))

        conexao.commit()
        print("✅ Dados iniciais injetados com sucesso!")

    except Exception as e:
        print(f"❌ Falha ao injetar dados: {e}")
    finally:
        if conexao:
            cursor.close()
            conexao.close()

if __name__ == "__main__":
    carregar_dados_iniciais()