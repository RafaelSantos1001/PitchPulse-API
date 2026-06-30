function renderizarAoVivo(container, partidas) {
    // Filtra apenas jogos ao vivo (Status 3)
    const jogosAoVivo = partidas.filter(p => p.status === 3);

    if (jogosAoVivo.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12 bg-[#161b22] border border-[#30363d] rounded-xl p-8 shadow-sm">
                <span class="text-4xl">📭</span>
                <h3 class="mt-4 text-lg font-bold text-white">Nenhum jogo acontecendo ao vivo</h3>
                <p class="text-sm text-gray-400 mt-1">Fique de olho! Assim que uma bola rolar, o placar em tempo real aparecerá aqui.</p>
            </div>
        `;
        return;
    }

    // Renderiza a lista de jogos ativos
    let html = `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">`;
    jogosAoVivo.forEach(jogo => {
        html += `
            <div class="bg-[#161b22] border border-red-900/40 rounded-xl p-5 hover:border-red-500/40 transition-all relative overflow-hidden shadow-md">
                <div class="absolute top-3 right-3 flex items-center space-x-1.5">
                    <span class="flex h-2 w-2 relative">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span class="text-xs font-bold uppercase tracking-wider text-red-500">Ao Vivo</span>
                </div>
                
                <span class="text-xs text-gray-400 font-medium tracking-wide uppercase block mb-3">${jogo.grupo_nome || 'Geral'}</span>
                
                <div class="flex items-center justify-between my-4">
                    <div class="flex flex-col items-center w-5/12 text-center">
                        <span class="text-3xl mb-1">${jogo.casa_emoji || '🏳️'}</span>
                        <span class="font-bold text-white text-sm md:text-base truncate w-full">${jogo.casa_nome}</span>
                    </div>
                    
                    <div class="flex items-center justify-center space-x-3 w-2/12">
                        <span class="text-2xl font-black text-white">${jogo.gols_casa ?? 0}</span>
                        <span class="text-gray-600 font-bold text-xs">X</span>
                        <span class="text-2xl font-black text-white">${jogo.gols_fora ?? 0}</span>
                    </div>
                    
                    <div class="flex flex-col items-center w-5/12 text-center">
                        <span class="text-3xl mb-1">${jogo.fora_emoji || '🏳️'}</span>
                        <span class="font-bold text-white text-sm md:text-base truncate w-full">${jogo.fora_nome}</span>
                    </div>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
}