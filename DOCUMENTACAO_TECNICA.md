# 📘 Documentação Técnica — PitchPulse

**Guia Inteligente da Copa do Mundo FIFA 2026**

> Este documento detalha toda a jornada de desenvolvimento do PitchPulse, desde a arquitetura local em containers até a publicação em produção na nuvem — explicando as decisões técnicas, o código central de cada etapa, e as ferramentas envolvidas em cada fase.

🔗 **Site em produção:** https://rafaelsantos1001.github.io/PitchPulse-API/

---

## Sumário

1. [Visão Geral e Arquitetura](#1-visão-geral-e-arquitetura)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Cronologia de Desenvolvimento](#3-cronologia-de-desenvolvimento)
4. [Fase 1 — Ambiente Local em Containers](#fase-1--ambiente-local-em-containers)
5. [Fase 2 — Banco de Dados](#fase-2--banco-de-dados)
6. [Fase 3 — Backend (API)](#fase-3--backend-api)
7. [Fase 4 — Coleta de Dados (Scraper)](#fase-4--coleta-de-dados-scraper)
8. [Fase 5 — Frontend (SPA)](#fase-5--frontend-spa)
9. [Fase 6 — Depuração: Bugs Encontrados e Corrigidos](#fase-6--depuração-bugs-encontrados-e-corrigidos)
10. [Fase 7 — Funcionalidades em Tempo Real](#fase-7--funcionalidades-em-tempo-real)
11. [Fase 8 — Chaveamento do Mata-Mata](#fase-8--chaveamento-do-mata-mata)
12. [Fase 9 — Atualização Automática](#fase-9--atualização-automática)
13. [Fase 10 — Deploy em Produção](#fase-10--deploy-em-produção)
14. [Ferramentas Utilizadas — Referência Detalhada](#4-ferramentas-utilizadas--referência-detalhada)
15. [Trade-offs e Limitações Conhecidas](#5-trade-offs-e-limitações-conhecidas)
16. [Como Executar o Projeto](#6-como-executar-o-projeto)

---

## 1. Visão Geral e Arquitetura

O PitchPulse é um sistema de três camadas que coleta, armazena e exibe dados da Copa do Mundo FIFA 2026 em tempo real:

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   API da FIFA    │─────▶│  Scraper (Python) │─────▶│   PostgreSQL    │
│ (não-documentada)│      │  + CloudScraper   │      │   (banco de     │
└─────────────────┘      └──────────────────┘      │    dados)       │
                                                      └────────┬────────┘
                                                               │
                                                               ▼
                                                      ┌─────────────────┐
                                                      │  API (FastAPI)   │
                                                      └────────┬────────┘
                                                               │
                                                               ▼
                                                      ┌─────────────────┐
                                                      │ Frontend (SPA)   │
                                                      │ HTML/JS/Tailwind │
                                                      └─────────────────┘
```

Cada seta representa uma transformação de dados: o **Scraper** busca o JSON bruto da FIFA, extrai e "limpa" os campos relevantes, e grava no **PostgreSQL**. A **API** lê o banco e expõe endpoints REST simples. O **Frontend** consome esses endpoints e renderiza a interface, sem nenhum framework — apenas JavaScript puro e Tailwind CSS.

O projeto foi construído em duas grandes etapas macro:
1. **Desenvolvimento local**, com todos os serviços rodando em containers Docker na própria máquina.
2. **Deploy em produção**, com os mesmos serviços (com pequenas adaptações) rodando na nuvem, publicamente acessíveis.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Papel no projeto |
|---|---|---|
| Coleta de dados | **Python 3.10** + **CloudScraper** | Contorna proteção anti-bot da API da FIFA e busca o calendário de partidas |
| Banco de dados | **PostgreSQL 15** | Armazenamento estruturado e persistente das partidas |
| Driver de banco | **psycopg2** | Comunicação entre Python e PostgreSQL |
| Backend/API | **FastAPI** + **Uvicorn** | Expõe os dados do banco como endpoints REST (`/partidas`, `/classificacao`) |
| Containerização | **Docker** + **Docker Compose** | Isola e orquestra os três serviços (banco, API, scraper) localmente |
| Frontend | **HTML5 + JavaScript (vanilla)** | Interface SPA sem frameworks pesados |
| Estilização | **Tailwind CSS** (via CDN) | Design system utilitário, tema dark |
| Hospedagem do Backend | **Render** (free tier) | Backend + PostgreSQL publicados na nuvem |
| Agendamento de tarefas | **GitHub Actions** | Substitui um worker contínuo pago, rodando o scraper periodicamente |
| Hospedagem do Frontend | **GitHub Pages** | Publicação estática e gratuita do dashboard |
| Cliente de banco | **DBeaver** | Aplicação manual do schema SQL no banco de produção |
| Controle de versão | **Git + GitHub** | Versionamento e gatilho de automações (Actions) |

---

## 3. Cronologia de Desenvolvimento

O desenvolvimento seguiu uma progressão lógica, onde cada fase construiu sobre a anterior. Abaixo, cada fase é detalhada com o código central e as decisões técnicas tomadas.

---

### Fase 1 — Ambiente Local em Containers

**Objetivo:** isolar cada parte do sistema (banco, API, scraper) em containers independentes, evitando o clássico problema de "funciona na minha máquina".

O arquivo `docker-compose.yml` define três serviços:

```yaml
services:
  banco_pitchpulse:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres_password
      POSTGRES_DB: placar_futebol
    volumes:
      - pitchpulseapi_dados_postgres:/var/lib/postgresql/data
      - ./database:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d placar_futebol"]
```

**Explicação linha a linha:**
- `image: postgres:15` — usa a imagem oficial do PostgreSQL versão 15, sem necessidade de escrever um Dockerfile próprio para o banco.
- `volumes: .../docker-entrypoint-initdb.d` — trecho crucial: qualquer arquivo `.sql` dentro da pasta `database/` é executado **automaticamente** na primeira inicialização do container, aplicando o schema sem intervenção manual.
- `healthcheck` — garante que os outros serviços só tentem se conectar ao banco depois que ele estiver de fato pronto para aceitar conexões (`pg_isready`), evitando erros de "conexão recusada" na inicialização.

```yaml
  api_fastapi:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - DB_HOST=banco_pitchpulse
      - PYTHONPATH=/code
    depends_on:
      banco_pitchpulse:
        condition: service_healthy
    working_dir: /code
    command: uvicorn backend.api:app --host 0.0.0.0 --port 8000 --reload
```

- `depends_on: condition: service_healthy` — a API só inicia depois que o healthcheck do banco passar.
- `command: uvicorn backend.api:app` — nota o formato `backend.api:app`: o Uvicorn está importando o módulo `api` de dentro do **pacote** `backend`, e dentro dele o objeto `app` (a instância do FastAPI). Isso só funciona porque `PYTHONPATH=/code` está definido, tornando `backend` localizável como pacote Python.
- `--reload` — reinicia o servidor automaticamente a cada alteração de código, útil em desenvolvimento (removido em produção).

```yaml
  scraper_futebol:
    build:
      context: .
      dockerfile: Dockerfile
    command: python backend/scraper.py
```

O scraper usa o **mesmo `Dockerfile`** da API (mesma imagem base), mas com um **comando diferente** — daí a importância de o `Dockerfile` não ter um `CMD` fixo: cada serviço injeta seu próprio comando de inicialização via `docker-compose.yml`.

O `Dockerfile` em si é enxuto:

```dockerfile
FROM python:3.10-slim
WORKDIR /code
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
```

- `gcc` e `libpq-dev` — dependências de sistema necessárias para compilar o `psycopg2` (driver do PostgreSQL), que tem partes escritas em C.
- `COPY requirements.txt .` **antes** de `COPY . .` — técnica de otimização de cache do Docker: se só o código-fonte mudar (não as dependências), o Docker reaproveita a camada de `pip install`, acelerando builds subsequentes.

**Ferramentas desta fase:** Docker, Docker Compose, PostgreSQL (imagem oficial).

---

### Fase 2 — Banco de Dados

O schema inicial (`database/init.sql`) evoluiu ao longo do projeto conforme novas informações precisavam ser persistidas. Versão final:

```sql
CREATE TABLE IF NOT EXISTS partidas (
    id_match VARCHAR(50) PRIMARY KEY,
    status VARCHAR(10),
    gols_casa INT DEFAULT 0,
    gols_fora INT DEFAULT 0,
    grupo_nome VARCHAR(100),
    casa_nome VARCHAR(100),
    casa_emoji VARCHAR(255),
    fora_nome VARCHAR(100),
    fora_emoji VARCHAR(255),
    tempo_jogo VARCHAR(10),
    data_jogo TIMESTAMP,
    estadio_nome VARCHAR(150),
    fase_nome VARCHAR(100),
    numero_jogo INT
);

TRUNCATE TABLE partidas CASCADE;
```

**Decisões de modelagem:**
- `id_match VARCHAR(50) PRIMARY KEY` — a FIFA usa identificadores textuais (não numéricos sequenciais) para as partidas; a coluna precisa aceitar texto, não `SERIAL`/`INT`.
- `casa_emoji VARCHAR(255)` — este campo passou por duas versões: inicialmente `VARCHAR(10)` (suficiente para um emoji), depois ampliado para `255` quando a estratégia mudou de "emoji de bandeira" para "URL de imagem da bandeira" (ver Fase 6).
- `TRUNCATE TABLE ... CASCADE` — limpa os dados a cada reinicialização do container, garantindo que o schema aplicado seja sempre consistente com o código em uso (evita "resíduos" de colunas antigas).

**Ferramenta desta fase:** PostgreSQL (DDL nativo).

---

### Fase 3 — Backend (API)

Construído com **FastAPI**, expõe dois endpoints principais:

```python
@app.get("/partidas")
def listar_partidas():
    cursor.execute("""
        SELECT id_match, status, gols_casa, gols_fora, grupo_nome, 
               casa_nome, casa_emoji, fora_nome, fora_emoji, tempo_jogo,
               data_jogo, estadio_nome, fase_nome, numero_jogo
        FROM partidas 
        ORDER BY numero_jogo ASC NULLS LAST, id_match ASC;
    """)
    return cursor.fetchall()
```

- Usa `RealDictCursor` do `psycopg2`, que faz o `fetchall()` retornar uma lista de **dicionários** (não tuplas) — essencial para o FastAPI conseguir serializar a resposta como JSON automaticamente, com os nomes das colunas como chaves.
- `ORDER BY numero_jogo ASC NULLS LAST` — ordena pelo número oficial do jogo (garantindo a sequência correta do campeonato), com fallback para `id_match` caso `numero_jogo` seja nulo.

```python
@app.get("/classificacao")
def obter_classificacao():
    cursor.execute("SELECT * FROM partidas;")
    jogos = cursor.fetchall()

    grupos = {}
    for jogo in jogos:
        nome_grupo = jogo["grupo_nome"] or "Outros"
        ...
        if jogo["status"] == "FIN" or jogo["status"] == "3":
            # calcula pontos, vitórias, saldo de gols dinamicamente
```

Este endpoint **não lê uma tabela de classificação pré-calculada** — ele recebe a lista bruta de partidas e calcula a tabela de grupos (pontos, jogos, saldo de gols) **em tempo real**, a cada requisição, iterando sobre os resultados. Essa abordagem evita inconsistência entre "tabela de jogos" e "tabela de classificação" (não há duas fontes de verdade).

**Adaptação para produção:**

```python
def obter_conexao_banco():
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        conn = psycopg2.connect(database_url)
    else:
        conn = psycopg2.connect(host=os.getenv("DB_HOST", "banco_pitchpulse"), ...)
```

Esse padrão de "tenta `DATABASE_URL`, senão cai nas variáveis separadas" permite que o **mesmo arquivo** `api.py` funcione tanto localmente (Docker Compose, que usa variáveis separadas) quanto em produção (Render, que fornece uma única URL de conexão) — sem duplicar código.

**Ferramentas desta fase:** FastAPI, Uvicorn, psycopg2, CORS Middleware (para permitir requisições do frontend).

---

### Fase 4 — Coleta de Dados (Scraper)

O scraper (`backend/scraper.py`) é a peça mais "cirúrgica" do projeto: ele busca o JSON bruto da API da FIFA e extrai apenas o que é relevante.

```python
def puxar_dados_fifa():
    url = "https://api.fifa.com/api/v3/calendar/matches?language=en&count=500&idSeason=285023"
    scraper = cloudscraper.create_scraper()
    resposta = scraper.get(url, timeout=15)
    return resposta.json()
```

- **CloudScraper** (em vez de `requests` puro) é necessário porque a API da FIFA tem proteção anti-bot (Cloudflare); uma requisição HTTP comum seria bloqueada.
- `idSeason=285023` — identificador específico da temporada da Copa do Mundo 2026 dentro do sistema interno da FIFA.

O payload retornado pela FIFA é profundamente aninhado e multilíngue. Exemplo de tratamento:

```python
grupo_lista = jogo.get("GroupName", [])
grupo_nome = "Fase Final"
if grupo_lista and isinstance(grupo_lista, list) and len(grupo_lista) > 0:
    grupo_nome = grupo_lista[0].get("Description", "Fase Final")
```

A FIFA representa nomes (grupos, times, fases, estádios) como **listas de traduções** — cada item tem um `Locale` (ex: `en-GB`) e uma `Description`. O código sempre pega o primeiro item da lista (idioma padrão da requisição) e usa um valor de fallback (`"Fase Final"`) caso a estrutura venha vazia ou em formato inesperado — proteção contra dados malformados.

```python
casa_emoji = montar_url_bandeira(casa_info.get("PictureUrl"))
```

A FIFA já fornece, para cada time, um campo `PictureUrl` no formato:
```
https://api.fifa.com/api/v3/picture/flags-{format}-{size}/MEX
```
A função `montar_url_bandeira()` apenas substitui os placeholders `{format}` e `{size}` por valores fixos (`sq`, `2`), obtendo uma URL de imagem pronta — sem precisar gerar emoji ou manter uma tabela de correspondência de códigos de país (abordagem descartada, ver Fase 6).

```python
query = """
    INSERT INTO partidas (...) VALUES (...)
    ON CONFLICT (id_match) 
    DO UPDATE SET
        status = EXCLUDED.status, ...
"""
execute_batch(cursor, query, dados_para_salvar)
```

- `ON CONFLICT ... DO UPDATE` (UPSERT) — insere partidas novas e atualiza as já existentes numa única operação, evitando duplicação de dados quando o scraper roda repetidamente sobre o mesmo calendário.
- `execute_batch` (em vez de executar um `INSERT` por vez em loop) — agrupa as ~104 partidas num único lote de execução, reduzindo drasticamente o número de round-trips ao banco.

**Ferramentas desta fase:** CloudScraper, psycopg2 (`execute_batch`), API pública da FIFA.

---

### Fase 5 — Frontend (SPA)

A interface é dividida em módulos JavaScript, cada um responsável por uma aba:

| Arquivo | Responsabilidade |
|---|---|
| `app.js` | Orquestrador: busca dados da API, gerencia qual aba está ativa, dispara re-renderizações |
| `ao-vivo.js` | Renderiza o card de partida ao vivo (topo da página) |
| `grupos.js` | Renderiza a tabela de classificação por grupo |
| `confrontos.js` | Renderiza a agenda de confrontos em formato de cards |
| `chaveamento.js` | Renderiza a árvore do mata-mata |

O núcleo do `app.js`:

```javascript
async function carregarDados() {
    const resPartidas = await fetch(`${CONFIG.API_URL}/partidas`);
    dadosCopa = await resPartidas.json();

    const resClassificacao = await fetch(`${CONFIG.API_URL}/classificacao`);
    dadosClassificacao = await resClassificacao.json();

    renderizarAbaAtual();
}
```

Cada módulo de aba exporta uma função `renderizar*(container, dados)` que recebe um elemento DOM e os dados brutos, e devolve o HTML pronto via `container.innerHTML`. Essa separação de responsabilidades permite que cada aba seja testada e modificada independentemente, sem acoplamento entre elas.

**Sem frameworks:** a escolha por JavaScript vanilla (em vez de React/Vue) foi deliberada para manter o projeto simples, sem etapa de build, servível diretamente como arquivos estáticos — decisão que também simplificou o deploy via GitHub Pages (Fase 10).

**Ferramentas desta fase:** JavaScript (ES6+), Tailwind CSS (via CDN, sem processo de build).

---

### Fase 6 — Depuração: Bugs Encontrados e Corrigidos

Esta fase não foi um bloco único no tempo, mas um processo contínuo. Os bugs mais relevantes, em ordem de descoberta:

**1. Mapeamento de campos divergente (`grupos.js`)**
O endpoint `/classificacao` retorna os campos com prefixo (`time_nome`, `time_emoji`), mas o frontend inicialmente procurava por `nome`/`emoji` (sem prefixo) — resultado: todo time aparecia como "Desconhecido".
```javascript
// Antes (bugado):
const nomeTime = time.name || time.nome || 'Desconhecido';
// Depois (corrigido):
const nomeTime = time.time_nome || time.name || time.nome || 'Desconhecido';
```

**2. Bandeira hardcoded (`scraper.py`)**
```python
# Versão inicial (bugada): sempre a mesma bandeira genérica
casa_emoji = "🏳️"
```
Corrigido em duas etapas: primeiro tentando gerar emoji de bandeira a partir do código do país (técnica de Regional Indicator Symbols Unicode), depois substituído por uma solução mais simples e robusta — usar a URL de imagem que a própria FIFA já fornece (`PictureUrl`), eliminando a necessidade de manter uma tabela de mapeamento de códigos de país.

**3. Renderização de emoji inconsistente entre sistemas operacionais**
Mesmo com o emoji correto no banco, bandeiras não apareciam no Windows (sistema sem fonte nativa de bandeira, exibindo as duas letras do código ISO em vez da imagem). Resolvido ao trocar emoji por `<img>` apontando para a URL de imagem da FIFA — solução independente de sistema operacional.

**4. Comparação de tipos incorreta (`ao-vivo.js`, `confrontos.js`)**
O bug mais impactante: o backend armazena `status` como **string** (`"FIN"`, `"3"`, `"1"`), mas o frontend comparava com **número**:
```javascript
// Antes (bugado): nunca é verdadeiro, pois '3' !== 3 em JavaScript
const jogosAoVivo = partidas.filter(p => p.status === 3);
// Depois (corrigido):
const jogosAoVivo = partidas.filter(p => p.status === '3');
```
Esse bug fazia com que partidas ao vivo **nunca** fossem detectadas como tal, mesmo com os dados corretos no banco — sintoma clássico de bug silencioso (sem erro no console, apenas comportamento incorreto).

**5. `ON CONFLICT` incompleto (`scraper.py`)**
O UPSERT inicial não atualizava todos os campos ao reprocessar uma partida já existente — significava que, mesmo corrigindo o bug da bandeira no código, partidas já salvas no banco manteriam o dado antigo até uma reinicialização completa do banco.

**6. Caminho de scripts incorreto (`index.html`)**
```html
<!-- Bugado: index.html já está DENTRO de frontend/, então esse caminho aponta para frontend/frontend/scripts -->
<script src="./frontend/scripts/app.js"></script>
<!-- Corrigido: -->
<script src="./scripts/app.js"></script>
```
Causava erro 404 em todos os scripts simultaneamente, quebrando a aplicação inteira (nenhum botão funcionava, pois `app.js` nunca carregava).

**Ferramenta desta fase:** DevTools do navegador (Console, Network) para diagnóstico.

---

### Fase 7 — Funcionalidades em Tempo Real

Duas melhorias incrementais no pipeline de dados:

**Relógio da partida:** o campo `MatchTime` (ex: `"78'"`) da FIFA passou a ser capturado no scraper, persistido no banco (`tempo_jogo`), exposto pela API e renderizado no card de "Ao Vivo" como um selo destacado.

**Metadados de partida:** captura de `LocalDate` (horário local do estádio) e `Stadium.Name`/`CityName`, exibidos na aba Agenda. Detalhe técnico relevante: o campo `LocalDate` da FIFA vem com sufixo `Z` (normalmente indicativo de UTC), mas na prática representa o horário **local** do estádio. Por isso, a formatação no frontend evita usar `new Date()` (que aplicaria uma conversão de fuso incorreta) e extrai os componentes de data/hora diretamente da string, via expressão regular:
```javascript
const match = dataIso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
```

**Ferramentas desta fase:** JavaScript nativo (`String.match`, sem bibliotecas de data).

---

### Fase 8 — Chaveamento do Mata-Mata

A funcionalidade mais complexa do frontend: transformar uma lista plana de partidas em uma árvore visual de torneio.

```javascript
function mapearFase(faseNomeOriginal) {
    const normalizado = faseNomeOriginal.toLowerCase();
    if (normalizado.includes('32')) return { ordem: 1, label: 'Rodada de 32' };
    if (normalizado.includes('16')) return { ordem: 2, label: 'Oitavas de Final' };
    if (normalizado.includes('quarter')) return { ordem: 3, label: 'Quartas de Final' };
    if (normalizado.includes('semi')) return { ordem: 4, label: 'Semifinal' };
    if (normalizado.includes('final')) return { ordem: 5, label: 'Final' };
    return null;
}
```

Em vez de comparar o nome da fase (`StageName` da FIFA) por igualdade exata, a função usa correspondência por **palavra-chave** (`includes`) — decisão deliberada, já que não havia confirmação prévia de como a FIFA formata exatamente cada string de fase. Essa abordagem se mostrou robusta na prática (funcionou de primeira quando testado com dados reais).

Os jogos são agrupados por fase e ordenados pelo `numero_jogo` oficial, garantindo que a ordem visual da árvore corresponda à ordem real do chaveamento. O time vencedor de cada confronto finalizado é destacado visualmente (verde/negrito), calculado comparando os placares diretamente no momento da renderização.

**Ferramentas desta fase:** JavaScript (lógica de agrupamento e ordenação), Tailwind CSS (layout em colunas via Flexbox).

---

### Fase 9 — Atualização Automática

Duas mudanças transformaram o sistema de uma "foto estática" em algo realmente "ao vivo":

**Backend — loop contínuo:**
```python
while True:
    try:
        rodar_coletor()
    except Exception as e:
        print(f"❌ [Scraper] Erro inesperado no ciclo de coleta: {e}")
    time.sleep(INTERVALO_SEGUNDOS)
```
O scraper, que antes executava uma única vez e encerrava, passou a rodar indefinidamente, com tratamento de exceção por ciclo — uma falha isolada (ex: instabilidade momentânea da API da FIFA) não derruba o processo inteiro.

**Frontend — polling:**
```javascript
function iniciarAtualizacaoAutomatica() {
    setInterval(() => { carregarDados(); }, CONFIG.INTERVALO_ATUALIZACAO_MS);
}
```
O dashboard passou a buscar dados novos a cada 1 minuto automaticamente, reaproveitando a função de carregamento já existente (que já dispara a re-renderização da aba ativa ao final).

**Ferramentas desta fase:** `time.sleep` (Python), `setInterval` (JavaScript).

---

### Fase 10 — Deploy em Produção

A etapa final: tirar o projeto da máquina local e publicá-lo, gratuitamente, na internet. Exigiu adaptações em múltiplas camadas.

**10.1 — Preparando o código para dois ambientes**

Tanto `api.py` quanto `scraper.py` foram adaptados para reconhecer `DATABASE_URL` (formato usado pelo Render) como alternativa às variáveis separadas (formato usado no Docker Compose local) — permitindo que o mesmo código-fonte funcione em ambos os ambientes sem duplicação.

O `scraper.py` recebeu também um modo de execução única:
```python
LOOP_CONTINUO = os.getenv("SCRAPER_LOOP_CONTINUO", "true").lower() not in ("false", "0")
if not LOOP_CONTINUO:
    rodar_coletor()
    raise SystemExit(0)
```
Necessário porque, em produção, não há um worker gratuito disponível para rodar o loop contínuo 24/7 — a alternativa foi delegar o "agendamento" para o GitHub Actions.

**10.2 — Backend + Banco no Render**

Arquivo `render.yaml` (Infrastructure as Code):
```yaml
databases:
  - name: pitchpulse-db
    plan: free
    databaseName: placar_futebol

services:
  - type: web
    name: pitchpulse-api
    runtime: docker
    dockerfilePath: ./Dockerfile
    dockerCommand: uvicorn backend.api:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHONPATH
        value: /code
      - key: DATABASE_URL
        fromDatabase:
          name: pitchpulse-db
          property: connectionString
```
- `dockerCommand` — necessário porque o `Dockerfile` original não define `CMD` (é compartilhado entre API e Scraper); o Render precisa saber explicitamente qual comando rodar.
- `--port $PORT` — o Render atribui dinamicamente a porta que o serviço deve escutar; um valor fixo (`8000`) faria o deploy falhar.
- `fromDatabase: ... property: connectionString` — o Render injeta automaticamente a URL de conexão do banco criado no mesmo Blueprint, sem necessidade de copiar/colar credenciais manualmente.

**10.3 — Aplicação manual do schema (DBeaver)**

Diferente do Docker Compose local (onde o `init.sql` roda automaticamente via `docker-entrypoint-initdb.d`), o banco do Render precisa do schema aplicado manualmente uma única vez. Foi utilizado o **DBeaver** (cliente SQL gráfico gratuito) para conectar via credenciais externas do banco e executar o script `CREATE TABLE` diretamente.

**10.4 — Agendamento via GitHub Actions**

```yaml
on:
  schedule:
    - cron: "*/15 * * * *"
  workflow_dispatch: {}

jobs:
  rodar-scraper:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
      - run: pip install -r requirements.txt
      - working-directory: backend
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          SCRAPER_LOOP_CONTINUO: "false"
        run: python scraper.py
```
- `cron: "*/15 * * * *"` — executa a cada 15 minutos. Importante notar: o agendamento do GitHub Actions é "melhor esforço" — pode atrasar em horários de pico da plataforma.
- `secrets.DATABASE_URL` — a credencial de conexão com o banco é armazenada como **secret** do repositório (nunca exposta em texto plano no código), injetada como variável de ambiente apenas durante a execução do workflow.
- `workflow_dispatch: {}` — permite disparo manual do workflow pela interface do GitHub, útil para testes sem esperar o agendamento.

**10.5 — Frontend via GitHub Pages**

```yaml
- uses: actions/upload-pages-artifact@v3
  with:
    path: ./frontend
- uses: actions/deploy-pages@v4
```
Publica a pasta `frontend/` diretamente como site estático, disparado automaticamente a cada `push` que altere arquivos dentro dessa pasta.

**Ferramentas desta fase:** Render (Blueprint/IaC), GitHub Actions (cron + secrets), GitHub Pages, DBeaver.

---

## 4. Ferramentas Utilizadas — Referência Detalhada

**Docker & Docker Compose** — Containerização dos serviços, garantindo que o ambiente de desenvolvimento seja idêntico em qualquer máquina, eliminando divergências de configuração local.

**PostgreSQL** — Banco de dados relacional escolhido pela robustez e suporte nativo a `UPSERT` (`ON CONFLICT`), essencial para o padrão de reprocessamento de dados do scraper.

**FastAPI** — Framework Python para construção de APIs REST, escolhido pela tipagem automática de respostas JSON e geração automática de documentação interativa (Swagger UI, acessível em `/docs`).

**CloudScraper** — Biblioteca Python especializada em contornar proteções anti-bot (Cloudflare), necessária pois a API da FIFA bloqueia requisições HTTP convencionais.

**Tailwind CSS** — Framework de utilitários CSS, usado via CDN (sem etapa de build), permitindo estilização rápida diretamente nas classes HTML.

**Git & GitHub** — Controle de versão e hospedagem do código-fonte; também serviu como gatilho para as automações de CI/CD (GitHub Actions, GitHub Pages).

**GitHub Actions** — Utilizado para duas finalidades distintas: (1) execução agendada do scraper, substituindo a necessidade de um worker pago rodando continuamente; (2) build e publicação automática do frontend no GitHub Pages a cada alteração.

**Render** — Plataforma de hospedagem em nuvem (PaaS) para o backend e banco de dados, escolhida por oferecer um tier gratuito com suporte nativo a Docker e Infrastructure as Code (`render.yaml`).

**GitHub Pages** — Hospedagem gratuita de conteúdo estático, usada para publicar o frontend do dashboard.

**DBeaver** — Cliente SQL gráfico multiplataforma, utilizado para aplicar manualmente o schema do banco de dados em produção, sem necessidade de instalar o `psql` (CLI oficial do PostgreSQL) na máquina local.

---

## 5. Trade-offs e Limitações Conhecidas

Por se tratar de uma hospedagem 100% gratuita, algumas limitações foram conscientemente aceitas e documentadas:

- **Cold start:** o backend no Render "dorme" após 15 minutos de inatividade; o primeiro acesso subsequente pode levar de 30 a 60 segundos para responder.
- **Defasagem de dados:** como o scraper roda via agendamento (GitHub Actions, a cada 15 minutos, "melhor esforço"), o placar de uma partida pode permanecer desatualizado por alguns minutos após o fim real do jogo.
- **Expiração do banco:** o PostgreSQL gratuito do Render expira 30 dias após a criação, exigindo recriação manual periódica.
- **Ausência de WebSockets:** a atualização em tempo real é feita via polling (requisições periódicas), não via conexão persistente — suficiente para o caso de uso atual, mas com maior latência do que uma solução baseada em WebSockets.

---

## 6. Como Executar o Projeto

**Localmente (Docker Compose):**
```bash
docker-compose down -v
docker-compose up --build
```
Acesse o frontend em `frontend/index.html` (ex: via extensão Live Server do VS Code) e a API em `http://localhost:8000`.

**Em produção:** acesse diretamente https://rafaelsantos1001.github.io/PitchPulse-API/ — nenhuma instalação necessária.

---

*Documentação gerada como parte do processo de desenvolvimento do projeto PitchPulse, cobrindo do ambiente local à publicação em produção.*
