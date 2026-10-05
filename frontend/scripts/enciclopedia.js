/* =========================================================
   PitchPulse · Enciclopédia da Copa (abas estáticas)
   Renderiza: Copa 2026, História, Recordes e Curiosidades.
   Usa COPA_DADOS (dados-copa.js). Não depende do backend.
   ========================================================= */

// Mapa país -> código ISO (bandeiras via flagcdn, iguais em qualquer sistema)
const ISO_PAIS = {
  "Espanha": "es", "Argentina": "ar", "França": "fr", "Brasil": "br",
  "Alemanha": "de", "Alemanha Ocidental": "de", "Itália": "it",
  "Uruguai": "uy", "Holanda": "nl", "Croácia": "hr", "Hungria": "hu",
  "Suécia": "se", "Noruega": "no", "Inglaterra": "gb-eng", "Tchecoslováquia": "cz",
};

function bandeira(pais, classe = "w-6 h-4") {
  const code = ISO_PAIS[pais];
  const cls = `${classe} object-cover rounded-sm inline-block align-middle bg-[#0d1117] shrink-0`;
  if (!code) return `<span class="${classe} inline-block align-middle"></span>`;
  return `<img src="https://flagcdn.com/${code}.svg" alt="${pais}" class="${cls}" loading="lazy" onerror="this.style.display='none'">`;
}

// ---------- Banner exibido nas abas "ao vivo" quando não há dados ----------
function bannerCopaEncerrada(container) {
  container.innerHTML = `
    <div class="text-center py-12 px-6 bg-[#161b22] border border-[#30363d] rounded-xl">
      <div class="text-4xl mb-3">🏆</div>
      <h3 class="text-white font-bold text-base mb-1">A Copa do Mundo de 2026 foi encerrada</h3>
      <p class="text-sm text-gray-400 max-w-md mx-auto">
        Os dados ao vivo (tabela, agenda e chaveamento) voltam a ser alimentados durante o próximo
        torneio. Enquanto isso, confira o resumo da edição na aba
        <span class="text-emerald-400 font-semibold">Copa 2026</span> e explore a
        <span class="text-emerald-400 font-semibold">História</span>.
      </p>
    </div>`;
}

// ---------- Aba: Copa 2026 (resumo da edição) ----------
function renderizarCopa2026(container) {
  const d = COPA_DADOS.edicao2026;

  const cardInfo = (rotulo, valor, nota) => `
    <div class="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
      <div class="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">${rotulo}</div>
      <div class="text-white font-bold text-sm leading-snug">${valor}</div>
      ${nota ? `<div class="text-[11px] text-gray-500 mt-1">${nota}</div>` : ""}
    </div>`;

  container.innerHTML = `
    <div class="space-y-6">

      <!-- Hero do campeão -->
      <div class="relative overflow-hidden bg-gradient-to-br from-emerald-950/40 to-[#0d1117] border border-emerald-800/40 rounded-2xl p-6 text-center">
        <div class="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-400 mb-3">Campeã Mundial 2026</div>
        <div class="flex justify-center mb-3">${bandeira(d.campeao, "w-20 h-14")}</div>
        <h2 class="text-3xl font-black text-white tracking-wide uppercase">${d.campeao}</h2>
        <p class="text-xs text-gray-400 mt-1">${d.titulo}</p>

        <div class="mt-5 inline-flex items-center gap-3 bg-[#0d1117] border border-[#30363d] rounded-xl px-5 py-3">
          ${bandeira(d.campeao, "w-7 h-5")}
          <span class="text-sm font-bold text-white">${d.campeao}</span>
          <span class="text-lg font-black text-emerald-400">${d.placarFinal}</span>
          <span class="text-sm font-bold text-white">${d.vice}</span>
          ${bandeira(d.vice, "w-7 h-5")}
        </div>
        <p class="text-[11px] text-gray-500 mt-2">${d.detalheFinal}</p>
        <p class="text-[11px] text-gray-500">${d.dataFinal} · ${d.estadioFinal}</p>
      </div>

      <!-- Artilheiro -->
      <div class="flex items-center justify-between bg-[#161b22] border border-[#30363d] rounded-xl p-4">
        <div>
          <div class="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">Artilheiro (Chuteira de Ouro)</div>
          <div class="text-white font-bold text-sm flex items-center gap-2">${bandeira(d.artilheiro.pais)} ${d.artilheiro.nome}</div>
        </div>
        <div class="text-right">
          <div class="text-2xl font-black text-emerald-400">${d.artilheiro.gols}</div>
          <div class="text-[10px] text-gray-500 uppercase">gols</div>
        </div>
      </div>

      <!-- Dados da edição -->
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
        ${cardInfo("Anfitriões", d.anfitrioes, d.anfitrioesNota)}
        ${cardInfo("Seleções", d.selecoes + " times", d.grupos)}
        ${cardInfo("Jogos", d.jogos + " partidas", d.cidades + " cidades-sede")}
        ${cardInfo("Período", d.periodo, "")}
        ${cardInfo("Abertura", d.abertura, "")}
        ${cardInfo("Público da final", d.publicoFinal, "")}
      </div>

      <!-- Formato + curiosidade -->
      <div class="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-3">
        <div>
          <div class="text-[10px] font-mono uppercase tracking-widest text-emerald-400 mb-1">Como funcionou o formato</div>
          <p class="text-sm text-gray-300">${d.formato}</p>
        </div>
        <div class="border-t border-[#30363d] pt-3">
          <div class="text-[10px] font-mono uppercase tracking-widest text-emerald-400 mb-1">Você sabia?</div>
          <p class="text-sm text-gray-300">${d.curiosidade}</p>
        </div>
      </div>

    </div>`;
}

