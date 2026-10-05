const CONFIG = {
    API_URL: 'https://pitchpulse-api-5eer.onrender.com',
    abaAtiva: 'copa2026',
    INTERVALO_ATUALIZACAO_MS: 60 * 1000 // busca dados novos a cada 1 minuto
};

let dadosCopa = [];
let dadosClassificacao = {};

// Abas com conteúdo estático (não dependem do backend)
const ABAS_ESTATICAS = ['copa2026', 'historia', 'recordes', 'curiosidades'];

async function iniciarApp() {
    configurarAbas();
    renderizarAbaAtual();          // mostra conteúdo (Copa 2026) imediatamente
    await carregarDados();         // tenta buscar dados ao vivo, se houver
    iniciarAtualizacaoAutomatica();
}

function iniciarAtualizacaoAutomatica() {
    setInterval(() => {
        // só vale a pena buscar dados ao vivo nas abas que os usam
        if (!ABAS_ESTATICAS.includes(CONFIG.abaAtiva)) carregarDados();
    }, CONFIG.INTERVALO_ATUALIZACAO_MS);
}

function definirStatus(texto, tipo) {
    const statusApi = document.getElementById('status-api');
    if (!statusApi) return;
    statusApi.innerText = texto;
    if (tipo === 'online') {
        statusApi.className = "text-[11px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-800/50 px-3 py-1 rounded-sm shadow-[0_0_10px_rgba(16,185,129,0.1)]";
    } else {
        // estado neutro: a Copa está encerrada, não é um erro
        statusApi.className = "text-[11px] font-mono text-slate-400 bg-[#161f28] border border-slate-800 px-3 py-1 rounded-sm";
    }
}

async function carregarDados() {
    try {
        const resPartidas = await fetch(`${CONFIG.API_URL}/partidas`);
        if (!resPartidas.ok) throw new Error("Sem dados ao vivo");
        const jsonPartidas = await resPartidas.json();
        dadosCopa = Array.isArray(jsonPartidas) ? jsonPartidas : (jsonPartidas.partidas || []);

        const resClassificacao = await fetch(`${CONFIG.API_URL}/classificacao`);
        if (resClassificacao.ok) {
            dadosClassificacao = await resClassificacao.json();
        }

        definirStatus("online_sync", 'online');
        renderizarAbaAtual();
    } catch (erro) {
        console.warn("Sem dados ao vivo no momento:", erro.message);
        definirStatus("modo_arquivo", 'neutro');
        renderizarAbaAtual();
    }
}

function configurarAbas() {
    document.querySelectorAll('[data-aba]').forEach(botao => {
        botao.addEventListener('click', () => {
            CONFIG.abaAtiva = botao.getAttribute('data-aba');
            renderizarAbaAtual();
        });
    });
}

function atualizarBotoesAbas() {
    document.querySelectorAll('[data-aba]').forEach(b => {
        const base = b.className.includes('min-w-[80px]') ? 'min-w-[80px]' : 'min-w-[88px]';
        if (b.getAttribute('data-aba') === CONFIG.abaAtiva) {
            b.className = `flex-1 ${base} py-2.5 px-3 text-xs font-mono tracking-wider uppercase rounded-lg bg-[#161b22] text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all cursor-pointer`;
        } else {
            b.className = `flex-1 ${base} py-2.5 px-3 text-xs font-mono tracking-wider uppercase rounded-lg text-slate-400 hover:text-white border border-transparent transition-all cursor-pointer`;
        }
    });
}

function renderizarAbaAtual() {
    atualizarBotoesAbas();

    const secaoAoVivo = document.getElementById('secao-ao-vivo');
    const containerAoVivo = document.getElementById('container-ao-vivo');
    const container = document.getElementById('conteudo-principal');

    // Seção "Ao Vivo" só aparece quando há jogos acontecendo
    const jogosAoVivo = (dadosCopa || []).filter(p => p.status === '3');
    if (secaoAoVivo) secaoAoVivo.style.display = jogosAoVivo.length ? '' : 'none';
    if (containerAoVivo && jogosAoVivo.length) {
        containerAoVivo.innerHTML = '';
        renderizarAoVivo(containerAoVivo, dadosCopa);
    }

    if (!container) return;
    container.innerHTML = '';
    const aba = CONFIG.abaAtiva;

    // Abas estáticas (enciclopédia)
    if (aba === 'copa2026') return renderizarCopa2026(container);
    if (aba === 'historia') return renderizarHistoria(container);
    if (aba === 'recordes') return renderizarRecordes(container);
    if (aba === 'curiosidades') return renderizarCuriosidades(container);

    // Abas "ao vivo": se não há dados, mostra aviso amigável
    const temDados = (aba === 'grupos')
        ? Object.keys(dadosClassificacao || {}).length > 0
        : (dadosCopa || []).length > 0;

    if (!temDados) return bannerCopaEncerrada(container);

    if (aba === 'grupos') renderizarGrupos(container, dadosClassificacao);
    else if (aba === 'confrontos') renderizarConfrontos(container, dadosCopa);
    else if (aba === 'chaveamento') renderizarChaveamento(container, dadosCopa);
}

document.addEventListener('DOMContentLoaded', iniciarApp);
