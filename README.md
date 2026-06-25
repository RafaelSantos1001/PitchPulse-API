# ⚽ PitchPulse API — O Guia Digital da Copa do Mundo 2026

O **PitchPulse** é um projeto full-stack desenvolvido para resgatar o conceito clássico dos antigos "Guias de Copa do Mundo" de banca de jornal, transformando-os em uma experiência digital interativa. O objetivo principal é exibir o andamento dos grupos, classificação, estatísticas e lances das partidas da Copa do Mundo da FIFA 2026.

Este projeto foi desenhado sob uma arquitetura de microsserviços conteinerizada, garantindo independência entre a coleta de dados, o armazenamento e a entrega das informações para a interface do usuário.

---

## 🛠️ Arquitetura do Sistema

O ecossistema é dividido em três serviços principais gerenciados via **Docker Compose**:

1. **Database (PostgreSQL):** Banco de dados relacional responsável por centralizar e persistir as informações dos jogos, gols, scouts e tabelas de classificação de grupos.
2. **Backend API (FastAPI):** API RESTful de alta performance desenvolvida em Python. Ela é responsável por consultar o banco de dados local e disponibilizar os endpoints de forma rápida e segura para o front-end.
3. **Data Ingestion System (Python Scraper):** Um worker em segundo plano encarregado de buscar dados brutos de partidas externas, tratar inconsistências e alimentar o banco de dados relacional de forma automatizada.

---

## 🚀 Status Atual do Projeto e Roadmap

O desenvolvimento foi dividido estrategicamente para garantir a consistência dos dados do portfólio:

### 🟩 Fase 1: Interface & Estrutura Consolidada (Em Andamento)
- [x] Configuração e conteinerização do ambiente com Docker e Docker Compose.
- [x] Modelagem inicial do banco de dados para dados de partidas (`placar_futebol`).
- [x] Criação das rotas básicas no FastAPI para servir o placar e detalhes dos gols.
- [x] Desenvolvimento da interface web responsiva (HTML/CSS) simulando o painel de jogos.
- [ ] Implementação da tabela de classificação de grupos no banco de dados.
- [ ] Alimentação consolidada dos dados pós-jogo para atualização do Guia da Copa.

### 🟨 Fase 2: Monitoramento em Tempo Real (Próximo Passo)
- [ ] Diagnóstico e mapeamento do parser para extração de scouts detalhados (escanteios, faltas e cartões).
- [ ] Integração da lógica de recalque automático da tabela de classificação a cada finalização de partida.

---

## 📑 Diário de Bordo & Desafios Técnicos

Durante a execução da Fase 1 e o início dos testes de ingestão de dados ao vivo com a API do calendário oficial, identificamos dois gargalos críticos na engenharia de dados que moldaram nossa estratégia de arquitetura:

### 1. Latência e Ingestão em Lotes (Cache do Endpoint)
* **O Problema:** O endpoint público principal de distribuição de calendário foi desenhado para consolidação histórica. Ele opera em camadas pesadas de cache, preenchendo dados de placares e pós-jogo (como público e arbitragem oficial) horas após o encerramento do evento. Para um painel interativo em tempo real, isso causava atrasos.
* **A Solução:** Decidimos implementar uma **Estratégia Híbrida**. O banco de dados PostgreSQL continua sendo alimentado com a estrutura pesada deste endpoint (mantendo nossa base offline estável com estádios, árbitros e chaves de grupos), mas o scraper será desacoplado para consumir endpoints secundários mais leves ou raspagem secundária dedicada exclusivamente aos 90 minutos de jogo ativo.

### 2. Bloqueio de Segurança Anti-Bot (Camada de Rede)
* **O Problema:** Ao rodar o worker de raspagem de dentro do container Docker, o servidor de borda de dados disparou bloqueios de segurança contra requisições automatizadas da biblioteca padrão `python-requests`, gerando falhas no parse de payloads JSON estruturados devido ao mascaramento por barreiras anti-bot.
* **A Solução:** Ajustamos o fluxo de requisições do scraper para simular o comportamento de um agente legítimo. Injetamos cabeçalhos HTTP customizados (`User-Agent` de navegadores modernos, `Origin`, `Referer`), contornando a validação superficial do servidor e garantindo o tráfego limpo das requisições dentro do ambiente conteinerizado.

---

## 🔧 Como Executar o Projeto Localmente

### Pré-requisitos
- [Docker](https://www.docker.com/) instalado na máquina.
- Git instalado.

### Passo a Passo

1. Clone o repositório:
```bash
git clone [https://github.com/RafaelSantos1001/PitchPulse-API.git](https://github.com/RafaelSantos1001/PitchPulse-API.git)
cd PitchPulse-API
