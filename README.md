# Ajuda.Ai — Central de Suporte Inteligente

Ajuda.Ai é uma aplicação web desenvolvida para o Hackathon InovaApps 2025, focada em transformar o atendimento ao cliente e suporte técnico utilizando Inteligência Artificial generativa.

## Demonstração

[https://www.youtube.com/watch?v=https://youtu.be/VEP0yAQw1os](https://youtu.be/VEP0yAQw1os?si=HxBCcJwnvQOuAyRg)

## Funcionalidades Principais

- **Chat de Suporte com IA:**
  - Usuários podem descrever seus problemas diretamente no chat.
  - A IA responde com base em contexto técnico, fornecendo soluções rápidas e precisas.
  - Caso a IA não consiga ajudar, ela sugere abrir um chamado automaticamente.

- **Abertura e Gerenciamento de Chamados:**
  - Sistema integrado para abertura de chamados técnicos.
  - Geração automática de título e descrição detalhada do chamado usando IA.
  - Visualização e alteração do status dos chamados.

- **Dashboard Interativo:**
  - Painel para acompanhamento dos chamados abertos, em andamento e resolvidos.
  - Estatísticas e métricas de atendimento.

- **Interface Moderna e Responsiva:**
  - Design limpo, intuitivo e adaptado para dispositivos móveis e desktop.
  - Utilização de Bootstrap para experiência visual aprimorada.

## Diferenciais

- **IA Especializada:** Responde apenas com base no contexto fornecido, evitando informações incorretas ou inventadas.
- **Automação Inteligente:** Facilita o fluxo de atendimento, reduzindo tempo de resposta e burocracia.
- **Segurança:** Utiliza API Key protegida para acesso ao modelo de IA.
- **Extensível:** Estrutura modular para fácil integração com outros sistemas de suporte.

## Tecnologias Utilizadas

- HTML5, CSS3, JavaScript (ES6 Modules)
- Bootstrap 5
- Azure OpenAI (GPT-4o)
- JSON para contexto dinâmico

## Como Executar

1. Clone o repositório:
   ```
   git clone https://github.com/SousaValentyna/hackathon-inovaapps2025.git
   ```
2. Instale as dependências necessárias (se houver).
3. Execute um servidor local (ex: Live Server no VS Code ou `python -m http.server`).
4. Acesse `http://localhost:8000/home.html` ou `chat.html`.
5. Configure sua chave de API em `secret/secret.js`.

## Estrutura do Projeto

```
├── chat.html
├── dashboard.html
├── home.html
├── chamados.html
├── alterarStatus.html
├── teste.html
├── js/
│   ├── chatScript.js
│   ├── gerarchamadoScript.js
│   ├── chamadosScript.js
│   └── server.js
├── css/
│   └── style.css
├── images/
│   ├── logo.png
│   └── robot.png
├── contexto-IA/
│   └── contextos.json
└── secret/
    └── secret.js
```

## Sobre o Hackathon

Esta aplicação foi criada para o Hackathon InovaApps 2025, com o objetivo de inovar o atendimento digital, tornando-o mais eficiente, inteligente e humano.

---

**Desenvolvido por:** Artemis
