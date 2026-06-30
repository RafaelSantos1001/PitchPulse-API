function renderizarConfrontos(container, partidas) {
    let html = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">`;

    partidas.forEach(jogo => {
        let seloStatus = '';
        if (jogo.status === 0) seloStatus = `<span class="text-xs font-semibold bg-gray-800 text-gray-400 px-2 py-0.5 rounded">Encerrado</span>`;
        else if (jogo.status === 3) seloStatus = `<span class="text-xs font-semibold bg-red-950/60 text-red-400 border border-red-900/50 px-2 py-0.5 rounded animate-pulse">Ao Vivo</span>`;
        else seloStatus = `<span class="text-xs font-semibold bg-blue-950/60 text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded">Agendado</span>`;

        html += `
            <div onclick="abrirDetalheMatch(${jogo.id_match})" class="bg-[#161b22] border border-[#30363d] rounded-xl p-4 hover:border-gray-500 transition-all cursor-pointer shadow-sm relative flex flex-col justify-between">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-xs font-medium text-gray-400 tracking-wide uppercase">${jogo.grupo_nome || 'Geral'}</span>
                    ${seloStatus}
                </div>
                
                <div class="space-y-2 py-2">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-2">
                            <span>${jogo.casa_emoji || '🏳️'}</span>
                            <span class="text-sm font-semibold text-white">${jogo.casa_nome}</span>
                        </div>
                        <span class="text-sm font-black text-white">${jogo.status === 1 ? '-' : (jogo.gols_casa ?? 0)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-2">
                            <span>${jogo.fora_emoji || '🏳️'}</span>
                            <span class="text-sm font-semibold text-white">${jogo.fora_nome}</span>
                        </div>
                        <span class="text-sm font-black text-white">${jogo.status === 1 ? '-' : (jogo.gols_fora ?? 0)}</span>
                    </div>
                </div>
                
                <div class="text-[11px] text-gray-500 font-medium pt-2 mt-2 border-t border-[#21262d] text-center">
                    Clique para ver detalhes do confronto
                </div>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;

    // Injeta a estrutura base do Modal de Detalhes na página se ele não existir
    if (!document.getElementById('modal-match-detalhe')) {
        const divModal = document.createElement('div');
        divModal.id = 'modal-match-detalhe';
        divModal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm hidden p-4';
        document.body.appendChild(divModal);
    }
}

// Janela Flutuante (Detalhe Ampliado do Confronto)
function abrirDetalheMatch(idMatch) {
    const jogo = dadosCopa.partidas.find(p => p.id_match === idMatch);
    if (!jogo) return;

    const modal = document.getElementById('modal-match-detalhe');
    modal.innerHTML = `
        <div class="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div class="px-5 py-4 border-b border-[#30363d] flex justify-between items-center bg-[#21262d]">
                <h4 class="text-sm font-bold text-white uppercase tracking-wider">Detalhes da Partida</h4>
                <button onclick="fecharDetalheMatch()" class="text-gray-400 hover:text-white font-bold text-lg p-1">&times;</button>
            </div>
            <div class="p-6 space-y-6 text-center">
                <div>
                    <span class="text-xs bg-blue-900/40 text-blue-400 border border-blue-800/60 px-3 py-1 rounded-full font-bold uppercase tracking-wider">${jogo.grupo_nome || 'Fase de Grupos'}</span>
                    <p class="text-xs text-gray-500 mt-2">ID Oficial FIFA: #${jogo.id_match}</p>
                </div>

                <div class="flex items-center justify-around my-2">
                    <div class="w-5/12">
                        <span class="text-4xl block mb-2">${jogo.casa_emoji || '🏳️'}</span>
                        <span class="font-bold text-white text-base block">${jogo.casa_nome}</span>
                    </div>
                    <div class="w-2/12 flex flex-col items-center">
                        <span class="text-3xl font-black text-blue-500">${jogo.status === 1 ? 'VS' : `${jogo.gols_casa ?? 0} - ${jogo.gols_fora ?? 0}`}</span>
                    </div>
                    <div class="w-5/12">
                        <span class="text-4xl block mb-2">${jogo.fora_emoji || '🏳️'}</span>
                        <span class="font-bold text-white text-base block">${jogo.fora_nome}</span>
                    </div>
                </div>

                <div class="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 text-left space-y-2.5 text-xs text-gray-400">
                    <div class="flex justify-between"><span class="font-semibold text-gray-500">📍 Estádio:</span> <span class="text-white font-medium text-right">Lusail Stadium</span></div>
                    <div class="flex justify-between"><span class="font-semibold text-gray-500">🏁 Arbitragem:</span> <span class="text-white font-medium text-right">A Definir (FIFA)</span></div>
                    <div class="flex justify-between"><span class="font-semibold text-gray-500">⏱️ Status:</span> <span class="text-white font-medium text-right">${jogo.status === 0 ? 'Partida Encerrada' : jogo.status === 3 ? 'Em Andamento' : 'Aguardando Início'}</span></div>
                </div>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
}

function fecharDetalheMatch() {
    const modal = document.getElementById('modal-match-detalhe');
    if (modal) modal.classList.add('hidden');
}