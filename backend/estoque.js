const API_BASE_URL = window.location.origin;

// Elementos do DOM
const toast = document.getElementById('toast');
const listaItens = document.getElementById('listaItens');
const estoqueVazio = document.getElementById('estoqueVazio');
const filtroCondicao = document.getElementById('filtroCondicao');
const filtroBusca = document.getElementById('filtroBusca');
const filtroDataInicio = document.getElementById('filtroDataInicio');
const filtroDataFim = document.getElementById('filtroDataFim');

// Estatísticas
const totalItensElement = document.getElementById('totalItens');
const itensBomElement = document.getElementById('itensBom');
const itensMedioElement = document.getElementById('itensMedio');
const itensRuimElement = document.getElementById('itensRuim');

// Função para mostrar Toast
function mostrarToast(mensagem, tipo = 'sucesso') {
  const conteudo = document.getElementById('toastConteudo');
  const icone = tipo === 'sucesso' ? '✅' : '❌';
  const corClasse = tipo === 'sucesso' ? 'text-green-400' : 'text-red-400';

  conteudo.innerHTML = `
    <span class="mr-3 text-xl ${corClasse}">${icone}</span>
    <span class="text-white">${mensagem}</span>
  `;
  toast.className = `fixed top-4 right-4 z-50 glass-effect rounded-lg shadow-lg p-4 max-w-sm w-full mx-4 transition-all duration-300 opacity-100 transform translate-x-0`;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-x-full');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 4000);
}

// Função para filtrar estoque
function filtrarEstoque() {
  carregarEstoque();
}

// Função para carregar/atualizar o estoque da API
async function carregarEstoque() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/item`);

    if (!response.ok) {
      mostrarToast('Erro ao carregar itens', 'erro');
      return;
    }

    const itens = await response.json();

    // Aplicar filtros
    const condicaoFiltro = filtroCondicao.value;
    const buscaFiltro = filtroBusca.value.toLowerCase();
    const dataInicio = filtroDataInicio.value;
    const dataFim = filtroDataFim.value;

    let itensFiltrados = itens.filter(item => {
      // Filtro por condição
      const condicaoMatch = condicaoFiltro === 'todos' || item.condicao === condicaoFiltro;

      // ✅ Fix: descricao pode ser null
      const buscaMatch =
        (item.nome || '').toLowerCase().includes(buscaFiltro) ||
        (item.descricao || '').toLowerCase().includes(buscaFiltro) ||
        (item.codigo || '').toLowerCase().includes(buscaFiltro);

      // Filtro por data
      let dataMatch = true;
      if (dataInicio) {
        const itemData = new Date(item.data_entrada);
        const inicioData = new Date(dataInicio);
        dataMatch = dataMatch && itemData >= inicioData;
      }
      if (dataFim) {
        const itemData = new Date(item.data_entrada);
        const fimData = new Date(dataFim);
        fimData.setHours(23, 59, 59, 999);
        dataMatch = dataMatch && itemData <= fimData;
      }

      return condicaoMatch && buscaMatch && dataMatch;
    });

    // Atualizar estatísticas (sempre com base em todos os itens, não só filtrados)
    atualizarEstatisticas(itens);

    // Limpa a lista anterior
    listaItens.innerHTML = '';

    if (itensFiltrados.length === 0) {
      listaItens.classList.add('hidden');
      estoqueVazio.classList.remove('hidden');
      return;
    }

    listaItens.classList.remove('hidden');
    estoqueVazio.classList.add('hidden');

    // Cria cards
    itensFiltrados.forEach((item) => {
      let corBadge = '';
      let iconeBadge = '';
      let condicaoTexto = '';

      switch (item.condicao) {
        case 'bom':
          corBadge = 'bg-green-500/20 text-green-400 border-green-500/30';
          iconeBadge = 'fa-check-circle';
          condicaoTexto = 'Bom';
          break;
        case 'medio':
          corBadge = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
          iconeBadge = 'fa-exclamation-triangle';
          condicaoTexto = 'Médio';
          break;
        case 'ruim':
          corBadge = 'bg-red-500/20 text-red-400 border-red-500/30';
          iconeBadge = 'fa-times-circle';
          condicaoTexto = 'Ruim';
          break;
        default:
          corBadge = 'bg-gray-500/20 text-gray-400 border-gray-500/30';
          iconeBadge = 'fa-question-circle';
          condicaoTexto = 'Não definida';
      }

      const card = document.createElement('div');
      card.className = 'glass-effect rounded-xl p-4 card-hover';
      card.innerHTML = `
        <div class="w-full h-40 rounded-lg mb-4 placeholder-image">
          <span>IMAGEM DO PRODUTO</span>
        </div>
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-bold text-white text-lg truncate flex-1 mr-2">${item.nome}</h3>
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${corBadge}">
            <i class="fas ${iconeBadge} mr-1"></i>${condicaoTexto}
          </span>
        </div>
        <p class="text-gray-400 text-sm mb-3 line-clamp-2">${item.descricao || 'Sem descrição'}</p>
        <div class="flex justify-between items-center text-sm text-gray-500">
          <span class="bg-gray-800 px-2 py-1 rounded">Código: ${item.codigo}</span>
          <span class="bg-gray-800 px-2 py-1 rounded">${new Date(item.data_entrada).toLocaleDateString('pt-BR')}</span>
        </div>
      `;
      listaItens.appendChild(card);
    });

  } catch (error) {
    console.error('Erro ao carregar estoque:', error);
    mostrarToast('Erro ao conectar com o servidor', 'erro');
  }
}

// Função para atualizar estatísticas
function atualizarEstatisticas(itens) {
  totalItensElement.textContent = itens.length;
  itensBomElement.textContent = itens.filter(i => i.condicao === 'bom').length;
  itensMedioElement.textContent = itens.filter(i => i.condicao === 'medio').length;
  itensRuimElement.textContent = itens.filter(i => i.condicao === 'ruim').length;
}

// Carrega o estoque ao inicializar a página
window.onload = () => {
  // ✅ Sem datas padrão — exibe todos os itens ao abrir
  filtroDataInicio.value = '';
  filtroDataFim.value = '';

  carregarEstoque();

  // Toggle Sidebar Mobile
  document.getElementById('toggleSidebar').addEventListener('click', () => {
    const sidebar = document.querySelector('aside');
    sidebar.classList.toggle('hidden');
  });

  // Adicionar classe active ao item do menu atual
  document.querySelectorAll('.sidebar-item').forEach(item => {
    if (item.getAttribute('href') === 'estoque.html') {
      item.classList.add('active');
    }
  });
};