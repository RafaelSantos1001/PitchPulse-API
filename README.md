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

### 📍 Fase 4: Sincronização do Cronômetro em Tempo Real (Concluída)
- [x] **⏱️ Relógio Integrado:** Mapeamento do campo `MatchTime` da FIFA através do pipeline completo (Scraper → Banco → API → Frontend) para exibir os minutos exatos das partidas ao vivo.
- [x] **Bandeiras Reais:** Substituição de emojis de bandeira (limitados no Windows) pela URL de imagem oficial fornecida pela própria FIFA (`PictureUrl`), garantindo renderização consistente em qualquer sistema operacional.
- [x] **Metadados de Partida:** Captura de data/hora local (`LocalDate`) e nome do estádio + cidade (`Stadium`) para exibição na aba Agenda.

### 📍 Fase 5: Chaveamento do Mata-Mata (Concluída)
- [x] **🏆 Árvore de Fases:** Captura do campo `StageName` da FIFA para identificar a fase de cada confronto (Rodada de 32, Oitavas, Quartas, Semifinal, Final e Disputa de 3º Lugar).
- [x] **Ordenação Oficial:** Uso do `MatchNumber` da FIFA para manter a ordem correta dos confrontos dentro de cada fase.
- [x] **Visualização em Árvore:** Renderização do chaveamento em colunas por fase, com destaque visual do time vencedor e indicador de partidas ao vivo.

### 🎯 Fase 6: Próxima Meta — Refinamento Visual do Chaveamento
- [ ] **🔗 Linhas Conectoras:** Adicionar conectores visuais (SVG/CSS) entre os confrontos de fases consecutivas, ligando cada jogo ao seu respectivo confronto na fase seguinte.
- [ ] **Layout Espelhado:** Avaliar migração do chaveamento para o formato tradicional de "duas metades convergindo para a Final" (como usado nas transmissões oficiais).

---

## 🐛 Correções Técnicas Relevantes

Durante o desenvolvimento, alguns bugs não-óbvios foram identificados e corrigidos — documentados aqui por relevância técnica:

- **Comparação de tipos (status):** o backend armazena o status da partida como `string` (`"FIN"`, `"3"`, `"1"`), mas o frontend originalmente comparava com `number` (`=== 0`, `=== 3`). Isso fazia com que partidas ao vivo e finalizadas nunca fossem identificadas corretamente pelas abas Ao Vivo e Agenda.
- **Mapeamento de campos divergente:** o endpoint `/classificacao` retorna os campos `time_nome`/`time_emoji` (com prefixo), enquanto o frontend esperava `nome`/`emoji` — causando exibição de "Desconhecido" na tabela de grupos.
- **`ON CONFLICT` incompleto:** o `UPSERT` do Scraper não atualizava todos os campos ao reprocessar uma partida já existente, mantendo dados desatualizados após reinicializações incrementais do banco.

---

## 🛠️ Como Executar o Ecossistema

Certifique-se de ter o **Docker** e o **Docker Compose** instalados na sua máquina.

### 1. Inicialização Limpa (Resetando Volumes)
Para garantir que o banco de dados aplique as tabelas estruturais corretas da FIFA sem conflitos de memória residual:
```bash
docker-compose down -v
docker-compose up --build
```