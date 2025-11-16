// Elementos do DOM
const toast = document.getElementById('toast');
const modalConfirmacao = document.getElementById('modalConfirmacao');
const modalMensagem = document.getElementById('modalMensagem');
const btnConfirmar = document.getElementById('btnConfirmar');
const btnCancelar = document.getElementById('btnCancelar');

// Elementos de filtro - Mes
const filtroNomeMes = document.getElementById('filtroNomeMes');
const filtroCondicaoMes = document.getElementById('filtroCondicaoMes');
const filtroDataInicioMes = document.getElementById('filtroDataInicioMes');
const filtroDataFimMes = document.getElementById('filtroDataFimMes');
const listaVaziaMes = document.getElementById('listaVaziaMes');

// Elementos de filtro - Saída
const filtroNomeSaida = document.getElementById('filtroNomeSaida');
const filtroCondicaoSaida = document.getElementById('filtroCondicaoSaida');
const filtroDataInicioSaida = document.getElementById('filtroDataInicioSaida');
const filtroDataFimSaida = document.getElementById('filtroDataFimSaida');
const listaVaziaSaida = document.getElementById('listaVaziaSaida');

// Variáveis para armazenar dados filtrados
let itensFiltradosMes = [];
let itensFiltradosSaida = [];

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

// Função para mostrar Modal de Confirmação
function confirmarAcao(mensagem, callback) {
  modalMensagem.textContent = mensagem;
  modalConfirmacao.classList.remove('hidden');

  const confirmarHandler = () => {
    modalConfirmacao.classList.add('hidden');
    btnConfirmar.removeEventListener('click', confirmarHandler);
    btnCancelar.removeEventListener('click', cancelarHandler);
    callback(true);
  };

  const cancelarHandler = () => {
    modalConfirmacao.classList.add('hidden');
    btnConfirmar.removeEventListener('click', confirmarHandler);
    btnCancelar.removeEventListener('click', cancelarHandler);
    callback(false);
  };

  btnConfirmar.addEventListener('click', confirmarHandler);
  btnCancelar.addEventListener('click', cancelarHandler);
}

// Fecha modal ao clicar fora
document.addEventListener('click', (e) => {
  if (e.target === modalConfirmacao) modalConfirmacao.classList.add('hidden');
});

// Configurar datas padrão para os filtros
function configurarFiltrosData() {
  const hoje = new Date();
  const umMesAtras = new Date();
  umMesAtras.setMonth(hoje.getMonth() - 1);
  
  const formatarData = (data) => {
    return data.toISOString().split('T')[0];
  };
  
  // Definir valores padrão para o último mês
  filtroDataInicioMes.value = formatarData(umMesAtras);
  filtroDataFimMes.value = formatarData(hoje);
  filtroDataInicioSaida.value = formatarData(umMesAtras);
  filtroDataFimSaida.value = formatarData(hoje);
}

// Funções de filtro - Itens Cadastrados
function filtrarRelatorioMes() {
  const nomeFiltro = filtroNomeMes.value.toLowerCase();
  const condicaoFiltro = filtroCondicaoMes.value;
  const dataInicio = filtroDataInicioMes.value;
  const dataFim = filtroDataFimMes.value;
  
  let itens = JSON.parse(localStorage.getItem("itens")) || [];
  
  itensFiltradosMes = itens.filter(item => {
    // Filtro por nome
    const nomeMatch = !nomeFiltro || 
                     item.nome.toLowerCase().includes(nomeFiltro) || 
                     item.codigo.toLowerCase().includes(nomeFiltro);
    
    // Filtro por condição
    const condicaoMatch = condicaoFiltro === 'todos' || item.condicao === condicaoFiltro;
    
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
      fimData.setHours(23, 59, 59, 999);
      dataMatch = dataMatch && itemData <= fimData;
    }
    
    return nomeMatch && condicaoMatch && dataMatch;
  });
  
  atualizarRelatorioMes();
  mostrarToast(`Filtro aplicado: ${itensFiltradosMes.length} itens encontrados`);
}

function limparFiltrosMes() {
  filtroNomeMes.value = '';
  filtroCondicaoMes.value = 'todos';
  filtroDataInicioMes.value = '';
  filtroDataFimMes.value = '';
  itensFiltradosMes = [];
  atualizarRelatorioMes();
  mostrarToast('Filtros limpos');
}