// ---------- Aba: História (campeões + quadro de títulos) ----------
function renderizarHistoria(container) {
  const medalha = (i) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`);

  let titulosHtml = COPA_DADOS.titulos
    .map(
      (t, i) => `
      <div class="flex items-center justify-between bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-3">
        <div class="flex items-center gap-3 min-w-0">
          <span class="w-7 text-center text-sm">${medalha(i)}</span>
          ${bandeira(t.pais, "w-7 h-5")}
          <div class="min-w-0">
            <div class="text-white font-bold text-sm truncate">${t.pais}</div>
            <div class="text-[11px] text-gray-500 truncate">${t.anos}</div>
          </div>
        </div>
        <div class="text-right shrink-0 pl-2">
          <span class="text-2xl font-black text-emerald-400">${t.n}</span>
          <span class="text-[10px] text-gray-500 uppercase block leading-none">${t.n > 1 ? "títulos" : "título"}</span>
        </div>
      </div>`
    )
    .join("");

  let linhas = COPA_DADOS.campeoes
    .map(
      (c) => `
      <tr class="hover:bg-[#21262d]/40 transition-colors">
        <td class="p-3 font-mono font-bold text-gray-400">${c.ano}</td>
        <td class="p-3 font-semibold text-white whitespace-nowrap"><span class="inline-flex items-center gap-2">${bandeira(c.campeao)} ${c.campeao}</span></td>
        <td class="p-3 text-gray-400 whitespace-nowrap"><span class="inline-flex items-center gap-2">${bandeira(c.vice)} ${c.vice}</span></td>
        <td class="p-3 text-center font-mono text-blue-400 whitespace-nowrap">${c.placar}</td>
        <td class="p-3 text-gray-500 hidden md:table-cell">${c.sede}</td>
      </tr>`
    )
    .join("");

  container.innerHTML = `
    <div class="space-y-8">
      <div>
        <h3 class="text-sm font-mono uppercase tracking-widest text-emerald-400 mb-3">Quadro de títulos</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">${titulosHtml}</div>
      </div>

      <div>
        <h3 class="text-sm font-mono uppercase tracking-widest text-emerald-400 mb-3">Todos os campeões (1930–2026)</h3>
        <div class="overflow-x-auto bg-[#161b22] border border-[#30363d] rounded-xl">
          <table class="w-full text-left text-sm text-gray-300">
            <thead class="bg-[#0d1117] text-xs text-gray-400 uppercase border-b border-[#30363d]">
              <tr>
                <th class="p-3">Ano</th>
                <th class="p-3">Campeão</th>
                <th class="p-3">Vice</th>
                <th class="p-3 text-center">Final</th>
                <th class="p-3 hidden md:table-cell">Sede</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#30363d]">${linhas}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}

// ---------- Aba: Recordes & Estrelas ----------
function renderizarRecordes(container) {
  const maxGols = COPA_DADOS.artilheirosHistoricos[0].gols;

  let artHtml = COPA_DADOS.artilheirosHistoricos
    .map((a, i) => {
      const larg = Math.round((a.gols / maxGols) * 100);
      return `
      <div class="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2 min-w-0">
            <span class="w-5 text-center text-xs font-mono text-gray-500">${i + 1}</span>
            ${bandeira(a.pais, "w-6 h-4")}
            <div class="min-w-0">
              <div class="text-white font-bold text-sm truncate">${a.nome}</div>
              <div class="text-[10px] text-gray-500">${a.pais} · ${a.periodo}</div>
            </div>
          </div>
          <span class="text-lg font-black text-emerald-400 shrink-0 pl-2">${a.gols}</span>
        </div>
        <div class="h-1.5 bg-[#0d1117] rounded-full overflow-hidden">
          <div class="h-full bg-emerald-500/70 rounded-full" style="width:${larg}%"></div>
        </div>
      </div>`;
    })
    .join("");

  let recHtml = COPA_DADOS.recordes
    .map(
      (r) => `
      <div class="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
        <div class="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">${r.titulo}</div>
        <div class="text-white font-bold text-sm">${r.valor}</div>
        <div class="text-[11px] text-gray-500 mt-0.5">${r.detalhe}</div>
      </div>`
    )
    .join("");

  container.innerHTML = `
    <div class="space-y-8">
      <div>
        <h3 class="text-sm font-mono uppercase tracking-widest text-emerald-400 mb-3">Maiores artilheiros da história</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">${artHtml}</div>
      </div>
      <div>
        <h3 class="text-sm font-mono uppercase tracking-widest text-emerald-400 mb-3">Recordes</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">${recHtml}</div>
      </div>
    </div>`;
}

// ---------- Aba: Curiosidades ----------
function renderizarCuriosidades(container) {
  let html = COPA_DADOS.curiosidades
    .map(
      (c) => `
      <div class="bg-[#161b22] border border-[#30363d] rounded-xl p-5 hover:border-emerald-500/40 transition-all">
        <div class="flex items-start gap-3">
          <span class="text-2xl shrink-0">${c.icone}</span>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h4 class="text-white font-bold text-sm">${c.titulo}</h4>
              <span class="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.5 rounded">${c.ano}</span>
            </div>
            <p class="text-sm text-gray-400">${c.texto}</p>
          </div>
        </div>
      </div>`
    )
    .join("");

  container.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 gap-3">${html}</div>`;
}
