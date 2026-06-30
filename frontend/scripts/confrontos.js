function renderizarConfrontos(container, partidas) {
    let html = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">`;

    partidas.forEach(jogo => {
        let seloStatus = '';
        if (jogo.status === 0) {
            seloStatus = `<span class="text-xs font-semibold bg-gray-800 text-gray-400 px-2 py-0.5 rounded">Encerrado</span>`;
        } else if (jogo.status === 3) {
            seloStatus = `<span class="text-xs font-semibold bg-red-950/60 text-red-400 border border-red-900/50 px-2 py-0.5 rounded animate-pulse">Ao Vivo</span>`;
        } else {
            seloStatus = `<span class="text-xs font-semibold bg-blue-950/60 text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded">Agendado</span>`;
        }

        // Garante compatibilidade caso venha casa_emoji ou apenas o nome padrão
        const emojiCasa = jogo.casa_emoji || jogo.casa_flag || '';
        const emojiFora = jogo.fora_emoji || jogo.fora_flag || '';
        const nomeCasa = jogo.casa_nome || jogo.casa_name || 'Time Casa';
        const nomeFora = jogo.fora_nome || jogo.fora_name || 'Time Fora';

        html += `
            <div class="bg-[#161b22] border border-[#30363d] rounded-xl p-4 hover:border-gray-500 transition-all shadow-sm relative flex flex-col justify-between">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-xs font-medium text-gray-400 tracking-wide uppercase">${jogo.grupo_nome || 'Fase Final'}</span>
                    ${seloStatus}
                </div>

                <div class="flex items-center justify-between text-center my-4 space-x-2">
                    <div class="w-5/12">
                        <img src="${emojiCasa}" alt="${nomeCasa}" class="w-14 h-9 object-cover rounded-sm mb-2 mx-auto bg-[#0d1117]" onerror="this.style.display='none'">
                        <span class="font-bold text-white text-base block truncate">${nomeCasa}</span>
                    </div>
                    <div class="w-2/12 flex items-center justify-center">
                        <span class="text-3xl font-black text-blue-500">${jogo.status === 1 ? 'VS' : `${jogo.gols_casa ?? 0} - ${jogo.gols_fora ?? 0}`}</span>
                    </div>
                    <div class="w-5/12">
                        <img src="${emojiFora}" alt="${nomeFora}" class="w-14 h-9 object-cover rounded-sm mb-2 mx-auto bg-[#0d1117]" onerror="this.style.display='none'">
                        <span class="font-bold text-white text-base block truncate">${nomeFora}</span>
                    </div>
                </div>

                <div class="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 text-left space-y-2.5 text-xs text-gray-400">
                    <div class="flex justify-between"><span class="font-semibold text-gray-500">📍 Estádio:</span> <span class="text-white font-medium text-right truncate max-w-[180px]">${jogo.estadio || 'A Definir'}</span></div>
                    <div class="flex justify-between"><span class="font-semibold text-gray-500">⏱️ Status:</span> <span class="text-white font-medium text-right">${jogo.status === 0 ? 'Partida Encerrada' : jogo.status === 3 ? 'Em Andamento' : 'Aguardando Início'}</span></div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}