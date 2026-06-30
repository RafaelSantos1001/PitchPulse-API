function renderizarGrupos(container, dadosClassificacao) {
    let html = `<div class=\"grid grid-cols-1 lg:grid-cols-2 gap-8 w-full\">`;

    // Mostra só os grupos reais da fase de grupos (A, B, C...).
    // "Fase Final" é o fallback usado pra jogos do mata-mata que ainda
    // não têm grupo definido (times só confirmados depois da fase de grupos),
    // então não faz sentido aparecer numa tabela de classificação.
    Object.keys(dadosClassificacao)
        .filter(grupo => grupo !== 'Fase Final')
        .sort()
        .forEach(grupo => {
        html += `
            <div class="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-sm">
                <h3 class="text-base font-bold text-white mb-3 tracking-wide uppercase flex items-center justify-between">
                    <span>${grupo}</span>
                    <span class="text-xs font-medium text-gray-500 lowercase">api live</span>
                </h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm text-gray-300">
                        <thead class="bg-[#0d1117] text-xs text-gray-400 uppercase border-b border-[#30363d]">
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

        dadosClassificacao[grupo].forEach((time, index) => {
            // Mapeia os campos retornados pela API (backend usa prefixo "time_")
            const nomeTime = time.time_nome || time.name || time.nome || 'Desconhecido';
            const emojiTime = time.time_emoji || time.emoji || '';
            const pontosTime = time.points !== undefined ? time.points : (time.pontos !== undefined ? time.pontos : 0);

            html += `
                <tr class="hover:bg-[#21262d]/40 transition-colors">
                    <td class="p-3 text-center font-bold text-gray-400">${index + 1}</td>
                    <td class="p-3 font-semibold text-white flex items-center space-x-2">
                        <img src="${emojiTime}" alt="${nomeTime}" class="w-6 h-4 object-cover rounded-sm bg-[#0d1117]" onerror="this.style.display='none'">
                        <span class="truncate max-w-[140px] md:max-w-none">${nomeTime}</span>
                    </td>
                    <td class="p-3 text-center font-black text-blue-400">${pontosTime}</td>
                    <td class="p-3 text-center text-gray-400">${time.jogos}</td>
                    <td class="p-3 text-center font-medium ${time.saldo_gols > 0 ? 'text-green-400' : time.saldo_gols < 0 ? 'text-red-400' : 'text-gray-400'}">
                        ${time.saldo_gols > 0 ? `+${time.saldo_gols}` : time.saldo_gols}
                    </td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}