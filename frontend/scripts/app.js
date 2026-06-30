// Estado Global da Aplicação
const CONFIG = {
    API_URL: 'http://localhost:8000',
    abaAtiva: 'ao-vivo' // Aba padrão inicial
};

let dadosCopa = { total_partidas: 0, partidas: [] };

// Inicialização automatizada
async function iniciarApp() {
    configurarAbas();
    await carregarDados();
}

// Coleta os dados da API local
async function carregarDados() {
    try {
        const resposta = await fetch(`${CONFIG.API_URL}/partidas`);
        if (!resposta.ok) throw new Error("Erro na requisição");
        
        dadosCopa = await resposta.json();
        
        const statusApi = document.getElementById('status-api');
        if (statusApi) {
            statusApi.innerText = "Conectado";
            statusApi.className = "text-xs text-green-400 bg-green-950/50 border border-green-800 px-3 py-1 rounded-md";
        }

        // Renderiza a aba atual
        renderizarAbaAtual();

    } catch (erro) {
        console.error("Erro ao conectar na API PitchPulse:", erro);
        const statusApi = document.getElementById('status-api');
        if (statusApi) {
            statusApi.innerText = "Erro de Conexão";
            statusApi.className = "text-xs text-red-400 bg-red-950/50 border border-red-800 px-3 py-1 rounded-md";
        }
    }
}

// Configura os ouvintes de cliques nos botões de abas
function configurarAbas() {
    const botoes = document.querySelectorAll('[data-aba]');
    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            botoes.forEach(b => b.classList.remove('border-blue-500', 'text-blue-500'));
            botao.classList.add('border-blue-500', 'text-blue-500');
            
            CONFIG.abaAtiva = Math.abs(botao.getAttribute('data-aba')) ? 'ao-vivo' : botao.getAttribute('data-aba');
            
            // Tratamento simplificado para ler o atributo customizado
            CONFIG.abaAtiva = botao.getAttribute('data-aba');
            renderizarAbaAtual();
        });
    });
}

// Distribui a responsabilidade de renderização
function renderizarAbaAtual() {
    const container = document.getElementById('conteudo-principal');
    if (!container) return;

    container.innerHTML = ''; // Limpa a área de conteúdo

    if (CONFIG.abaAtiva === 'ao-vivo') {
        renderizarAoVivo(container, dadosCopa.partidas);
    } else if (CONFIG.abaAtiva === 'grupos') {
        renderizarGrupos(container, dadosCopa.partidas);
    } else if (CONFIG.abaAtiva === 'confrontos') {
        renderizarConfrontos(container, dadosCopa.partidas);
    }
}

document.addEventListener('DOMContentLoaded', iniciarApp);