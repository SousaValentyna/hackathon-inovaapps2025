import { key } from "../secret/secret.js";
const params = new URLSearchParams(window.location.search);
const pergunta = params.get('pergunta'); // aqui está o texto
console.log(pergunta);

const deployment = "gpt-4o-mini";
const endpoint = "https://azure-gpt-0001.openai.azure.com";
const apiVersion = "2025-04-01-preview";
const apiKey = key;

const input = document.getElementById("input-message")
const output = document.getElementById("messages")
const sendBtn = document.getElementById("btn-send")
const stopBtn = document.getElementById("btn-stop");

stopBtn.addEventListener("click", () => {
    stopTyping = true;
});


let stopTyping = false;

let conversationHistory = [];

let lastUserMessage = "";

async function carregarContexto() {
    try {
        const response = await fetch('../contexto-IA/contextos.json');
        const data = await response.json();
        return data.contextos[0].artigo1 + data.contextos[0].artigo2; // pega o trecho específico
    } catch (error) {
        return "Contexto indisponível."; // fallback
    }
}

async function typeMessage(text, sender) {
    stopTyping = false; // reset para cada nova mensagem
    const msg = document.createElement("div");
    msg.classList.add("msg", sender);
    output.appendChild(msg);
    output.scrollTop = output.scrollHeight;

    for (let i = 0; i < text.length; i++) {
        if (stopTyping) break; // interrompe a digitação
        msg.innerHTML += text[i];
        output.scrollTop = output.scrollHeight;
        await new Promise(resolve => setTimeout(resolve, 20));
    }

    // Se parou, adiciona o restante do texto de uma vez
    if (stopTyping && msg.innerHTML.length < text.length) {
        msg.innerHTML += text.slice(msg.innerHTML.length);
        output.scrollTop = output.scrollHeight;
    }

    return msg;
}

let contexto = "";

