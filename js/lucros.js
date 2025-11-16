// Elementos do DOM
const toast = document.getElementById('toast');
const selectItem = document.getElementById('selectItem');
const precoCusto = document.getElementById('precoCusto');
const precoVenda = document.getElementById('precoVenda');
const custoReparo = document.getElementById('custoReparo');
const previewLucro = document.getElementById('previewLucro');
const previewMargem = document.getElementById('previewMargem');

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

// Calcular preview do lucro
function calcularPreviewLucro() {
  const custo = parseFloat(precoCusto.value) || 0;
  const venda = parseFloat(precoVenda.value) || 0;
  const reparo = parseFloat(custoReparo.value) || 0;

  const lucro = venda - custo - reparo;
  const margem = custo > 0 ? ((lucro / custo) * 100) : 0;

  // Atualizar preview
  previewLucro.textContent = `R$ ${lucro.toFixed(2)}`;
  previewMargem.textContent = `${margem.toFixed(1)}%`;

  // Aplicar cores baseadas no lucro
  previewLucro.className = `font-semibold block ${lucro > 0 ? 'profit-positive' : lucro < 0 ? 'profit-negative' : 'profit-neutral'}`;
  previewMargem.className = `font-semibold block ${margem > 0 ? 'profit-positive' : margem < 0 ? 'profit-negative' : 'profit-neutral'}`;
}

