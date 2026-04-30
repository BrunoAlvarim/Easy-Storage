// ============================================================
// Estado global
// ============================================================
let todosItens  = [];
let todosLucros = [];

const API_BASE_URL = window.location.protocol === 'file:'
  ? 'http://localhost:3001'
  : window.location.origin;

// ============================================================
// Elementos do DOM
// ============================================================
const toast       = document.getElementById('toast');
const selectItem  = document.getElementById('selectItem');
const precoCusto  = document.getElementById('precoCusto');
const precoVenda  = document.getElementById('precoVenda');
const custoReparo = document.getElementById('custoReparo');
const previewLucro  = document.getElementById('previewLucro');
const previewMargem = document.getElementById('previewMargem');

// ============================================================
// Toast
// ============================================================
function mostrarToast(mensagem, tipo = 'sucesso') {
  const conteudo  = document.getElementById('toastConteudo');
  const icone     = tipo === 'sucesso' ? '✅' : '❌';
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

// ============================================================
// Helpers
// ============================================================
function classeValor(v) {
  return v > 0 ? 'profit-positive' : v < 0 ? 'profit-negative' : 'profit-neutral';
}

function truncar(str, max = 20) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '...' : str;
}

// ============================================================
// Preview de lucro em tempo real
// ============================================================
function calcularPreviewLucro() {
  const custo  = parseFloat(precoCusto.value)  || 0;
  const venda  = parseFloat(precoVenda.value)  || 0;
  const reparo = parseFloat(custoReparo.value) || 0;

  const lucro  = venda - custo - reparo;
  const margem = custo > 0 ? (lucro / custo) * 100 : 0;

  previewLucro.textContent  = `R$ ${lucro.toFixed(2)}`;
  previewMargem.textContent = `${margem.toFixed(1)}%`;

  previewLucro.className  = `font-semibold block ${classeValor(lucro)}`;
  previewMargem.className = `font-semibold block ${classeValor(margem)}`;
}

// ============================================================
// Carregar itens no <select> via API
// ============================================================
async function carregarItensSelect() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/item`);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const itens = await response.json();
    todosItens  = itens;

    selectItem.innerHTML = '<option value="">Selecione um item...</option>';

    itens.forEach(item => {
      const option       = document.createElement('option');
      option.value       = item.id_item;
      option.textContent = item.nome;
      selectItem.appendChild(option);
    });

  } catch (error) {
    console.error('Erro ao carregar itens:', error);
    mostrarToast('Erro ao carregar itens da API', 'erro');
  }
}

// ============================================================
// Preencher campos ao selecionar item (busca da API)
// ============================================================
function carregarDadosItem() {
  const idSelecionado = selectItem.value;
  if (!idSelecionado) return;

  const lucroSalvo = todosLucros.find(l => l.id_item == idSelecionado);

  if (lucroSalvo) {
    precoCusto.value  = lucroSalvo.custo  || '';
    precoVenda.value  = lucroSalvo.venda  || '';
    custoReparo.value = lucroSalvo.reparo || '';
    calcularPreviewLucro();
  } else {
    precoCusto.value  = '';
    precoVenda.value  = '';
    custoReparo.value = '';
    calcularPreviewLucro();
  }
}

// ============================================================
// Carregar todos os lucros da API
// ============================================================
async function carregarDadosLucro() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/lucro`);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    todosLucros = await res.json();

    atualizarResumoLucros();
    carregarTabelaLucros();
    atualizarGraficoLucros();
    atualizarAnaliseRentabilidade();

  } catch (err) {
    console.error('Erro ao carregar lucros:', err);
    mostrarToast('Erro ao carregar lucros da API', 'erro');
  }
}

// ============================================================
// Salvar configuração de lucro → API
// ============================================================
async function salvarLucroItem() {
  const idSelecionado = selectItem.value;
  if (!idSelecionado) {
    mostrarToast('Selecione um item primeiro!', 'erro');
    return;
  }

  const custo  = parseFloat(precoCusto.value)  || 0;
  const venda  = parseFloat(precoVenda.value)  || 0;
  const reparo = parseFloat(custoReparo.value) || 0;

  if (custo === 0 && venda === 0) {
    mostrarToast('Informe pelo menos o custo ou preço de venda!', 'erro');
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/lucro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_item: idSelecionado, custo, venda, reparo })
    });

    if (!res.ok) throw new Error(await res.text());

    mostrarToast('Configuração de lucro salva com sucesso!');
    await carregarDadosLucro();

  } catch (err) {
    console.error(err);
    mostrarToast('Erro ao salvar: ' + err.message, 'erro');
  }
}