// Funções de filtro - Itens Removidos
function filtrarRelatorioSaida() {
  const nomeFiltro = filtroNomeSaida.value.toLowerCase();
  const condicaoFiltro = filtroCondicaoSaida.value;
  const dataInicio = filtroDataInicioSaida.value;
  const dataFim = filtroDataFimSaida.value;
  
  let removidos = JSON.parse(localStorage.getItem("removidos")) || [];
  
  itensFiltradosSaida = removidos.filter(item => {
    // Filtro por nome
    const nomeMatch = !nomeFiltro || 
                     item.nome.toLowerCase().includes(nomeFiltro) || 
                     item.codigo.toLowerCase().includes(nomeFiltro);
    
    // Filtro por condição
    const condicaoMatch = condicaoFiltro === 'todos' || item.condicao === condicaoFiltro;
    
    // Filtro por data de saída
    let dataMatch = true;
    if (dataInicio) {
      const itemData = new Date(item.dataSaida);
      const inicioData = new Date(dataInicio);
      dataMatch = dataMatch && itemData >= inicioData;
    }
    if (dataFim) {
      const itemData = new Date(item.dataSaida);
      const fimData = new Date(dataFim);
      fimData.setHours(23, 59, 59, 999);
      dataMatch = dataMatch && itemData <= fimData;
    }
    
    return nomeMatch && condicaoMatch && dataMatch;
  });
  
  atualizarRelatorioSaida();
  mostrarToast(`Filtro aplicado: ${itensFiltradosSaida.length} itens encontrados`);
}

function limparFiltrosSaida() {
  filtroNomeSaida.value = '';
  filtroCondicaoSaida.value = 'todos';
  filtroDataInicioSaida.value = '';
  filtroDataFimSaida.value = '';
  itensFiltradosSaida = [];
  atualizarRelatorioSaida();
  mostrarToast('Filtros limpos');
}

// Inicialização
window.onload = () => {
  configurarFiltrosData();
  filtrarRelatorioMes();
  filtrarRelatorioSaida();

  // Toggle da Sidebar para Mobile
  const toggleButton = document.getElementById('toggleSidebar');
  const sidebar = document.querySelector('aside');

  toggleButton.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
  });

  // Adicionar classe active ao item do menu atual
  const menuItems = document.querySelectorAll('.sidebar-item');
  menuItems.forEach(item => {
    if (item.getAttribute('href') === 'relatorios.html') {
      item.classList.add('active');
    }
  });
};

