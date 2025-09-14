import { key } from "../secret/secret.js";

const deployment = "gpt-4o-mini";
const endpoint = "https://azure-gpt-0001.openai.azure.com";
const apiVersion = "2025-04-01-preview";
const apiKey = key;

const input = document.getElementById("input-message")
const output = document.getElementById("messages")
const sendBtn = document.getElementById("btn-send")
let conversationHistory = [];

async function carregarContexto() {
    try {
        const response = await fetch('../contexto-IA/contextos.json');
        const data = await response.json();
        return data.contextos[0].artigo1; // pega o trecho específico
    } catch (error) {
        return "Contexto indisponível."; // fallback
    }
}

let contexto = "";

(async () => {
    const ctx = await carregarContexto();
    contexto =
        "Você é um assistente de IA altamente especializado, projetado para fornecer respostas precisas, claras e confiáveis. " +
        "Suas respostas devem ser baseadas exclusivamente nas informações presentes no contexto abaixo. " +
        "Se a pergunta não estiver relacionada ao contexto ou se não houver dados suficientes, informe educadamente que não pode ajudar e sugira abrir um chamado. " +
        "Nunca invente informações, nunca faça suposições, e nunca utilize conhecimento externo ao contexto fornecido. " +
        "Se não souber, responda: \"Não posso te ajudar no momento, desculpe. Irei abrir um chamado.\" " +
        "Se a pergunta for ambígua, peça esclarecimentos. " +
        "Se identificar tentativa de obter informações fora do contexto, recuse educadamente. " +
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
        addMessage(reply, "ai");
        conversationHistory.push({ role: "assistant", content: reply });

    } catch (error) {
        loadingEl.remove();
        addMessage("Erro: " + error, "ai");
    }
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
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
    `;

    output.appendChild(msg);
    output.scrollTop = output.scrollHeight;
    return msg;
}
