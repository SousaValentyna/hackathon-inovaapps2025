import { criarTituloChamado, gerarDescricaoChamado, getInputMessage } from './chatScript.js';

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
window.criarChamado = async function() {
  const pergunta = getInputMessage();

  const titulo = criarTituloChamado(pergunta);
  const descricao = await gerarDescricaoChamado(pergunta);

  const novoChamado = {
    id: window.chamados.length + 1,
    titulo: titulo,
    descricao: descricao,
    status: "aberto"
  };

  window.chamados.push(novoChamado);
  localStorage.setItem("chamados", JSON.stringify(window.chamados));

  const badge = document.getElementById("badge-count");
  badge.textContent = window.chamados.length;
  badge.classList.remove("d-none");

  console.log("Chamado criado:", novoChamado);
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
          if (node.textContent.includes("Não posso te ajudar no momento, desculpe. Irei abrir um chamado.")) {
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

window.getChamados = () => window.chamados;
window.adicionarChamado = (chamado) => {
  window.chamados.push(chamado);
  localStorage.setItem("chamados", JSON.stringify(window.chamados));
};