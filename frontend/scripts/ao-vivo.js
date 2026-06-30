function renderizarAoVivo(container, partidas) {
    // Validação de segurança: se partidas não for uma lista válida, ignora para não quebrar o código
    if (!partidas || !Array.isArray(partidas)) {
        return;
    }

    const jogosAoVivo = partidas.filter(p => p.status === 3);

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

        html += `
            <div class="bg-[#161b22] border border-red-900/40 rounded-xl p-5 hover:border-red-500/40 transition-all relative overflow-hidden shadow-md">
                <div class="absolute top-3 right-3 flex items-center space-x-1.5">
                    <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span class="text-[10px] font-mono text-red-500 uppercase">${jogo.tempo_jogo ? jogo.tempo_jogo : "Ao Vivo"}</span>
                </div>
                
                <span class="text-[10px] text-gray-400 font-mono tracking-wide uppercase block mb-3">${jogo.grupo_nome || 'Fase Final'}</span>
                
                <div class="flex items-center justify-between my-4">
                    <div class="flex flex-col items-center w-5/12 text-center">
                        <img src="${emojiCasa}" alt="${nomeCasa}" class="w-10 h-7 object-cover rounded-sm mb-1 bg-[#0d1117]" onerror="this.style.display='none'">
                        <span class="font-bold text-white text-sm md:text-base truncate w-full">${nomeCasa}</span>
                    </div>
                    
                    <div class="flex items-center justify-center space-x-3 w-2/12">
                        <span class="text-2xl font-black text-white">${jogo.gols_casa ?? 0}</span>
                        <span class="text-gray-600 font-bold text-xs">X</span>
                        <span class="text-2xl font-black text-white">${jogo.gols_fora ?? 0}</span>
                    </div>
                    
                    <div class="flex flex-col items-center w-5/12 text-center">
                        <img src="${emojiFora}" alt="${nomeFora}" class="w-10 h-7 object-cover rounded-sm mb-1 bg-[#0d1117]" onerror="this.style.display='none'">
                        <span class="font-bold text-white text-sm md:text-base truncate w-full">${nomeFora}</span>
                    </div>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}