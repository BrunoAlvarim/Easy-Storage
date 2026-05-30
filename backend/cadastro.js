// ==========================
// Elementos do DOM para toast
// ==========================
const toast = document.getElementById('toast');

// URL base da API (dinâmica para suporte a hospedagem)
const API_BASE_URL = window.location.protocol === 'file:'
  ? 'http://localhost:3001'
  : window.location.origin;

// Função para mostrar Toast (notificação flutuante)
function mostrarToast(mensagem, tipo = 'sucesso') {
  const conteudo = document.getElementById('toastConteudo');
  const icone = tipo === 'sucesso' ? '✅' : '❌';
  const corClasse = tipo === 'sucesso' ? 'bg-green-100 border-green-300 text-green-800' : 'bg-red-100 border-red-300 text-red-800';
  
  conteudo.innerHTML = `
    <span class="mr-2">${icone}</span>
    <span>${mensagem}</span>
  `;
  toast.className = `fixed top-4 right-4 z-50 ${corClasse} border rounded-lg shadow-lg p-4 max-w-sm w-full mx-4 transition-opacity duration-300 opacity-100`;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 4000);
}

// ==========================
// Função de Cadastro com Backend
// ==========================
async function cadastrarUsuario() {
  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;

  if (!nome || !email || !senha) {
    mostrarToast("Preencha todos os campos!", 'erro');
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    });

    const data = await response.json();

    if (response.ok) {
      mostrarToast("Cadastro realizado com sucesso! Redirecionando para login...");
      setTimeout(() => window.location.href = "login.html", 2000);
    } else {
      mostrarToast(data.message || "Erro ao cadastrar usuário.", 'erro');
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    mostrarToast("Erro de conexão com o servidor.", 'erro');
  }
}