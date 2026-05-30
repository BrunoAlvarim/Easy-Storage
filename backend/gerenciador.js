console.log("gerenciador.js carregado com sucesso");

let editIndex = null;
let itensFiltrados = [];
let todosItens = [];
const API_BASE_URL = window.location.protocol === 'file:'
  ? 'http://localhost:3001'
  : window.location.origin;

// Elementos do DOM
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

// Toast
function mostrarToast(mensagem, tipo = 'sucesso') {
    if (!toast) {
        console.log('Toast:', mensagem);
        return;
    }
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

// Modal de Confirmação
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

// Dropdown
function toggleDropdown(index) {
    const dropdown = document.getElementById(`dropdown-${index}`);
    document.querySelectorAll('.dropdown-menu').forEach(d => {
        if (d.id !== `dropdown-${index}`) d.classList.remove('show');
    });
    dropdown.classList.toggle('show');
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-container')) {
        document.querySelectorAll('.dropdown-menu').forEach(d => d.classList.remove('show'));
    }
});

// ✅ CORRIGIDO: usa item.data_entrada (igual ao backend)
function filtrarItens() {
    const dataInicio = filtroDataInicio.value;
    const dataFim = filtroDataFim.value;

    itensFiltrados = todosItens.filter(item => {
        const itemData = new Date(item.data_entrada); // ← era item.data (errado)
        let dataMatch = true;

        if (dataInicio) {
            dataMatch = dataMatch && itemData >= new Date(dataInicio);
        }

        if (dataFim) {
            const fimData = new Date(dataFim);
            fimData.setHours(23, 59, 59, 999);
            dataMatch = dataMatch && itemData <= fimData;
        }

        return dataMatch;
    });

    listarItens();
}

function limparFiltros() {
    if (filtroDataInicio) filtroDataInicio.value = '';
    if (filtroDataFim) filtroDataFim.value = '';
    itensFiltrados = [];
    listarItens();
    mostrarToast('Filtros limpos com sucesso!');
}


document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded executado');
    if (filtroDataInicio) filtroDataInicio.value = '';
    if (filtroDataFim) filtroDataFim.value = '';
    listarItens();

    const params = new URLSearchParams(window.location.search);
    const index = params.get('editIndex');
    if (index !== null) editarItem(Number(index));

    // const btnSalvar = document.getElementById('btnSalvar');
    // const btnLimpar = document.getElementById('btnLimpar');

    // if (btnSalvar) {
    //     btnSalvar.addEventListener('click', salvarItem);
    // } else {
    //     console.warn('btnSalvar não encontrado');
    // }

    // if (btnLimpar) {
    //     btnLimpar.addEventListener('click', limparFormulario);
    // } else {
    //     console.warn('btnLimpar não encontrado');
    // }

    // Classe active no menu
    document.querySelectorAll('.sidebar-item').forEach(item => {
        if (item.getAttribute('href') === 'gerenciador.html') {
            item.classList.add('active');
        }
    });
});

