function renderizarAoVivo(container, partidas) {
    // Validação de segurança: se partidas não for uma lista válida, ignora para não quebrar o código
    if (!partidas || !Array.isArray(partidas)) {
        return;
    }

    const jogosAoVivo = partidas.filter(p => p.status === '3');

    if (jogosAoVivo.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8 bg-[#161b22] border border-[#30363d] rounded-xl p-8 shadow-sm">
                <span class="text-2xl">📭</span>
                <h3 class="mt-2 text-xs font-mono text-gray-400">[ Nenhum jogo acontecendo ao vivo no momento ]</h3>
            </div>
        `;
        return;
    }

    let html = `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">`;
    
    jogosAoVivo.forEach(jogo => {
        const emojiCasa = jogo.casa_emoji || jogo.casa_flag || '';
        const emojiFora = jogo.fora_emoji || jogo.fora_flag || '';
        const nomeCasa = jogo.casa_nome || jogo.casa_name || 'Time Casa';
        const nomeFora = jogo.fora_nome || jogo.fora_name || 'Time Fora';
        const tempoJogo = jogo.tempo_jogo || '--:--';

        html += `
            <div class="bg-[#161b22] border border-red-900/40 rounded-xl p-5 hover:border-red-500/40 transition-all relative overflow-hidden shadow-md">
                <div class="absolute top-3 right-3 flex items-center space-x-1.5">
                    <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span class="text-[10px] font-mono text-red-500 uppercase">Ao Vivo</span>
                </div>

                <span class="text-[10px] text-gray-400 font-mono tracking-wide uppercase block mb-3">${jogo.grupo_nome || 'Fase Final'}</span>

                <div class="flex items-center justify-center space-x-2 mb-4">
                    <img src="${emojiCasa}" alt="${nomeCasa}" class="w-6 h-4 object-cover rounded-sm bg-[#0d1117]" onerror="this.style.display='none'">
                    <span class="font-bold text-white text-sm md:text-base uppercase tracking-wide truncate max-w-[35%]">${nomeCasa}</span>
                    <span class="text-gray-500 font-bold text-xs">X</span>
                    <span class="font-bold text-white text-sm md:text-base uppercase tracking-wide truncate max-w-[35%]">${nomeFora}</span>
                    <img src="${emojiFora}" alt="${nomeFora}" class="w-6 h-4 object-cover rounded-sm bg-[#0d1117]" onerror="this.style.display='none'">
                </div>

                <div class="flex items-center justify-center space-x-6 mb-4">
                    <span class="text-3xl font-black text-white">${jogo.gols_casa ?? 0}</span>
                    <span class="text-3xl font-black text-white">${jogo.gols_fora ?? 0}</span>
                </div>

                <div class="flex justify-center">
                    <span class="bg-[#0d1117] border border-red-900/40 text-red-400 text-xs font-mono font-bold px-4 py-1.5 rounded-full">
                        ${tempoJogo}
                    </span>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}