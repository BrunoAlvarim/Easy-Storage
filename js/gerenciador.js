let editIndex = null;
let itensFiltrados = [];

// Elementos do DOM para toast e modal
const toast = document.getElementById('toast');
const modalConfirmacao = document.getElementById('modalConfirmacao');
const modalMensagem = document.getElementById('modalMensagem');
const btnConfirmar = document.getElementById('btnConfirmar');
const btnCancelar = document.getElementById('btnCancelar');
const listaVazia = document.getElementById('listaVazia');
const nenhumResultado = document.getElementById('nenhumResultado');
const contadorItens = document.getElementById('contadorItens');
const contadorNumero = document.getElementById('contadorNumero');
const filtroDataInicio = document.getElementById('filtroDataInicio');
const filtroDataFim = document.getElementById('filtroDataFim');

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

// Função para mostrar/ocultar dropdown
function toggleDropdown(index) {
  const dropdown = document.getElementById(`dropdown-${index}`);
  const allDropdowns = document.querySelectorAll('.dropdown-menu');
  
  // Fecha todos os outros dropdowns
  allDropdowns.forEach(d => {
    if (d.id !== `dropdown-${index}`) {
      d.classList.remove('show');
    }
  });
  
  // Alterna o dropdown atual
  dropdown.classList.toggle('show');
}

// Fecha dropdowns ao clicar fora
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown-container')) {
    document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
      dropdown.classList.remove('show');
    });
  }
});

// Função para filtrar itens por data
function filtrarItens() {
  const dataInicio = filtroDataInicio.value;
  const dataFim = filtroDataFim.value;
  
  let itens = JSON.parse(localStorage.getItem("itens")) || [];
  
  itensFiltrados = itens.filter(item => {
    const itemData = new Date(item.data);
    let dataMatch = true;
    
    if (dataInicio) {
      const inicioData = new Date(dataInicio);
      dataMatch = dataMatch && itemData >= inicioData;
    }
    
    if (dataFim) {
      const fimData = new Date(dataFim);
      fimData.setHours(23, 59, 59, 999); // Fim do dia
      dataMatch = dataMatch && itemData <= fimData;
    }
    
    return dataMatch;
  });
  
  listarItens();
}

// Função para limpar filtros
function limparFiltros() {
  filtroDataInicio.value = '';
  filtroDataFim.value = '';
  itensFiltrados = [];
  listarItens();
  mostrarToast('Filtros limpos com sucesso!');
}

// Configurar datas padrão para os filtros
function configurarFiltrosData() {
  const hoje = new Date();
  const umMesAtras = new Date();
  umMesAtras.setMonth(hoje.getMonth() - 1);
  
  // Formatar datas para input type="date"
  const formatarData = (data) => {
    return data.toISOString().split('T')[0];
  };
  
  // Não definir valores padrão, deixar vazio inicialmente
  filtroDataInicio.value = '';
  filtroDataFim.value = '';
}

// Inicialização
window.onload = () => {
    configurarFiltrosData();
    listarItens();

    const params = new URLSearchParams(window.location.search);
    const index = params.get("editIndex");

    if (index !== null) {
        editarItem(Number(index));
    }

    // Toggle da Sidebar para Mobile
    const toggleButton = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('aside');

    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
    });

    // Adicionar classe active ao item do menu atual
    const menuItems = document.querySelectorAll('.sidebar-item');
    menuItems.forEach(item => {
        if (item.getAttribute('href') === 'gerenciador.html') {
            item.classList.add('active');
        }
    });
};

function salvarItem() {
    const codigo = document.getElementById("codigo").value.trim();
    const nome = document.getElementById("nome").value.trim();
    const descricao = document.getElementById("descricao").value.trim();
    const condicao = document.getElementById("condicao").value;

    if (!codigo || !nome) {
        mostrarToast("Preencha código e nome!", 'erro');
        return;
    }

    let itens = JSON.parse(localStorage.getItem("itens")) || [];

    if (editIndex === null) {
        const data = new Date().toISOString();
        const item = { codigo, nome, descricao, condicao, data };
        itens.push(item);
        mostrarToast("Item adicionado com sucesso!");
    } else {
        itens[editIndex].codigo = codigo;
        itens[editIndex].nome = nome;
        itens[editIndex].descricao = descricao;
        itens[editIndex].condicao = condicao;
        editIndex = null;
        document.getElementById("btnSalvar").innerHTML = '<i class="fas fa-save mr-2"></i>Salvar Item';
        mostrarToast("Item atualizado com sucesso!");
    }

    localStorage.setItem("itens", JSON.stringify(itens));

    limparFormulario();
    listarItens();
}