// Carregar itens no select
function carregarItensSelect() {
  const itens = JSON.parse(localStorage.getItem("itens")) || [];
  selectItem.innerHTML = '<option value="">Selecione um item...</option>';

  itens.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${item.codigo} - ${item.nome}`;
    selectItem.appendChild(option);
  });
}

// Carregar dados do item selecionado
function carregarDadosItem() {
  const index = selectItem.value;
  if (index === "") {
    precoCusto.value = '';
    precoVenda.value = '';
    custoReparo.value = '';
    calcularPreviewLucro();
    return;
  }

  const itens = JSON.parse(localStorage.getItem("itens")) || [];
  const item = itens[index];
  const lucros = JSON.parse(localStorage.getItem("lucros")) || {};

  if (lucros[item.codigo]) {
    precoCusto.value = lucros[item.codigo].custo || '';
    precoVenda.value = lucros[item.codigo].venda || '';
    custoReparo.value = lucros[item.codigo].reparo || '';
  } else {
    precoCusto.value = '';
    precoVenda.value = '';
    custoReparo.value = '';
  }

  calcularPreviewLucro();
}

// Salvar configuração de lucro
function salvarLucroItem() {
  const index = selectItem.value;
  if (index === "") {
    mostrarToast("Selecione um item primeiro!", 'erro');
    return;
  }

  const itens = JSON.parse(localStorage.getItem("itens")) || [];
  const item = itens[index];
  const custo = parseFloat(precoCusto.value) || 0;
  const venda = parseFloat(precoVenda.value) || 0;
  const reparo = parseFloat(custoReparo.value) || 0;

  if (custo === 0 && venda === 0) {
    mostrarToast("Informe pelo menos o custo ou preço de venda!", 'erro');
    return;
  }

  const lucros = JSON.parse(localStorage.getItem("lucros")) || {};
  lucros[item.codigo] = {
    custo: custo,
    venda: venda,
    reparo: reparo,
    nome: item.nome,
    dataAtualizacao: new Date().toISOString()
  };

  localStorage.setItem("lucros", JSON.stringify(lucros));
  mostrarToast("Configuração de lucro salva com sucesso!");
  
  // Atualizar interface
  atualizarResumoLucros();
  carregarTabelaLucros();
  atualizarGraficoLucros();
  atualizarAnaliseRentabilidade();
}

// Atualizar resumo de lucros
function atualizarResumoLucros() {
  const lucros = JSON.parse(localStorage.getItem("lucros")) || {};
  
  let receitaTotal = 0;
  let custoTotal = 0;
  let custoReparoTotal = 0;

  Object.values(lucros).forEach(lucro => {
    receitaTotal += lucro.venda || 0;
    custoTotal += lucro.custo || 0;
    custoReparoTotal += lucro.reparo || 0;
  });

  const lucroTotal = receitaTotal - custoTotal - custoReparoTotal;
  const margemMedia = custoTotal > 0 ? (lucroTotal / custoTotal) * 100 : 0;

  // Atualizar cards
  document.getElementById('lucroTotal').textContent = `R$ ${lucroTotal.toFixed(2)}`;
  document.getElementById('receitaTotal').textContent = `R$ ${receitaTotal.toFixed(2)}`;
  document.getElementById('custoTotal').textContent = `R$ ${(custoTotal + custoReparoTotal).toFixed(2)}`;
  document.getElementById('margemMedia').textContent = `${margemMedia.toFixed(1)}%`;

  // Aplicar cores
  document.getElementById('lucroTotal').className = `text-2xl font-bold ${lucroTotal > 0 ? 'profit-positive' : lucroTotal < 0 ? 'profit-negative' : 'profit-neutral'}`;
  document.getElementById('margemMedia').className = `text-2xl font-bold ${margemMedia > 0 ? 'profit-positive' : margemMedia < 0 ? 'profit-negative' : 'profit-neutral'}`;
}

// Carregar tabela de lucros
function carregarTabelaLucros() {
  const lucros = JSON.parse(localStorage.getItem("lucros")) || {};
  const tbody = document.getElementById('tabelaLucrosBody');
  const listaVazia = document.getElementById('listaLucrosVazia');

  tbody.innerHTML = '';

  if (Object.keys(lucros).length === 0) {
    tbody.classList.add('hidden');
    listaVazia.classList.remove('hidden');
    return;
  }

  tbody.classList.remove('hidden');
  listaVazia.classList.add('hidden');

  Object.entries(lucros).forEach(([codigo, dados]) => {
    const lucro = (dados.venda || 0) - (dados.custo || 0) - (dados.reparo || 0);
    const margem = (dados.custo || 0) > 0 ? (lucro / (dados.custo || 1)) * 100 : 0;

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-800/50 transition-colors';
    tr.innerHTML = `
      <td class="py-4 px-4">
        <div class="font-medium text-white">${dados.nome}</div>
        <div class="text-gray-400 text-sm">${codigo}</div>
      </td>
      <td class="py-4 px-4 text-gray-300">R$ ${(dados.custo || 0).toFixed(2)}</td>
      <td class="py-4 px-4 text-gray-300">R$ ${(dados.venda || 0).toFixed(2)}</td>
      <td class="py-4 px-4 text-gray-300">R$ ${(dados.reparo || 0).toFixed(2)}</td>
      <td class="py-4 px-4 font-semibold ${lucro > 0 ? 'profit-positive' : lucro < 0 ? 'profit-negative' : 'profit-neutral'}">
        R$ ${lucro.toFixed(2)}
      </td>
      <td class="py-4 px-4 font-semibold ${margem > 0 ? 'profit-positive' : margem < 0 ? 'profit-negative' : 'profit-neutral'}">
        ${margem.toFixed(1)}%
      </td>
      <td class="py-4 px-4">
        <button onclick="editarLucroItem('${codigo}')" 
                class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition mr-2">
          <i class="fas fa-edit"></i>
        </button>
        <button onclick="excluirLucroItem('${codigo}')" 
                class="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Atualizar gráfico de lucros
function atualizarGraficoLucros() {
  const lucros = JSON.parse(localStorage.getItem("lucros")) || {};
  const ctx = document.getElementById('chartLucros').getContext('2d');

  const labels = [];
  const dadosLucro = [];
  const cores = [];

  Object.entries(lucros).forEach(([codigo, dados]) => {
    const lucro = (dados.venda || 0) - (dados.custo || 0) - (dados.reparo || 0);
    labels.push(dados.nome.substring(0, 15) + '...');
    dadosLucro.push(lucro);
    cores.push(lucro > 0 ? '#10B981' : '#EF4444');
  });

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Lucro por Item (R$)',
        data: dadosLucro,
        backgroundColor: cores,
        borderColor: cores,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#E5E7EB'
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#E5E7EB',
            callback: function(value) {
              return 'R$ ' + value;
            }
          }
        }
      }
    }
  });
}

