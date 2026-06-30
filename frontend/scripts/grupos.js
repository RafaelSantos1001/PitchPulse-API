function renderizarGrupos(container, partidas) {
    const grupos = {};

    // Processa os dados das partidas para gerar as estatísticas das tabelas
    partidas.forEach(jogo => {
        const grupo = jogo.grupo_nome;
        if (!grupo) return;

        if (!grupos[grupo]) grupos[grupo] = {};

        const inicializarTime = (nome, emoji) => {
            if (!grupos[grupo][nome]) {
                grupos[grupo][nome] = { nome, emoji, pontos: 0, jogos: 0, gols_pro: 0, gols_contra: 0, saldo_gols: 0 };
            }
        };

        inicializarTime(jogo.casa_nome, jogo.casa_emoji);
        inicializarTime(jogo.fora_nome, jogo.fora_emoji);

        // Apenas contabiliza jogos já iniciados ou encerrados (status 0 ou 3)
        if (jogo.status === 0 || jogo.status === 3) {
            const tCasa = grupos[grupo][jogo.casa_nome];
            const tFora = grupos[grupo][jogo.fora_nome];
            const gCasa = jogo.gols_casa ?? 0;
            const gFora = jogo.gols_fora ?? 0;

            tCasa.jogos++;
            tCasa.gols_pro += gCasa;
            tCasa.gols_contra += gFora;

            tFora.jogos++;
            tFora.gols_pro += gFora;
            tFora.gols_contra += gCasa;

            if (gCasa > gFora) {
                tCasa.pontos += 3;
            } else if (gFora > gCasa) {
                tFora.pontos += 3;
            } else {
                tCasa.pontos += 1;
                tFora.pontos += 1;
            }
            
            tCasa.saldo_gols = tCasa.gols_pro - tCasa.gols_contra;
            tFora.saldo_gols = tFora.gols_pro - tFora.gols_contra;
        }
    });

    let html = `<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">`;

    // Ordena os grupos alfabeticamente e renderiza as tabelas
    Object.keys(grupos).sort().forEach(nomeGrupo => {
        const timesOrdenados = Object.values(grupos[nomeGrupo]).sort((a, b) => {
            if (b.pontos !== a.pontos) return b.pontos - a.pontos;
            if (b.saldo_gols !== a.saldo_gols) return b.saldo_gols - a.saldo_gols;
            return b.gols_pro - a.gols_pro;
        });

        html += `
            <div class="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-sm">
                <div class="bg-[#21262d] px-4 py-3 border-b border-[#30363d]">
                    <h3 class="font-bold text-white tracking-wide uppercase text-sm">${nomeGrupo}</h3>
                </div>
                <table class="w-full text-left text-sm text-gray-300">
                    <thead class="bg-[#161b22] text-xs text-gray-400 uppercase border-b border-[#30363d]">
                        <tr>
                            <th class="p-3 w-12 text-center">Pos</th>
                            <th class="p-3">Seleção</th>
                            <th class="p-3 text-center w-12">P</th>
                            <th class="p-3 text-center w-12">J</th>
                            <th class="p-3 text-center w-12">SG</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-[#30363d]">
        `;

        timesOrdenados.forEach((time, index) => {
            html += `
                <tr class="hover:bg-[#21262d]/40 transition-colors">
                    <td class="p-3 text-center font-bold text-gray-400">${index + 1}</td>
                    <td class="p-3 font-semibold text-white flex items-center space-x-2">
                        <span>${time.emoji || '🏳️'}</span>
                        <span class="truncate max-w-[140px] md:max-w-none">${time.nome}</span>
                    </td>
                    <td class="p-3 text-center font-black text-blue-400">${time.pontos}</td>
                    <td class="p-3 text-center text-gray-400">${time.jogos}</td>
                    <td class="p-3 text-center font-medium ${time.saldo_gols > 0 ? 'text-green-400' : time.saldo_gols < 0 ? 'text-red-400' : 'text-gray-400'}">${time.saldo_gols}</td>
                </tr>
            `;
        });

        html += `</tbody></table></div>`;
    });

    html += `</div>`;
    container.innerHTML = html;
}