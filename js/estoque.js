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

// Função para carregar/atualizar o estoque do localStorage
function carregarEstoque() {
  let itens = JSON.parse(localStorage.getItem("itens")) || [];
  
  // Aplicar filtros
  const condicaoFiltro = filtroCondicao.value;
  const buscaFiltro = filtroBusca.value.toLowerCase();
  const dataInicio = filtroDataInicio.value;
  const dataFim = filtroDataFim.value;
  
  let itensFiltrados = itens.filter(item => {
    // Filtro por condição
    const condicaoMatch = condicaoFiltro === 'todos' || item.condicao === condicaoFiltro;
    
    // Filtro por busca (nome, código ou descrição)
    const buscaMatch = item.nome.toLowerCase().includes(buscaFiltro) || 
                      item.descricao.toLowerCase().includes(buscaFiltro) ||
                      item.codigo.toLowerCase().includes(buscaFiltro);
    
    // Filtro por data
    let dataMatch = true;
    if (dataInicio) {
      const itemData = new Date(item.data);
      const inicioData = new Date(dataInicio);
      dataMatch = dataMatch && itemData >= inicioData;
    }
    if (dataFim) {
      const itemData = new Date(item.data);
      const fimData = new Date(dataFim);
      fimData.setHours(23, 59, 59, 999); // Fim do dia
      dataMatch = dataMatch && itemData <= fimData;
    }
    
    return condicaoMatch && buscaMatch && dataMatch;
  });

  // Atualizar estatísticas
  atualizarEstatisticas(itensFiltrados);

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
    // Cor da condição para badge
    let corBadge = '';
    let iconeBadge = '';
    switch (item.condicao) {
      case 'bom': 
        corBadge = 'bg-green-500/20 text-green-400 border-green-500/30'; 
        iconeBadge = 'fa-check-circle';
        break;
      case 'medio': 
        corBadge = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'; 
        iconeBadge = 'fa-exclamation-triangle';
        break;
      case 'ruim': 
        corBadge = 'bg-red-500/20 text-red-400 border-red-500/30'; 
        iconeBadge = 'fa-times-circle';
        break;
      default: 
        corBadge = 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        iconeBadge = 'fa-question-circle';
    }

    const card = document.createElement('div');
    card.className = 'glass-effect rounded-xl p-4 card-hover';
    card.innerHTML = `
      <!-- Imagem Placeholder -->
      <div class="w-full h-40 rounded-lg mb-4 placeholder-image">
        <span>IMAGEM DO PRODUTO</span>
      </div>
      
      <div class="flex justify-between items-start mb-2">
        <h3 class="font-bold text-white text-lg truncate flex-1 mr-2">${item.nome}</h3>
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${corBadge}">
          <i class="fas ${iconeBadge} mr-1"></i>${item.condicao.charAt(0).toUpperCase() + item.condicao.slice(1)}
        </span>
      </div>
      
      <p class="text-gray-400 text-sm mb-3 line-clamp-2">${item.descricao}</p>
      
      <div class="flex justify-between items-center text-sm text-gray-500">
        <span class="bg-gray-800 px-2 py-1 rounded">Código: ${item.codigo}</span>
        <span class="bg-gray-800 px-2 py-1 rounded">${new Date(item.data).toLocaleDateString('pt-BR')}</span>
      </div>
    `;
    listaItens.appendChild(card);
  });
}

// Função para atualizar estatísticas
function atualizarEstatisticas(itens) {
  const total = itens.length;
  const bom = itens.filter(item => item.condicao === 'bom').length;
  const medio = itens.filter(item => item.condicao === 'medio').length;
  const ruim = itens.filter(item => item.condicao === 'ruim').length;

  totalItensElement.textContent = total;
  itensBomElement.textContent = bom;
  itensMedioElement.textContent = medio;
  itensRuimElement.textContent = ruim;
}

// Toggle da Sidebar para Mobile
const toggleButton = document.getElementById('toggleSidebar');
const sidebar = document.querySelector('aside');

toggleButton.addEventListener('click', () => {
  sidebar.classList.toggle('hidden');
});

// Configurar datas padrão para os filtros
function configurarFiltrosData() {
  const hoje = new Date();
  const umaSemanaAtras = new Date();
  umaSemanaAtras.setDate(hoje.getDate() - 7);
  
  // Formatar datas para input type="date"
  const formatarData = (data) => {
    return data.toISOString().split('T')[0];
  };
  
  filtroDataInicio.value = formatarData(umaSemanaAtras);
  filtroDataFim.value = formatarData(hoje);
}

// Carrega o estoque ao inicializar a página
window.onload = () => {
  configurarFiltrosData();
  carregarEstoque();
  
  // Adicionar classe active ao item do menu atual
  const menuItems = document.querySelectorAll('.sidebar-item');
  menuItems.forEach(item => {
    if (item.getAttribute('href') === 'estoque.html') {
      item.classList.add('active');
    }
  });
};