// Atualizar análise de rentabilidade
function atualizarAnaliseRentabilidade() {
  const lucros = JSON.parse(localStorage.getItem("lucros")) || {};
  const itensComLucro = Object.entries(lucros);

  if (itensComLucro.length === 0) {
    document.getElementById('itemMaisRentavel').textContent = '-';
    document.getElementById('itemMenosRentavel').textContent = '-';
    document.getElementById('margemMaisRentavel').textContent = '0%';
    document.getElementById('margemMenosRentavel').textContent = '0%';
    document.getElementById('analiseMargemMedia').textContent = '0%';
    document.getElementById('totalItensComLucro').textContent = '0 itens analisados';
    return;
  }

  // Encontrar item mais e menos rentável
  let maisRentavel = { margem: -Infinity };
  let menosRentavel = { margem: Infinity };
  let margemTotal = 0;

  itensComLucro.forEach(([codigo, dados]) => {
    const custo = dados.custo || 0;
    const lucro = (dados.venda || 0) - custo - (dados.reparo || 0);
    const margem = custo > 0 ? (lucro / custo) * 100 : 0;

    margemTotal += margem;

    if (margem > maisRentavel.margem) {
      maisRentavel = { nome: dados.nome, margem: margem };
    }
    if (margem < menosRentavel.margem) {
      menosRentavel = { nome: dados.nome, margem: margem };
    }
  });

  const margemMedia = margemTotal / itensComLucro.length;

  // Atualizar interface
  document.getElementById('itemMaisRentavel').textContent = maisRentavel.nome.substring(0, 20) + '...';
  document.getElementById('itemMenosRentavel').textContent = menosRentavel.nome.substring(0, 20) + '...';
  document.getElementById('margemMaisRentavel').textContent = `${maisRentavel.margem.toFixed(1)}%`;
  document.getElementById('margemMenosRentavel').textContent = `${menosRentavel.margem.toFixed(1)}%`;
  document.getElementById('analiseMargemMedia').textContent = `${margemMedia.toFixed(1)}%`;
  document.getElementById('totalItensComLucro').textContent = `${itensComLucro.length} itens analisados`;

  // Aplicar cores
  document.getElementById('margemMaisRentavel').className = `text-green-400 font-semibold mt-2`;
  document.getElementById('margemMenosRentavel').className = `text-red-400 font-semibold mt-2`;
  document.getElementById('analiseMargemMedia').className = `text-2xl font-bold ${margemMedia > 0 ? 'profit-positive' : margemMedia < 0 ? 'profit-negative' : 'profit-neutral'} mb-2`;
}

// Editar item de lucro
function editarLucroItem(codigo) {
  const lucros = JSON.parse(localStorage.getItem("lucros")) || {};
  const dados = lucros[codigo];
  
  // Encontrar o índice do item
  const itens = JSON.parse(localStorage.getItem("itens")) || [];
  const index = itens.findIndex(item => item.codigo === codigo);
  
  if (index !== -1) {
    selectItem.value = index;
    precoCusto.value = dados.custo || '';
    precoVenda.value = dados.venda || '';
    custoReparo.value = dados.reparo || '';
    calcularPreviewLucro();
    
    // Scroll para o formulário
    document.querySelector('section').scrollIntoView({ behavior: 'smooth' });
  }
}

// Excluir item de lucro
function excluirLucroItem(codigo) {
  if (!confirm(`Tem certeza que deseja excluir a configuração de lucro para o item ${codigo}?`)) {
    return;
  }

  const lucros = JSON.parse(localStorage.getItem("lucros")) || {};
  delete lucros[codigo];
  localStorage.setItem("lucros", JSON.stringify(lucros));
  
  mostrarToast("Configuração de lucro excluída com sucesso!");
  atualizarResumoLucros();
  carregarTabelaLucros();
  atualizarGraficoLucros();
  atualizarAnaliseRentabilidade();
}

// Exportar relatório de lucros
function exportarRelatorioLucros() {
  const lucros = JSON.parse(localStorage.getItem("lucros")) || {};
  const itensComLucro = Object.entries(lucros);

  if (itensComLucro.length === 0) {
    mostrarToast("Nenhum dado de lucro para exportar!", 'erro');
    return;
  }

  let csv = 'Item,Código,Preço Custo,Preço Venda,Custo Reparo,Lucro,Margem\n';
  
  itensComLucro.forEach(([codigo, dados]) => {
    const lucro = (dados.venda || 0) - (dados.custo || 0) - (dados.reparo || 0);
    const margem = (dados.custo || 0) > 0 ? (lucro / (dados.custo || 1)) * 100 : 0;
    
    csv += `"${dados.nome}","${codigo}",${dados.custo || 0},${dados.venda || 0},${dados.reparo || 0},${lucro},${margem.toFixed(2)}%\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `relatorio-lucros-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  mostrarToast("Relatório de lucros exportado com sucesso!");
}

// Toggle da Sidebar para Mobile
const toggleButton = document.getElementById('toggleSidebar');
const sidebar = document.querySelector('aside');

toggleButton.addEventListener('click', () => {
  sidebar.classList.toggle('hidden');
});

// Adicionar classe active ao item do menu atual
document.addEventListener('DOMContentLoaded', function() {
  const menuItems = document.querySelectorAll('.sidebar-item');
  
  menuItems.forEach(item => {
    if (item.getAttribute('href') === 'lucros.html') {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
});

// Inicialização
window.onload = () => {
  carregarItensSelect();
  atualizarResumoLucros();
  carregarTabelaLucros();
  atualizarGraficoLucros();
  atualizarAnaliseRentabilidade();

  // Event listeners para cálculos em tempo real
  precoCusto.addEventListener('input', calcularPreviewLucro);
  precoVenda.addEventListener('input', calcularPreviewLucro);
  custoReparo.addEventListener('input', calcularPreviewLucro);
  selectItem.addEventListener('change', carregarDadosItem);
};