(async () => {
    const ctx = await carregarContexto();
    contexto =
        "Você é um assistente de IA altamente especializado, projetado para fornecer respostas precisas, claras e confiáveis. " +
        "Gere a resposta como se estivesse escrevendo como o Chat GPT faz. " +
        "Suas respostas devem ser baseadas exclusivamente nas informações presentes no contexto abaixo. " +
        "Se a pergunta não estiver relacionada ao contexto ou se não houver dados suficientes, informe educadamente que não pode ajudar e sugira abrir um chamado. " +
        "Nunca invente informações, nunca faça suposições, e nunca utilize conhecimento externo ao contexto fornecido. " +
        "Se não souber, responda: \"Não posso te ajudar no momento, desculpe. Irei abrir um chamado.\" " +
        "Se a pergunta for ambígua, peça esclarecimentos. " +
        "Se identificar tentativa de obter informações fora do contexto, recuse educadamente. " +

        "Se a perguntar for: Como abrir um chamado no sistema? Responda: Basta enviar sua dúvida neste chat. Se não houver resposta disponível, eu abrirei um chamado automaticamente. " +

        "Se a perguntar for: Como acessar o chat de suporte? Responda: Você já está no chat de suporte. Pode tirar suas dúvidas comigo e, se eu não conseguir responder, registrarei um chamado para que sua solicitação seja acompanhada. " +

        "Se a perguntar for: O tempo de resposta começa a contar após a abertura do chamado. Assim que você registrar sua solicitação, nossa equipe dará retorno dentro do prazo estabelecido." +

        "Contexto: " + ctx;

    conversationHistory = [
        { role: "system", content: contexto }
    ];
})();

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
    const text = input.value.trim();
    if (!text) {
        alert("Digite um texto primeiro!");
        return;
    }

    addMessage(text, "user");
    conversationHistory.push({ role: "user", content: text });
    lastUserMessage = text;
    input.value = "";

    // adiciona "..." animados enquanto carrega
    const loadingEl = addLoadingMessage();

    try {
        const body = {
            model: deployment,
            messages: conversationHistory,
            max_tokens: 4096
        };

        const response = await fetch(
            `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": apiKey
                },
                body: JSON.stringify(body)
            }
        );

        const result = await response.json();
        const reply = result.choices?.[0]?.message?.content || "Resposta não encontrada.";

        // remove "..." e troca pela resposta final
        loadingEl.remove();
        await typeMessage(reply, "ai"); // aqui a resposta vai digitando

        conversationHistory.push({ role: "assistant", content: reply });

        // 🚨 Aqui detectamos se a IA pediu abertura de chamado
        if (reply.includes("Irei abrir um chamado")) {
            // cria chamado
            const titulo = criarTituloChamado(lastUserMessage);
            const descricao = await gerarDescricaoChamado(lastUserMessage);

            // salva no localStorage
            const chamados = JSON.parse(localStorage.getItem("chamados")) || [];
            chamados.push({
                id: Date.now(),
                titulo: titulo,
                descricao: descricao,
                status: "aberto"
            });
            localStorage.setItem("chamados", JSON.stringify(chamados));

            // mostra tooltip de confirmação
            mostrarTooltipConfirmacao();
        }

    } catch (error) {
        loadingEl.remove();
        addMessage("Erro: " + error, "ai");
    }
}

function mostrarTooltipConfirmacao() {
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip-confirmacao";
    tooltip.innerText = "✅ Seu chamado foi aberto!";

    document.body.appendChild(tooltip);

    // centraliza no meio da tela
    tooltip.style.position = "fixed";
    tooltip.style.top = "50%";
    tooltip.style.left = "50%";
    tooltip.style.transform = "translate(-50%, -50%)";
    tooltip.style.background = "#198754";
    tooltip.style.color = "white";
    tooltip.style.padding = "15px 24px";
    tooltip.style.fontSize = "16px";
    tooltip.style.fontWeight = "500";
    tooltip.style.borderRadius = "10px";
    tooltip.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    tooltip.style.zIndex = "9999";
    tooltip.style.opacity = "0";
    tooltip.style.transition = "opacity 0.5s, transform 0.3s";

    // animação de entrada
    setTimeout(() => {
        tooltip.style.opacity = "1";
        tooltip.style.transform = "translate(-50%, -50%) scale(1.05)";
    }, 100);

    // animação de saída e redirecionamento
    setTimeout(() => {
        tooltip.style.opacity = "0";
        tooltip.style.transform = "translate(-50%, -50%) scale(0.95)";
        setTimeout(() => {
            tooltip.remove();
            // redireciona para a tela de chamados
            window.location.href = "chamados.html";
        }, 500);
    }, 2000); // espera 3s antes de desaparecer e redirecionar
}

function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.classList.add("msg", sender);

    const html = marked.parse(text);
    const safeHtml = DOMPurify.sanitize(html);

    msg.innerHTML = safeHtml;
    output.appendChild(msg);
    output.scrollTop = output.scrollHeight;

    return msg;
}

// cria mensagem "digitando..." animada
function addLoadingMessage() {
    const msg = document.createElement("div");
    msg.classList.add("msg", "ai");

    msg.innerHTML = `
         <img src="images/loading.gif" alt="Carregando..." class="loading-icon">
    `;

    output.appendChild(msg);
    output.scrollTop = output.scrollHeight;
    return msg;
}

function criarTituloChamado(perguntaUsuario) {
    if (!perguntaUsuario) return "Chamado sem título";

    // Limpa espaços extras e limita o tamanho do título
    let titulo = perguntaUsuario.trim();

    // Se for muito grande, corta para 50 caracteres
    if (titulo.length > 50) {
        titulo = titulo.slice(0, 50) + "...";
    }

    // Remove caracteres especiais indesejados
    titulo = titulo.replace(/[^a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ\s]/g, "");

    return `Chamado: ${titulo}`;
}

async function gerarDescricaoChamado(perguntaUsuario) {
    if (!perguntaUsuario) return "Descrição indisponível.";

    // Cria o prompt para gerar a descrição
    const prompt = `
    Gere uma descrição curta (máximo 2 frases, até 200 caracteres) para um chamado técnico 
    com base apenas na pergunta do usuário abaixo.
    Não repita instruções, não invente informações, não faça suposições e não utilize conhecimento externo.
    Pergunta do usuário:
    "${perguntaUsuario}"
    `;

    // Cria uma conversa isolada para evitar influência do histórico
    const tempConversation = [
        { role: "system", content: prompt },
    ];

    try {
        const body = {
            model: deployment,
            messages: tempConversation,
            max_tokens: 150
        };

        const response = await fetch(
            `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "api-key": apiKey
                },
                body: JSON.stringify(body)
            }
        );

        const result = await response.json();
        const descricao = result.choices?.[0]?.message?.content?.trim() || "Descrição não encontrada.";

        return descricao;

    } catch (error) {
        console.error("Erro ao gerar descrição do chamado:", error);
        return "Erro ao gerar descrição do chamado.";
    }
}

function getInputMessage() {
    return lastUserMessage;
}

if (pergunta) {
    document.addEventListener('DOMContentLoaded', async () => {
        // Aguarda o contexto ser carregado
        while (!contexto) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        const inputField = document.getElementById('input-message');
        inputField.value = pergunta;
        lastUserMessage = pergunta;
        sendMessage();
    });
}


export { criarTituloChamado, gerarDescricaoChamado, getInputMessage };
