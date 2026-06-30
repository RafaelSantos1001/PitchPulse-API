# ⚽ PitchPulse API — Guia Inteligente da Copa do Mundo 2026

O **PitchPulse** é um ecossistema completo focado no monitoramento e exibição de dados em tempo real da Copa do Mundo FIFA 2026. A aplicação utiliza uma arquitetura moderna baseada em contêineres para realizar raspagem cirúrgica de dados, armazenamento estruturado e distribuição simplificada via API.

---

## 🚀 Status do Projeto & Roadmap de Desenvolvimento

O projeto foi dividido estrategicamente em fases para garantir escalabilidade, performance e consistência dos dados históricos do portfólio.

### 📍 Fase 1: Prova de Conceito (Concluída)
- [x] Criação da infraestrutura básica isolada com Docker Compose (API, Scraper e Banco).
- [x] Comunicação estável e evasão de bloqueios anti-bot (`CloudScraper`) no coletor Python.
- [x] Integração de regras de CORS e disponibilização dos primeiros endpoints de teste.

### 📍 Fase 2: Arquitetura Limpa & Alta Performance (Concluída)
- [x] **Banco de Dados Isolado:** Migração completa da DDL para o script nativo `database/init.sql`, permitindo inicialização pura via `/docker-entrypoint-initdb.d`.
- [x] **Tratamento de Payload Complexo:** Implementação de parsing cirúrgico para as estruturas multinacionais e dicionários de tradução nativos da API da FIFA (`GroupName`, `TeamName`).
- [x] **Mecanismo de Injeção em Lote:** Otimização do pipeline do Scraper utilizando `execute_batch` do `psycopg2`, reduzindo drasticamente o consumo de CPU e conexões simultâneas.
- [x] **Estrutura Dinâmica:** Adaptação do modelo relacional para aceitar os identificadores únicos textuais (`id_match` como `VARCHAR`) do calendário oficial FIFA.

### 📍 Fase 3: Interface SPA Baseada em Abas (Concluída)
- [x] **🔴 Aba Principal: Ao Vivo** — Exibição imediata de partidas com status ativo e implementação de *Empty State* amigável quando não há jogos no momento.
- [x] **📊 Aba Grupos** — Classificação automatizada, modular e dinâmica de A a H com tabelas ordenadas por Pontos, Saldo de Gols e Gols Pró consumidos da API.
- [x] **🗓️ Aba Confrontos** — Calendário completo em formato de cards mapeando a jornada de todas as seleções.

### 🎯 Fase 4: Próxima Meta — Sincronização do Cronômetro em Tempo Real
- [ ] **⏱️ Relógio Integrado:** Mapeamento do campo `MatchTime` da FIFA através do pipeline completo (Scraper -> Banco -> API -> Frontend) para exibir os minutos exatos das partidas ao vivo.

---

## 🛠️ Como Executar o Ecossistema

Certifique-se de ter o **Docker** e o **Docker Compose** instalados na sua máquina.

### 1. Inicialização Limpa (Resetando Volumes)
Para garantir que o banco de dados aplique as tabelas estruturais corretas da FIFA sem conflitos de memória residual:
```bash
docker-compose down -v
docker-compose up --build