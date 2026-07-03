# 🚀 Guia de Deploy Gratuito — PitchPulse

Este guia coloca o PitchPulse no ar de graça, pra você mandar o link pros seus amigos. Trade-offs do plano gratuito (leia antes de começar):

- **Backend (Render, free):** "dorme" depois de 15 min sem acesso — o primeiro acesso do dia demora uns 30-60s pra "acordar".
- **Banco (Render, free):** expira em 30 dias. Depois disso, recria o banco gratuito de novo (ou migra pra um plano pago, ~US$7/mês).
- **Scraper:** não roda mais em loop contínuo em produção — um workflow do GitHub Actions dispara ele a cada 15 minutos, de graça.

---

## Passo 1 — Sobre o Dockerfile (nenhuma ação necessária)

Conferi seu `Dockerfile` e ele **não tem nenhum `CMD`** — faz sentido, já que ele é compartilhado entre a API e o Scraper, e cada serviço roda um comando diferente (isso é definido na chave `command:` do seu `docker-compose.yml`).

Por isso, resolvi a exigência de porta do Render **direto no `render.yaml`**, sem tocar no `Dockerfile` — usando exatamente o mesmo comando e a mesma variável `PYTHONPATH` que você já usa localmente (só trocando a porta fixa `8000` pela variável `$PORT` do Render, e removendo o `--reload`, que é só pra desenvolvimento):
```yaml
dockerCommand: uvicorn backend.api:app --host 0.0.0.0 --port $PORT
envVars:
  - key: PYTHONPATH
    value: /code
```
Não precisa alterar nada aqui, já está pronto no `render.yaml`.

---

## Passo 2 — Subir o Backend + Banco no Render

1. Crie uma conta em [render.com](https://render.com) (aceita login via GitHub).
2. No Dashboard, clique em **New** → **Blueprint**.
3. Conecte seu repositório do GitHub (o mesmo do PitchPulse). O Render vai detectar automaticamente o arquivo `render.yaml` que criamos.
4. Confirme a criação — ele vai subir dois recursos: o banco `pitchpulse-db` e o serviço web `pitchpulse-api`.
5. Aguarde o build terminar. Quando finalizar, copie a **URL pública** do serviço web (algo como `https://pitchpulse-api.onrender.com`).

---

## Passo 3 — Rodar o `init.sql` no banco do Render

O `init.sql` só roda sozinho no Docker Compose local (via `/docker-entrypoint-initdb.d`). No Render, você precisa aplicá-lo manualmente uma vez:

1. No Dashboard do Render, abra o banco `pitchpulse-db`.
2. Copie a **"External Connection String"** (URL de conexão externa).
3. No seu terminal local, rode (substituindo pela URL copiada):
   ```bash
   psql "SUA_EXTERNAL_CONNECTION_STRING_AQUI" -f database/init.sql
   ```
   Se não tiver o `psql` instalado, dá pra rodar isso também com qualquer cliente gráfico de Postgres (DBeaver, TablePlus, etc.) colando o conteúdo do `init.sql`.

---

## Passo 4 — Configurar o GitHub Actions para rodar o Scraper

1. No seu repositório do GitHub, vá em **Settings** → **Secrets and variables** → **Actions**.
2. Clique em **New repository secret**.
3. Nome: `DATABASE_URL`. Valor: a mesma **External Connection String** do Passo 3.
4. Salve. O workflow `.github/workflows/atualizar-dados.yml` já está configurado pra rodar a cada 15 minutos automaticamente a partir do próximo push.
5. Pra testar sem esperar: vá na aba **Actions** do repositório → selecione "Atualizar Dados da Copa (Scraper)" → **Run workflow**.

---

## Passo 5 — Apontar o Frontend para o Backend publicado

1. Abra `frontend/scripts/app.js`.
2. Troque a linha `API_URL: 'http://localhost:8000'` pela URL que você copiou no Passo 2 (ex: `API_URL: 'https://pitchpulse-api.onrender.com'`).
3. Commit e push dessa alteração.

---

## Passo 6 — Publicar o Frontend no GitHub Pages

1. No repositório, vá em **Settings** → **Pages**.
2. Em **Source**, selecione **GitHub Actions** (não "Deploy from a branch").
3. Faça um push para a branch `main` (qualquer alteração dentro de `frontend/` já dispara o workflow `deploy-pages.yml` que criamos).
4. Acompanhe pela aba **Actions** — quando o workflow "Publicar Frontend" terminar, o link do site aparece em **Settings → Pages**, algo como:
   ```
   https://SEU_USUARIO.github.io/NOME_DO_REPOSITORIO/frontend/
   ```

---

## Comandos para subir todas essas mudanças

```bash
git add .
git commit -m "chore: configuracao de deploy gratuito (Render + GitHub Actions + GitHub Pages)"
git push origin main
```

---

## Checklist final

- [ ] Blueprint do Render criado (banco + API)
- [ ] `init.sql` aplicado manualmente no banco do Render
- [ ] Secret `DATABASE_URL` configurado no GitHub Actions
- [ ] `app.js` apontando para a URL pública do Render
- [ ] GitHub Pages configurado com Source = GitHub Actions
- [ ] Link funcionando para os amigos! 🎉

> 💡 Lembrete: em 30 dias o banco gratuito do Render expira. Quando isso acontecer, repita os Passos 2 e 3 (ou migre para o plano pago, caso queira o site permanentemente no ar).
