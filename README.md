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
- [x] **Mecanismo de Injeção em Lote:** Otimização do pipeline do Scraper utilizando `execute_batch` do `psycopg2`, reduzindo drasticamente o consumo de CPU e conexões simultâneas (Carga inicial de 104 jogos concluída com sucesso).
- [x] **Estrutura Dinâmica:** Adaptação do modelo relacional para aceitar os identificadores únicos textuais (`id_match` como `VARCHAR`) do calendário oficial FIFA.

### 🎯 Fase 3: Próxima Meta — Interface SPA Baseada em Abas (Foco em UX)
O objetivo agora é remodelar o Dashboard Frontend para consumir os novos endpoints de forma inteligente, transformando-o em uma aplicação de página única (SPA) dividida em três abas:
- [ ] **🔴 Aba Principal: Ao Vivo** — Exibição imediata de partidas com status ativo. Caso não haja jogos no momento, exibição de um estado amigável (*Empty State*) direcionando para o calendário.
- [ ] **📊 Aba Grupos** — Classificação automatizada e dinâmica de A a H com tabelas ordenadas por Pontos, Saldo de Gols, Gols Pró e Confronto Direto puxados da API.
- [ ] **🗓️ Aba Confrontos** — Calendário completo mapeando a jornada de todas as seleções.

---

## 🛠️ Como Executar o Ecossistema

Certifique-se de ter o **Docker** e o **Docker Compose** instalados na sua máquina.

### 1. Inicialização Limpa (Resetando Volumes)
Para garantir que o banco de dados aplique as tabelas estruturais corretas da FIFA sem conflitos de memória residual:
```bash
docker-compose down -v
docker-compose up --build