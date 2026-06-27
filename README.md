## 🚀 Status Atual do Projeto e Roadmap

O desenvolvimento foi dividido estrategicamente para garantir a consistência dos dados do portfólio. Atualmente, o projeto concluiu a sua prova de conceito básica e está avançando para uma arquitetura profissional desacoplada.

### 📍 Fase 1: Prova de Conceito (Concluída)
- [x] Criação da infraestrutura básica com Docker Compose (API, Scraper e Banco).
- [x] Comunicação e tratamento de barreira anti-bot no Scraper Python.
- [x] Integração do CORS e exibição dos primeiros cards dinâmicos no Frontend.

### 🎯 Fase 2: Nova Meta — Arquitetura Limpa & Experiência Guia da Copa (Em Andamento)
O objetivo desta nova fase é remover totalmente as criações de tabelas e estruturas de dentro do código Python, utilizando o banco de dados de forma independente e otimizando a interface do usuário para o formato clássico de Guia de Copa do Mundo.

#### 1. Banco de Dados Isolado e Estático
- [ ] Mover toda a criação de tabelas e inserts iniciais das seleções para o arquivo `init.sql` na pasta `/database`.
- [ ] Deixar o Postgres inicializar a estrutura nativamente pelo ponto de montagem do Docker (`/docker-entrypoint-initdb.d`).
- [ ] Ajustar relacionamentos de chaves para mapear os identificadores reais da API da FIFA.

#### 2. Coletor Python Cirúrgico e de Alta Performance
- [ ] Tornar o script Python um agente focado puramente em requisição, tratamento rápido e injeção de dados.
- [ ] Implementar a estratégia de `execute_batch` para reduzir chamadas ao banco e melhorar consumo de CPU.
- [ ] Filtrar estritamente as chaves necessárias do payload gigante da FIFA (Placar, Status, Tempo de Jogo, Estádio e Árbitros).

#### 3. Frontend Interativo Baseado em Abas (Foco em UX)
Remodelar o Dashboard para o formato de aplicação de página única (SPA) dividido em três abas inteligentes de navegação:
- [ ] **🔴 Aba Principal: Ao Vivo:** Exibição imediata de partidas com status ativo. Caso não haja jogos no momento, exibição de um estado amigável direcionando para o calendário.
- [ ] **📊 Aba Grupos:** Classificação de A a H com tabelas ordenadas de forma automatizada por Pontos, Saldo de Gols e Gols Pró enviados pela API.
- [ ] **🗓️ Aba Confrontos:** Calendário completo da Copa com recurso de **Detalhe Ampliado** (janela flutuante/modal ao clicar no card) para expor Estádio, Cidade e Equipe de Arbitragem.