// Salvar / Atualizar item
async function salvarItem() {
    console.log("chamando funcao")
    const codigo = document.getElementById("codigo").value.trim();
    const nome = document.getElementById("nome").value.trim();
    const descricao = document.getElementById("descricao").value.trim();
    const condicao = document.getElementById("condicao").value;

    if (!codigo || !nome || !condicao) {
        mostrarToast("Preencha todos os campos obrigatórios!", 'erro');
        return;
    }

    const itemData = { codigo, nome, descricao, condicao };

    try {
        let response;
        if (editIndex === null) {
            response = await fetch(`${API_BASE_URL}/api/item`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
        } else {
            response = await fetch(`${API_BASE_URL}/api/item/${editIndex}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
        }

        if (response.ok) {
            mostrarToast(editIndex === null ? "Item adicionado com sucesso!" : "Item atualizado com sucesso!");
            limparFormulario();
            listarItens();
        } else {
            const error = await response.json();
            mostrarToast(error.error || "Erro ao salvar item", 'erro');
        }
    } catch (error) {
        console.error('Erro ao salvar item:', error);
        mostrarToast("Erro ao conectar com o servidor. Verifique se o backend está rodando.", 'erro');
    }
}

function limparFormulario() {
    document.getElementById("codigo").value = "";
    document.getElementById("nome").value = "";
    document.getElementById("descricao").value = "";
    document.getElementById("condicao").value = "";
    editIndex = null;
    document.getElementById("btnSalvar").innerHTML = '<i class="fas fa-save mr-2"></i>Salvar Item';
}

async function listarItens() {
    console.log("chamando funcao de listar itens")
    try {
        const response = await fetch(`${API_BASE_URL}/api/item`);

        // ✅ Verifica ok ANTES de parsear o JSON
        if (!response.ok) {
            mostrarToast('Erro ao carregar itens', 'erro');
            if (listaVazia) listaVazia.classList.remove('hidden');
            return;
        }

        const itens = await response.json();
        todosItens = itens;

        const tbody = document.getElementById("tabelaItensBody");
        tbody.innerHTML = "";

        let itensParaExibir = (itensFiltrados.length > 0) ? itensFiltrados : itens;

        const totalItens = itens.length;
        const itensExibidos = itensParaExibir.length;

        if (contadorNumero) contadorNumero.textContent = itensExibidos;
        if (contadorItens) {
            if (itensFiltrados.length > 0) {
                contadorItens.innerHTML = `<i class="fas fa-filter mr-2"></i>${itensExibidos} de ${totalItens} itens`;
            } else {
                contadorItens.innerHTML = `<i class="fas fa-box mr-2"></i>${itensExibidos} ${itensExibidos === 1 ? 'item' : 'itens'}`;
            }
        }

        if (totalItens === 0) {
            tbody.classList.add('hidden');
            if (listaVazia) listaVazia.classList.remove('hidden');
            if (nenhumResultado) nenhumResultado.classList.add('hidden');
            return;
        } else if (itensExibidos === 0 && itensFiltrados.length > 0) {
            tbody.classList.add('hidden');
            if (listaVazia) listaVazia.classList.add('hidden');
            if (nenhumResultado) nenhumResultado.classList.remove('hidden');
            return;
        } else {
            tbody.classList.remove('hidden');
            if (listaVazia) listaVazia.classList.add('hidden');
            if (nenhumResultado) nenhumResultado.classList.add('hidden');
        }

        itensParaExibir.forEach((item) => {
            const tr = document.createElement("tr");
            tr.className = 'hover:bg-gray-800/50 transition-colors';

            let condicaoTexto = 'Não definida';
            let corBadge = 'bg-gray-500/20 text-gray-400 border-gray-500/30';
            let iconeBadge = 'fa-question-circle';

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
                    ${new Date(item.data_entrada).toLocaleDateString('pt-BR')}
                </td>
                <td class="py-4 px-4">
                    <div class="dropdown-container relative">
                        <button onclick="toggleDropdown(${item.id_item})"
                                class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div id="dropdown-${item.id_item}"
                             class="dropdown-menu absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                            <button onclick="editarItem(${item.id_item})"
                                    class="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-t-lg transition flex items-center">
                                <i class="fas fa-edit mr-3 text-blue-400"></i>Editar Item
                            </button>
                            <button onclick="removerItem(${item.id_item})"
                                    class="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-b-lg transition flex items-center">
                                <i class="fas fa-trash mr-3 text-red-400"></i>Remover Item
                            </button>
                        </div>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Erro ao listar itens:', error);
        mostrarToast('Erro ao carregar itens. Backend está rodando?', 'erro');
        listaVazia.classList.remove('hidden');
    }
}

async function editarItem(id) {
    try {
        const item = todosItens.find(i => i.id_item === id);
        if (!item) { mostrarToast('Item não encontrado', 'erro'); return; }

        document.getElementById("codigo").value = item.codigo;
        document.getElementById("nome").value = item.nome;
        document.getElementById("descricao").value = item.descricao || '';
        document.getElementById("condicao").value = item.condicao;

        editIndex = id;
        document.getElementById("btnSalvar").innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Atualizar Item';

        const dropdown = document.getElementById(`dropdown-${id}`);
        if (dropdown) dropdown.classList.remove('show');

        document.getElementById("nome").focus();
    } catch (error) {
        console.error('Erro ao editar item:', error);
        mostrarToast('Erro ao carregar item', 'erro');
    }
}

async function removerItem(id) {
    const dropdown = document.getElementById(`dropdown-${id}`);
    if (dropdown) dropdown.classList.remove('show');

    const item = todosItens.find(i => i.id_item === id);
    if (!item) { mostrarToast('Item não encontrado', 'erro'); return; }

    const confirmado = confirm(`Remover o item "${item.nome}"?`);
    if (!confirmado) return;

    try {
        const deleteResponse = await fetch(`${API_BASE_URL}/api/item/${id}`, { method: 'DELETE' });
        if (deleteResponse.ok) {
            if (editIndex === id) limparFormulario();
            mostrarToast("Item removido com sucesso!");
            listarItens();
        } else {
            const error = await deleteResponse.json();
            mostrarToast(error.error || "Erro ao remover item", 'erro');
        }
    } catch (error) {
        mostrarToast("Erro ao conectar com o servidor", 'erro');
    }
}