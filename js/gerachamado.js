// ============================
// Inicializa array de chamados
// ============================
window.chamados = JSON.parse(localStorage.getItem("chamados")) || [];

// Atualiza badge ao carregar a página
window.addEventListener('DOMContentLoaded', () => {
  const badge = document.getElementById("badge-count");
  if (window.chamados.length > 0) {
    badge.textContent = window.chamados.length;
    badge.classList.remove("d-none");
  }
});

// ============================
// Função para criar chamado
// ============================
window.criarChamado = function() {
  const novoChamado = {
    id: window.chamados.length + 1,
    titulo: "Chamado automático",
    descricao: "Chamado criado pela mensagem do bot",
    status: "aberto"
  };

  window.chamados.push(novoChamado);

  // Salva no localStorage
  localStorage.setItem("chamados", JSON.stringify(window.chamados));

  // Atualiza badge
  const badge = document.getElementById("badge-count");
  badge.textContent = window.chamados.length;
  badge.classList.remove("d-none");

  console.log("Chamado criado:", novoChamado);
  console.log(window.chamados)
};

// ============================
// Observer para detectar mensagem do bot
// ============================
const messagesDiv = document.getElementById("messages");

if (messagesDiv) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList.contains("msg") && node.classList.contains("ai")) {
          // Detecta a mensagem específica do bot
          if (node.textContent.includes("")) {
            window.criarChamado();
          }
        }
      });
    });
  });

  observer.observe(messagesDiv, { childList: true });
} else {
  console.error("Container #messages não encontrado!");
}

// ============================
// Opcional: funções para outros scripts
// ============================
window.getChamados = () => window.chamados;
window.adicionarChamado = (chamado) => {
  window.chamados.push(chamado);
  localStorage.setItem("chamados", JSON.stringify(window.chamados));
};