// ============================================================
// Resumo (cards superiores)
// ============================================================
function atualizarResumoLucros() {
  let receitaTotal = 0;
  let custoTotal   = 0;
  let reparoTotal  = 0;

  todosLucros.forEach(l => {
    receitaTotal += parseFloat(l.venda)  || 0;
    custoTotal   += parseFloat(l.custo)  || 0;
    reparoTotal  += parseFloat(l.reparo) || 0;
  });

  const lucroTotal  = receitaTotal - custoTotal - reparoTotal;
  const margemMedia = custoTotal > 0 ? (lucroTotal / custoTotal) * 100 : 0;

  document.getElementById('lucroTotal').textContent   = `R$ ${lucroTotal.toFixed(2)}`;
  document.getElementById('receitaTotal').textContent = `R$ ${receitaTotal.toFixed(2)}`;
  document.getElementById('custoTotal').textContent   = `R$ ${(custoTotal + reparoTotal).toFixed(2)}`;
  document.getElementById('margemMedia').textContent  = `${margemMedia.toFixed(1)}%`;

  document.getElementById('lucroTotal').className  = `text-2xl font-bold ${classeValor(lucroTotal)}`;
  document.getElementById('margemMedia').className = `text-2xl font-bold ${classeValor(margemMedia)}`;
}

// ============================================================
// Tabela de lucros
// ============================================================
function carregarTabelaLucros() {
  const tbody      = document.getElementById('tabelaLucrosBody');
  const listaVazia = document.getElementById('listaLucrosVazia');

  tbody.innerHTML = '';

  if (todosLucros.length === 0) {
    tbody.classList.add('hidden');
    listaVazia.classList.remove('hidden');
    return;
  }

  tbody.classList.remove('hidden');
  listaVazia.classList.add('hidden');

  todosLucros.forEach(l => {
    const custo  = parseFloat(l.custo)  || 0;
    const venda  = parseFloat(l.venda)  || 0;
    const reparo = parseFloat(l.reparo) || 0;
    const lucro  = venda - custo - reparo;
    const margem = custo > 0 ? (lucro / custo) * 100 : 0;

    const tr     = document.createElement('tr');
    tr.className = 'hover:bg-gray-800/50 transition-colors';
    tr.innerHTML = `
      <td class="py-4 px-4">
        <div class="font-medium text-white">${l.nome}</div>
        <div class="text-gray-400 text-sm">${l.codigo}</div>
      </td>
      <td class="py-4 px-4 text-gray-300">R$ ${custo.toFixed(2)}</td>
      <td class="py-4 px-4 text-gray-300">R$ ${venda.toFixed(2)}</td>
      <td class="py-4 px-4 text-gray-300">R$ ${reparo.toFixed(2)}</td>
      <td class="py-4 px-4 font-semibold ${classeValor(lucro)}">R$ ${lucro.toFixed(2)}</td>
      <td class="py-4 px-4 font-semibold ${classeValor(margem)}">${margem.toFixed(1)}%</td>
      <td class="py-4 px-4">
        <button onclick="editarLucroItem(${l.id_item})"
                class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition mr-2">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="excluirLucroItem(${l.id_lucro})"
                class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ============================================================
// Gráfico de lucros
// ============================================================
function atualizarGraficoLucros() {
  const ctx        = document.getElementById('chartLucros').getContext('2d');
  const labels     = [];
  const dadosLucro = [];
  const cores      = [];

  todosLucros.forEach(l => {
    const lucro = (parseFloat(l.venda) || 0) - (parseFloat(l.custo) || 0) - (parseFloat(l.reparo) || 0);
    labels.push(truncar(l.nome, 15));
    dadosLucro.push(lucro);
    cores.push(lucro > 0 ? '#10B981' : '#EF4444');
  });

  if (window._chartLucrosInstance) {
    window._chartLucrosInstance.destroy();
  }

  window._chartLucrosInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Lucro por Item (R$)',
        data: dadosLucro,
        backgroundColor: cores,
        borderColor: cores,
        borderWidth: 1,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid:  { color: 'rgba(255,255,255,0.1)' },
          ticks: { color: '#E5E7EB' },
        },
        y: {
          grid:  { color: 'rgba(255,255,255,0.1)' },
          ticks: { color: '#E5E7EB', callback: v => 'R$ ' + v },
        },
      },
    },
  });
}

// ============================================================
// Análise de rentabilidade
// ============================================================
function atualizarAnaliseRentabilidade() {
  if (todosLucros.length === 0) {
    document.getElementById('itemMaisRentavel').textContent    = '-';
    document.getElementById('itemMenosRentavel').textContent   = '-';
    document.getElementById('margemMaisRentavel').textContent  = '0%';
    document.getElementById('margemMenosRentavel').textContent = '0%';
    document.getElementById('analiseMargemMedia').textContent  = '0%';
    document.getElementById('totalItensComLucro').textContent  = '0 itens analisados';
    return;
  }

  let maisRentavel  = { margem: -Infinity };
  let menosRentavel = { margem:  Infinity };
  let margemTotal   = 0;

  todosLucros.forEach(l => {
    const custo  = parseFloat(l.custo)  || 0;
    const lucro  = (parseFloat(l.venda) || 0) - custo - (parseFloat(l.reparo) || 0);
    const margem = custo > 0 ? (lucro / custo) * 100 : 0;

    margemTotal += margem;

    if (margem > maisRentavel.margem)  maisRentavel  = { nome: l.nome, margem };
    if (margem < menosRentavel.margem) menosRentavel = { nome: l.nome, margem };
  });

  const margemMedia = margemTotal / todosLucros.length;

  document.getElementById('itemMaisRentavel').textContent    = truncar(maisRentavel.nome);
  document.getElementById('itemMenosRentavel').textContent   = truncar(menosRentavel.nome);
  document.getElementById('margemMaisRentavel').textContent  = `${maisRentavel.margem.toFixed(1)}%`;
  document.getElementById('margemMenosRentavel').textContent = `${menosRentavel.margem.toFixed(1)}%`;
  document.getElementById('analiseMargemMedia').textContent  = `${margemMedia.toFixed(1)}%`;
  document.getElementById('totalItensComLucro').textContent  = `${todosLucros.length} itens analisados`;

  document.getElementById('margemMaisRentavel').className  = 'text-green-400 font-semibold mt-2';
  document.getElementById('margemMenosRentavel').className = 'text-red-400 font-semibold mt-2';
  document.getElementById('analiseMargemMedia').className  = `text-2xl font-bold ${classeValor(margemMedia)} mb-2`;
}

// ============================================================
// Editar — preenche o formulário com dados do item
// ============================================================
function editarLucroItem(idItem) {
  const lucro = todosLucros.find(l => l.id_item == idItem);
  if (!lucro) return;

  selectItem.value  = idItem;
  precoCusto.value  = lucro.custo  || '';
  precoVenda.value  = lucro.venda  || '';
  custoReparo.value = lucro.reparo || '';
  calcularPreviewLucro();

  document.querySelector('section').scrollIntoView({ behavior: 'smooth' });
}

// ============================================================
// Excluir → API
// ============================================================
async function excluirLucroItem(idLucro) {
  if (!confirm('Tem certeza que deseja excluir esta configuração de lucro?')) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/lucro/${idLucro}`, { method: 'DELETE' });

    if (!res.ok) throw new Error(await res.text());

    mostrarToast('Configuração de lucro excluída com sucesso!');
    await carregarDadosLucro();

  } catch (err) {
    console.error(err);
    mostrarToast('Erro ao excluir: ' + err.message, 'erro');
  }
}

