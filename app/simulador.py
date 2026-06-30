import os
import time
import random
import psycopg2

def conectar_banco():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"), # 'banco_pitchpulse' se dentro do docker
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres_password"),
        database=os.getenv("DB_NAME", "placar_futebol")
    )

def simular_partidas():
    print("🚀 Simulador de Jogos Ao Vivo Iniciado...")
    conexao = conectar_banco()
    cursor = conexao.cursor()

    # Adaptação para a tabela da Fase 2 (partidas)
    try:
        cursor.execute("UPDATE partidas SET gols_casa = 0, gols_fora = 0, status_jogo = '0';")
        conexao.commit()

        cursor.execute("SELECT id_match FROM partidas ORDER BY RANDOM() LIMIT 3;")
        jogos_ao_vivo = [row[0] for row in cursor.fetchall()]
        
        for id_match in jogos_ao_vivo:
            cursor.execute("UPDATE partidas SET status_jogo = '1' WHERE id_match = %s;", (id_match,))
        conexao.commit()
        print(f"⚽ Partidas selecionadas para o Ao Vivo: {jogos_ao_vivo}")

        while True:
            jogo_sorteado = random.choice(jogos_ao_vivo)
            quem_marca = random.choice(['gols_casa', 'gols_fora'])

            query = f"UPDATE partidas SET {quem_marca} = {quem_marca} + 1 WHERE id_match = %s;"
            cursor.execute(query, (jogo_sorteado,))
            conexao.commit()
            
            print(f"🔥 GOOOOL! Atualizado jogo {jogo_sorteado} -> +1 para {quem_marca}")
            time.sleep(10)
            
    except Exception as e:
        print(f"❌ Erro no simulador: {e}")
    finally:
        cursor.close()
        conexao.close()

if __name__ == "__main__":
    simular_partidas()