function limparFormulario() {
    document.getElementById("codigo").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("descricao").value = "";
    document.getElementById("condicao").value = "";
    editIndex = null;
    document.getElementById("btnSalvar").innerHTML = '<i class="fas fa-save mr-2"></i>Salvar Item';
}

function listarItens() {
    let itens = JSON.parse(localStorage.getItem("itens")) || [];
    const tbody = document.getElementById("tabelaItensBody");
    tbody.innerHTML = "";

    // Usar itens filtrados se houver filtro ativo, senão todos os itens
    const itensParaExibir = itensFiltrados.length > 0 ? itensFiltrados : itens;
    const totalItens = itens.length;
    const itensExibidos = itensParaExibir.length;

    // Atualizar contador
    contadorNumero.textContent = itensExibidos;
    if (itensFiltrados.length > 0) {
        contadorItens.innerHTML = `<i class="fas fa-filter mr-2"></i>${itensExibidos} de ${totalItens} itens`;
    } else {
        contadorItens.innerHTML = `<i class="fas fa-box mr-2"></i>${itensExibidos} ${itensExibidos === 1 ? 'item' : 'itens'}`;
    }

    // Mostrar mensagens apropriadas
    if (totalItens === 0) {
        tbody.classList.add('hidden');
        listaVazia.classList.remove('hidden');
        nenhumResultado.classList.add('hidden');
        return;
    } else if (itensExibidos === 0 && itensFiltrados.length > 0) {
        tbody.classList.add('hidden');
        listaVazia.classList.add('hidden');
        nenhumResultado.classList.remove('hidden');
        return;
    } else {
        tbody.classList.remove('hidden');
        listaVazia.classList.add('hidden');
        nenhumResultado.classList.add('hidden');
    }

    itensParaExibir.forEach((item, indexOriginal) => {
        // Encontrar o índice original no array completo para edição/remoção
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
                <div class="dropdown-container relative">
                    <button onclick="toggleDropdown(${indexCompleto})" 
                            class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div id="dropdown-${indexCompleto}" 
                         class="dropdown-menu absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                        <button onclick="editarItem(${indexCompleto})" 
                                class="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-t-lg transition flex items-center">
                            <i class="fas fa-edit mr-3 text-blue-400"></i>
                            Editar Item
                        </button>
                        <button onclick="removerItem(${indexCompleto})" 
                                class="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-b-lg transition flex items-center">
                            <i class="fas fa-trash mr-3 text-red-400"></i>
                            Remover Item
                        </button>
                    </div>
                </div>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function editarItem(index) {
    let itens = JSON.parse(localStorage.getItem("itens")) || [];
    const item = itens[index];

    document.getElementById("codigo").value = item.codigo;
    document.getElementById("nome").value = item.nome;
    document.getElementById("descricao").value = item.descricao;
    document.getElementById("condicao").value = item.condicao || '';

    editIndex = index;
    document.getElementById("btnSalvar").innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Atualizar Item';

    // Fecha o dropdown
    const dropdown = document.getElementById(`dropdown-${index}`);
    if (dropdown) dropdown.classList.remove('show');
    
    // Foco no campo nome
    document.getElementById("nome").focus();
}

function removerItem(index) {
    // Fecha o dropdown antes de mostrar a confirmação
    const dropdown = document.getElementById(`dropdown-${index}`);
    if (dropdown) dropdown.classList.remove('show');
    
    let itens = JSON.parse(localStorage.getItem("itens")) || [];
    const item = itens[index];
    
    confirmarAcao(`Tem certeza que deseja remover o item "${item.nome}"?\n\nEle será movido para itens de saída no histórico.`, (confirmado) => {
        if (!confirmado) return;

        let removidos = JSON.parse(localStorage.getItem("removidos")) || [];

        // CORREÇÃO: Remover o item corretamente do array
        const itemRemovido = itens[index];
        itens.splice(index, 1);
        itemRemovido.dataSaida = new Date().toISOString();

        removidos.push(itemRemovido);

        localStorage.setItem("itens", JSON.stringify(itens));
        localStorage.setItem("removidos", JSON.stringify(removidos));

        listarItens();

        if (editIndex === index) {
            limparFormulario();
        }

        mostrarToast("Item removido com sucesso! Ele agora aparece no relatório de saídas.");
    });
}