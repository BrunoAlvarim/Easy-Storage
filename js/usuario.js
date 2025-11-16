// Elementos do DOM
const toast = document.getElementById('toast');
const modalConfirmacao = document.getElementById('modalConfirmacao');
const modalMensagem = document.getElementById('modalMensagem');
const btnConfirmar = document.getElementById('btnConfirmar');
const btnCancelar = document.getElementById('btnCancelar');
const avatarInput = document.getElementById('avatarInput');
const avatarPreview = document.getElementById('avatarPreview');
const avatarPlaceholder = document.getElementById('avatarPlaceholder');

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

// Upload de Avatar
avatarInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB
      mostrarToast('A imagem deve ter no máximo 5MB', 'erro');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      avatarPreview.src = e.target.result;
      avatarPreview.classList.remove('hidden');
      avatarPlaceholder.classList.add('hidden');
      
      // Salvar no localStorage
      localStorage.setItem('userAvatar', e.target.result);
      mostrarToast('Foto de perfil atualizada com sucesso!');
    };
    reader.readAsDataURL(file);
  }
});

// Carregar avatar salvo
function carregarAvatar() {
  const savedAvatar = localStorage.getItem('userAvatar');
  if (savedAvatar) {
    avatarPreview.src = savedAvatar;
    avatarPreview.classList.remove('hidden');
    avatarPlaceholder.classList.add('hidden');
  }
}

// Alterar Senha
function alterarSenha() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    mostrarToast('Preencha todos os campos de senha', 'erro');
    return;
  }

  if (newPassword !== confirmPassword) {
    mostrarToast('As senhas não coincidem', 'erro');
    return;
  }

  if (newPassword.length < 6) {
    mostrarToast('A senha deve ter pelo menos 6 caracteres', 'erro');
    return;
  }

  // Simular alteração de senha
  mostrarToast('Senha alterada com sucesso!');
  
  // Limpar campos
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
}

// Salvar Alterações
function salvarAlteracoes() {
  const userName = document.getElementById('userName').value;
  const userEmail = document.getElementById('userEmail').value;
  const userPhone = document.getElementById('userPhone').value;
  const userRole = document.getElementById('userRole').value;

  if (!userName || !userEmail) {
    mostrarToast('Preencha pelo menos nome e email', 'erro');
    return;
  }

  // Salvar no localStorage
  const userData = {
    name: userName,
    email: userEmail,
    phone: userPhone,
    role: userRole,
    emailNotifications: document.getElementById('emailNotifications').checked
  };

  localStorage.setItem('userData', JSON.stringify(userData));
  mostrarToast('Alterações salvas com sucesso!');
}

// Carregar dados do usuário
function carregarDadosUsuario() {
  const savedData = localStorage.getItem('userData');
  if (savedData) {
    const userData = JSON.parse(savedData);
    document.getElementById('userName').value = userData.name || 'Usuário';
    document.getElementById('userEmail').value = userData.email || 'usuario@exemplo.com';
    document.getElementById('userPhone').value = userData.phone || '(11) 99999-9999';
    document.getElementById('userRole').value = userData.role || 'Administrador';
    document.getElementById('emailNotifications').checked = userData.emailNotifications !== false;
  }
}

// Carregar estatísticas
function carregarEstatisticas() {
  const itens = JSON.parse(localStorage.getItem("itens")) || [];
  const removidos = JSON.parse(localStorage.getItem("removidos")) || [];

  document.getElementById('totalItens').textContent = itens.length + removidos.length;
  document.getElementById('ativosItens').textContent = itens.length;
  document.getElementById('removidosItens').textContent = removidos.length;
  
  // Data de cadastro (simulada)
  const hoje = new Date();
  document.getElementById('membroDesde').textContent = hoje.getFullYear();
}

// Exportar Dados
function exportarDados() {
  const itens = JSON.parse(localStorage.getItem("itens")) || [];
  const removidos = JSON.parse(localStorage.getItem("removidos")) || [];
  const userData = JSON.parse(localStorage.getItem("userData")) || {};

  const dadosExportacao = {
    usuario: userData,
    estatisticas: {
      totalItens: itens.length + removidos.length,
      itensAtivos: itens.length,
      itensRemovidos: removidos.length
    },
    itens: itens,
    historico: removidos,
    dataExportacao: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(dadosExportacao, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `easy-storage-dados-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  mostrarToast('Dados exportados com sucesso!');
}

// Limpar Dados
function limparDados() {
  confirmarAcao('Tem certeza que deseja limpar todos os seus dados?\n\nEsta ação removerá todos os itens cadastrados e não pode ser desfeita.', (confirmado) => {
    if (!confirmado) return;

    localStorage.removeItem("itens");
    localStorage.removeItem("removidos");
    carregarEstatisticas();
    mostrarToast('Todos os dados foram limpos!', 'erro');
  });
}

// Excluir Conta
function excluirConta() {
  confirmarAcao('Tem certeza que deseja excluir sua conta permanentemente?\n\nTodos os seus dados serão perdidos e esta ação é IRREVERSÍVEL.', (confirmado) => {
    if (!confirmado) return;

    localStorage.clear();
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
    mostrarToast('Conta excluída com sucesso! Redirecionando...', 'erro');
  });
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
    if (item.getAttribute('href') === 'usuario.html') {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
});

// Inicialização
window.onload = () => {
  carregarAvatar();
  carregarDadosUsuario();
  carregarEstatisticas();
};