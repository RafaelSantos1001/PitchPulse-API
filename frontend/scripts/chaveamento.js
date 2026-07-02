function mapearFase(faseNomeOriginal) {
    if (!faseNomeOriginal || typeof faseNomeOriginal !== 'string') return null;

    const normalizado = faseNomeOriginal.toLowerCase();

    if (normalizado.includes('group') || normalizado.includes('first stage')) return null;

    if (normalizado.includes('32')) return { ordem: 1, label: 'Rodada de 32' };
    if (normalizado.includes('16')) return { ordem: 2, label: 'Oitavas de Final' };
    if (normalizado.includes('quarter')) return { ordem: 3, label: 'Quartas de Final' };
    if (normalizado.includes('semi')) return { ordem: 4, label: 'Semifinal' };
    if (normalizado.includes('third') || normalizado.includes('3rd') || normalizado.includes('bronze')) {
        return { ordem: 99, label: 'Disputa de 3º Lugar' }; // exibido à parte, não como coluna principal
    }
    if (normalizado.includes('final')) return { ordem: 5, label: 'Final' };

    return null;
}

function montarCardPartida(jogo) {
    const emojiCasa = jogo.casa_emoji || '';
    const emojiFora = jogo.fora_emoji || '';
    const nomeCasa = jogo.casa_nome || 'A Definir';
    const nomeFora = jogo.fora_nome || 'A Definir';
    const finalizado = jogo.status === 'FIN';
    const aoVivo = jogo.status === '3';

    const golsCasa = finalizado || aoVivo ? (jogo.gols_casa ?? 0) : null;
    const golsFora = finalizado || aoVivo ? (jogo.gols_fora ?? 0) : null;

    const casaVenceu = finalizado && golsCasa > golsFora;
    const foraVenceu = finalizado && golsFora > golsCasa;

    return `
        <div class="bracket-match bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 w-full">
            <div class="flex items-center justify-between gap-2 py-1">
                <div class="flex items-center gap-1.5 min-w-0">
                    <img src="${emojiCasa}" alt="${nomeCasa}" class="w-4 h-3 object-cover rounded-sm shrink-0 bg-[#0d1117]" onerror="this.style.display='none'">
                    <span class="text-xs truncate ${casaVenceu ? 'font-bold text-emerald-400' : 'text-gray-300'}">${nomeCasa}</span>
                </div>
                <span class="text-xs font-mono font-bold ${casaVenceu ? 'text-emerald-400' : 'text-gray-400'} shrink-0">${golsCasa ?? ''}</span>
            </div>
            <div class="border-t border-[#30363d]"></div>
            <div class="flex items-center justify-between gap-2 py-1">
                <div class="flex items-center gap-1.5 min-w-0">
                    <img src="${emojiFora}" alt="${nomeFora}" class="w-4 h-3 object-cover rounded-sm shrink-0 bg-[#0d1117]" onerror="this.style.display='none'">
                    <span class="text-xs truncate ${foraVenceu ? 'font-bold text-emerald-400' : 'text-gray-300'}">${nomeFora}</span>
                </div>
                <span class="text-xs font-mono font-bold ${foraVenceu ? 'text-emerald-400' : 'text-gray-400'} shrink-0">${golsFora ?? ''}</span>
            </div>
            ${aoVivo ? `<div class="text-center pt-1"><span class="text-[9px] font-mono text-red-400 uppercase animate-pulse">● Ao Vivo</span></div>` : ''}
        </div>
    `;
}

function renderizarChaveamento(container, partidas) {
    if (!partidas || !Array.isArray(partidas)) {
        container.innerHTML = '';
        return;
    }

    const fasesPorOrdem = {};
    let disputaTerceiro = [];

    partidas.forEach(jogo => {
        const fase = mapearFase(jogo.fase_nome);
        if (!fase) return;

        if (fase.ordem === 99) {
            disputaTerceiro.push(jogo);
            return;
        }

        if (!fasesPorOrdem[fase.ordem]) {
            fasesPorOrdem[fase.ordem] = { label: fase.label, jogos: [] };
        }
        fasesPorOrdem[fase.ordem].jogos.push(jogo);
    });

    const ordensDisponiveis = Object.keys(fasesPorOrdem).map(Number).sort((a, b) => a - b);

    if (ordensDisponiveis.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-xs font-mono text-slate-500 uppercase tracking-widest pt-16">
                [ ⚠️ fase de grupos em andamento / chaveamento indisponível ]
            </div>`;
        return;
    }

    ordensDisponiveis.forEach(ordem => {
        fasesPorOrdem[ordem].jogos.sort((a, b) => (a.numero_jogo ?? 0) - (b.numero_jogo ?? 0));
    });

    let html = `<div class="bracket flex gap-6 overflow-x-auto pb-4">`;

    ordensDisponiveis.forEach(ordem => {
        const fase = fasesPorOrdem[ordem];
        html += `
            <div class="bracket-round flex flex-col justify-around gap-4 shrink-0 w-56">
                <h4 class="text-center text-[10px] font-mono uppercase tracking-widest text-emerald-400 mb-1">${fase.label}</h4>
                ${fase.jogos.map(jogo => montarCardPartida(jogo)).join('')}
            </div>
        `;
    });

    html += `</div>`;

    if (disputaTerceiro.length > 0) {
        html += `
            <div class="mt-6 pt-6 border-t border-[#30363d]">
                <h4 class="text-center text-[10px] font-mono uppercase tracking-widest text-yellow-500 mb-3">Disputa de 3º Lugar</h4>
                <div class="max-w-xs mx-auto">
                    ${disputaTerceiro.map(jogo => montarCardPartida(jogo)).join('')}
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
}