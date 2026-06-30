const CONFIG = {
    API_URL: 'http://localhost:8000',
    abaAtiva: 'grupos'
};

let dadosCopa = []; 
let dadosClassificacao = {}; 

async function iniciarApp() {
    configurarAbas();
    await carregarDados();
}

async function carregarDados() {
    try {
        const statusApi = document.getElementById('status-api');

        // 1. Busca as partidas
        const resPartidas = await fetch(`${CONFIG.API_URL}/partidas`);
        if (!resPartidas.ok) throw new Error("Erro ao carregar partidas");
        const jsonPartidas = await resPartidas.json();
        dadosCopa = Array.isArray(jsonPartidas) ? jsonPartidas : (jsonPartidas.partidas || []);
        
        // 2. Busca os grupos
        const resClassificacao = await fetch(`${CONFIG.API_URL}/classificacao`);
        if (resClassificacao.ok) {
            dadosClassificacao = await resClassificacao.json();
        }

        if (statusApi) {
            statusApi.innerText = "online_sync";
            statusApi.className = "text-[11px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-800/50 px-3 py-1 rounded-sm shadow-[0_0_10px_rgba(16,185,129,0.1)]";
        }

        renderizarAbaAtual();

    } catch (erro) {
        console.error("Erro ao conectar na API PitchPulse:", erro);
        const statusApi = document.getElementById('status-api');
        if (statusApi) {
            statusApi.innerText = "offline_error";
            statusApi.className = "text-[11px] font-mono text-red-400 bg-red-950/30 border border-red-800/50 px-3 py-1 rounded-sm";
        }
        // Mesmo em erro, limpa o esqueleto para o usuário ver o painel
        renderizarAbaAtual();
    }
}

function configurarAbas() {
    const botoes = document.querySelectorAll('[data-aba]');
    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            CONFIG.abaAtiva = botao.getAttribute('data-aba');
            renderizarAbaAtual();
        });
    });
}

function renderizarAbaAtual() {
    const containerAoVivo = document.getElementById('container-ao-vivo');
    const containerPrincipal = document.getElementById('conteudo-principal');
    const botoes = document.querySelectorAll('[data-aba]');

    botoes.forEach(b => {
        if (b.getAttribute('data-aba') === CONFIG.abaAtiva) {
            b.className = "w-full py-2.5 text-xs font-mono tracking-wider uppercase rounded-lg bg-[#161b22] text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all cursor-pointer";
        } else {
            b.className = "w-full py-2.5 text-xs font-mono tracking-wider uppercase rounded-lg text-slate-400 hover:text-white border border-transparent transition-all cursor-pointer";
        }
    });

    if (containerAoVivo) {
        containerAoVivo.innerHTML = '';
        renderizarAoVivo(containerAoVivo, dadosCopa);
    }

    if (containerPrincipal) {
        containerPrincipal.innerHTML = '';

        if (CONFIG.abaAtiva === 'grupos') {
            renderizarGrupos(containerPrincipal, dadosClassificacao);
        } else if (CONFIG.abaAtiva === 'confrontos') {
            renderizarConfrontos(containerPrincipal, dadosCopa);
        } else if (CONFIG.abaAtiva === 'chaveamento') {
            containerPrincipal.innerHTML = `
                <div class="text-center py-12 text-xs font-mono text-slate-500 uppercase tracking-widest pt-16">
                    [ ⚠️ fase de grupos em andamento / chaveamento indisponível ]
                </div>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', iniciarApp);