// ============================================================
// Exportar CSV
// ============================================================
function exportarRelatorioLucros() {
  if (todosLucros.length === 0) {
    mostrarToast('Nenhum dado de lucro para exportar!', 'erro');
    return;
  }

  let csv = 'Item,Código,Preço Custo,Preço Venda,Custo Reparo,Lucro,Margem\n';

  todosLucros.forEach(l => {
    const custo  = parseFloat(l.custo)  || 0;
    const venda  = parseFloat(l.venda)  || 0;
    const reparo = parseFloat(l.reparo) || 0;
    const lucro  = venda - custo - reparo;
    const margem = custo > 0 ? (lucro / custo) * 100 : 0;
    csv += `"${l.nome}","${l.codigo}",${custo},${venda},${reparo},${lucro.toFixed(2)},${margem.toFixed(2)}%\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href  = url;
  link.setAttribute('download', `relatorio-lucros-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  mostrarToast('Relatório de lucros exportado com sucesso!');
}

// ============================================================
// Sidebar mobile
// ============================================================
document.getElementById('toggleSidebar').addEventListener('click', () => {
  document.querySelector('aside').classList.toggle('hidden');
});

// ============================================================
// Inicialização
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('href') === 'lucros.html');
  });
});

window.onload = async () => {
  await carregarItensSelect();
  await carregarDadosLucro();

  precoCusto.addEventListener('input',  calcularPreviewLucro);
  precoVenda.addEventListener('input',  calcularPreviewLucro);
  custoReparo.addEventListener('input', calcularPreviewLucro);
  selectItem.addEventListener('change', carregarDadosItem);
};