function atualizarRelatorioMes() {
  let itens = JSON.parse(localStorage.getItem("itens")) || [];
  const tbody = document.querySelector("#tabelaRelatorioMes tbody");
  tbody.innerHTML = "";

  // Usar itens filtrados se houver filtro ativo, senão todos os itens
  const itensParaExibir = itensFiltradosMes.length > 0 ? itensFiltradosMes : itens;

  if (itensParaExibir.length === 0) {
    tbody.classList.add('hidden');
    listaVaziaMes.classList.remove('hidden');
    return;
  }

  tbody.classList.remove('hidden');
  listaVaziaMes.classList.add('hidden');

  itensParaExibir.forEach((item, indexOriginal) => {
    // Encontrar o índice original no array completo
    const indexCompleto = itens.findIndex(i => i.codigo === item.codigo && i.data === item.data);
    const tr = document.createElement("tr");
    tr.className = 'hover:bg-gray-800/50 transition-colors';

    // Formatação da condição
    let condicaoTexto = '';
    let corBadge = '';
    let iconeBadge = '';
    
    switch (item.condicao) {
      case 'bom':
        condicaoTexto = 'Bom';
        corBadge = 'bg-green-500/20 text-green-400 border-green-500/30';
        iconeBadge = 'fa-check-circle';
        break;
      case 'medio':
        condicaoTexto = 'Médio';
        corBadge = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        iconeBadge = 'fa-exclamation-triangle';
        break;
      case 'ruim':
        condicaoTexto = 'Ruim';
        corBadge = 'bg-red-500/20 text-red-400 border-red-500/30';
        iconeBadge = 'fa-times-circle';
        break;
      default:
        condicaoTexto = 'Não definida';
        corBadge = 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        iconeBadge = 'fa-question-circle';
    }

    tr.innerHTML = `
      <td class="py-4 px-4 font-medium">${item.codigo}</td>
      <td class="py-4 px-4">
        <div class="font-medium text-white">${item.nome}</div>
      </td>
      <td class="py-4 px-4">
        <div class="text-gray-400 text-sm max-w-xs">${item.descricao || 'Sem descrição'}</div>
      </td>
      <td class="py-4 px-4">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${corBadge}">
          <i class="fas ${iconeBadge} mr-1"></i>${condicaoTexto}
        </span>
      </td>
      <td class="py-4 px-4 text-gray-400 text-sm">
        ${new Date(item.data).toLocaleDateString('pt-BR')}
      </td>
      <td class="py-4 px-4">
        <button onclick="editarItemMes(${indexCompleto})" 
                class="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition">
          <i class="fas fa-edit mr-1"></i>Editar
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function atualizarRelatorioSaida() {
  let removidos = JSON.parse(localStorage.getItem("removidos")) || [];
  const tbody = document.querySelector("#tabelaRelatorioSaida tbody");
  tbody.innerHTML = "";

  // Usar itens filtrados se houver filtro ativo, senão todos os itens
  const itensParaExibir = itensFiltradosSaida.length > 0 ? itensFiltradosSaida : removidos;

  if (itensParaExibir.length === 0) {
    tbody.classList.add('hidden');
    listaVaziaSaida.classList.remove('hidden');
    return;
  }

  tbody.classList.remove('hidden');
  listaVaziaSaida.classList.add('hidden');

  itensParaExibir.forEach((item, indexOriginal) => {
    // Encontrar o índice original no array completo
    const indexCompleto = removidos.findIndex(i => i.codigo === item.codigo && i.dataSaida === item.dataSaida);
    const tr = document.createElement("tr");
    tr.className = 'hover:bg-gray-800/50 transition-colors';

    // Formatação da condição
    let condicaoTexto = '';
    let corBadge = '';
    let iconeBadge = '';
    
    switch (item.condicao) {
      case 'bom':
        condicaoTexto = 'Bom';
        corBadge = 'bg-green-500/20 text-green-400 border-green-500/30';
        iconeBadge = 'fa-check-circle';
        break;
      case 'medio':
        condicaoTexto = 'Médio';
        corBadge = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        iconeBadge = 'fa-exclamation-triangle';
        break;
      case 'ruim':
        condicaoTexto = 'Ruim';
        corBadge = 'bg-red-500/20 text-red-400 border-red-500/30';
        iconeBadge = 'fa-times-circle';
        break;
      default:
        condicaoTexto = 'Não definida';
        corBadge = 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        iconeBadge = 'fa-question-circle';
    }

    tr.innerHTML = `
      <td class="py-4 px-4 font-medium">${item.codigo}</td>
      <td class="py-4 px-4">
        <div class="font-medium text-white">${item.nome}</div>
      </td>
      <td class="py-4 px-4">
        <div class="text-gray-400 text-sm max-w-xs">${item.descricao || 'Sem descrição'}</div>
      </td>
      <td class="py-4 px-4">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${corBadge}">
          <i class="fas ${iconeBadge} mr-1"></i>${condicaoTexto}
        </span>
      </td>
      <td class="py-4 px-4 text-gray-400 text-sm">
        ${new Date(item.dataSaida).toLocaleDateString('pt-BR')}
      </td>
      <td class="py-4 px-4">
        <button onclick="restaurarItemSaida(${indexCompleto})" 
                class="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition">
          <i class="fas fa-undo mr-1"></i>Restaurar
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// Funções de ações para itens cadastrados
function editarItemMes(index) {
  window.location.href = `gerenciador.html?editIndex=${index}`;
}

function removerItemMes(index) {
  confirmarAcao('⚠️ Tem certeza que deseja remover este item?\n\nEle será movido para a lista de itens de saída.', (confirmado) => {
    if (!confirmado) return;

    let itens = JSON.parse(localStorage.getItem("itens")) || [];
    let removidos = JSON.parse(localStorage.getItem("removidos")) || [];

    const itemRemovido = itens[index];
    itens.splice(index, 1);
    itemRemovido.dataSaida = new Date().toISOString();

    removidos.push(itemRemovido);

    localStorage.setItem("itens", JSON.stringify(itens));
    localStorage.setItem("removidos", JSON.stringify(removidos));

    filtrarRelatorioMes();
    filtrarRelatorioSaida();
    mostrarToast('Item removido com sucesso!');
  });
}

// Funções de ações para itens de saída
function restaurarItemSaida(index) {
  confirmarAcao('🔄 Tem certeza que deseja restaurar este item?\n\nEle voltará para a lista de itens ativos.', (confirmado) => {
    if (!confirmado) return;

    let removidos = JSON.parse(localStorage.getItem("removidos")) || [];
    let itens = JSON.parse(localStorage.getItem("itens")) || [];

    const itemRestaurado = removidos[index];
    removidos.splice(index, 1);
    delete itemRestaurado.dataSaida;

    itens.push(itemRestaurado);

    localStorage.setItem("removidos", JSON.stringify(removidos));
    localStorage.setItem("itens", JSON.stringify(itens));

    filtrarRelatorioMes();
    filtrarRelatorioSaida();
    mostrarToast('Item restaurado com sucesso!');
  });
}

function excluirItemSaida(index) {
  confirmarAcao('🗑️ Tem certeza que deseja excluir este item definitivamente?\n\nEsta ação é IRREVERSÍVEL.', (confirmado) => {
    if (!confirmado) return;

    let removidos = JSON.parse(localStorage.getItem("removidos")) || [];
    removidos.splice(index, 1);

    localStorage.setItem("removidos", JSON.stringify(removidos));

    filtrarRelatorioSaida();
    mostrarToast('Item excluído definitivamente!', 'erro');
  });
}

// Funções de exportação PDF
function exportarPDFMes() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let itens = itensFiltradosMes.length > 0 ? itensFiltradosMes : JSON.parse(localStorage.getItem("itens")) || [];

  // Título
  doc.setFontSize(16);
  doc.text('Relatório: Itens Cadastrados', 14, 20);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 30);

  if (itens.length === 0) {
    doc.text('Nenhum item encontrado.', 14, 45);
  } else {
    const cabecalhos = [['Código', 'Nome', 'Descrição', 'Condição', 'Data']];
    const corpo = itens.map(item => {
      let condicaoTexto = '';
      switch (item.condicao) {
        case 'bom': condicaoTexto = 'Bom'; break;
        case 'medio': condicaoTexto = 'Médio'; break;
        case 'ruim': condicaoTexto = 'Ruim'; break;
        default: condicaoTexto = ''; break;
      }
      return [item.codigo, item.nome, item.descricao, condicaoTexto, new Date(item.data).toLocaleDateString('pt-BR')];
    });

    doc.autoTable({
      head: cabecalhos,
      body: corpo,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 14, right: 14 }
    });
  }

  doc.save(`relatorio-itens-${new Date().toISOString().split('T')[0]}.pdf`);
}

function exportarPDFSaida() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let removidos = itensFiltradosSaida.length > 0 ? itensFiltradosSaida : JSON.parse(localStorage.getItem("removidos")) || [];

  doc.setFontSize(16);
  doc.text('Relatório: Itens Removidos', 14, 20);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 30);

  if (removidos.length === 0) {
    doc.text('Nenhum item removido encontrado.', 14, 45);
  } else {
    const cabecalhos = [['Código', 'Nome', 'Descrição', 'Condição', 'Data Saída']];
    const corpo = removidos.map(item => {
      let condicaoTexto = '';
      switch (item.condicao) {
        case 'bom': condicaoTexto = 'Bom'; break;
        case 'medio': condicaoTexto = 'Médio'; break;
        case 'ruim': condicaoTexto = 'Ruim'; break;
        default: condicaoTexto = ''; break;
      }
      return [item.codigo, item.nome, item.descricao, condicaoTexto, new Date(item.dataSaida).toLocaleDateString('pt-BR')];
    });

    doc.autoTable({
      head: cabecalhos,
      body: corpo,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 14, right: 14 }
    });
  }

  doc.save(`relatorio-removidos-${new Date().toISOString().split('T')[0]}.pdf`);
}