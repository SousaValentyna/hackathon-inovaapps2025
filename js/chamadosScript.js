// Inicializa window.chamados a partir do localStorage
window.chamados = JSON.parse(localStorage.getItem("chamados")) || [];
let chamados = window.chamados; // referência local

// Referências aos elementos HTML
const ticketsList = document.getElementById("tickets-list");
const noTickets = document.getElementById("no-tickets");
const searchInput = document.getElementById("search-tickets");
const filterStatus = document.getElementById("filter-status");
const badge = document.getElementById("badge-count");

// Função para renderizar a lista de chamados
function renderChamados() {
    const filtro = filterStatus.value.toLowerCase().trim();
    const pesquisa = searchInput.value.toLowerCase().trim();

    ticketsList.innerHTML = "";

    const filtrados = window.chamados.filter(chamado => {
        const statusOk = filtro === "todos" || chamado.status.toLowerCase().trim() === filtro;
        const pesquisaOk = chamado.titulo.toLowerCase().includes(pesquisa) ||
            chamado.id.toString().includes(pesquisa);
        return statusOk && pesquisaOk;
    });

    if (filtrados.length === 0) {
        noTickets.classList.remove("d-none");
    } else {
        noTickets.classList.add("d-none");
        filtrados.forEach(chamado => {
            const item = document.createElement("div");
            const statusCapitalizado = chamado.status.charAt(0).toUpperCase() + chamado.status.slice(1);

            item.className = "list-group-item list-group-item-action flex-column align-items-start";
            item.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">${chamado.titulo}</h6>
            <small class="text-muted">ID: ${chamado.id}</small>
        </div>
        <p class="mb-1">${chamado.descricao}</p>
        <small class="status-group" >Status: <div class="btn-status"> ${statusCapitalizado} </div> </small>
    `;
            // Adiciona clique para redirecionar para a tela de alteração de status
            item.addEventListener("click", () => {
                localStorage.setItem("chamadoSelecionadoId", chamado.id);
                window.location.href = "alterarStatus.html";
            });
            ticketsList.appendChild(item);
        });

    }

    badge.textContent = window.chamados.length;
    badge.classList.toggle("d-none", window.chamados.length === 0);
}

// Eventos
searchInput.addEventListener("input", renderChamados);
filterStatus.addEventListener("change", renderChamados);

// Função para adicionar chamado
window.adicionarChamado = (chamado) => {
    chamados.push(chamado);
    window.chamados = chamados;
    localStorage.setItem("chamados", JSON.stringify(chamados));
    renderChamados();
};

// Inicializa renderização
window.addEventListener("DOMContentLoaded", renderChamados);
