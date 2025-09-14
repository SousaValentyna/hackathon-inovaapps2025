// Chat mechanics
const messagesEl = document.getElementById('messages');
const input = document.getElementById('input-message');
const btnSend = document.getElementById('btn-send');
const categorySelect = document.getElementById('category-select');

let chatHistory = [];
let autoOpenThreshold = 2; // after N failed answers, open ticket
let failCounter = 0;

function addMessage(text, who='ai'){
  const div = document.createElement('div');
  div.className = 'msg ' + (who === 'user' ? 'user' : 'ai');
  div.innerText = text;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  chatHistory.push({who,text,ts: new Date().toISOString()});
}

function clearChat(){
  messagesEl.innerHTML = '';
  chatHistory = [];
  failCounter = 0;
  updateTicketBadge();
  document.getElementById('ticket-status-area').innerHTML = '';
}

function simulateAIReply(userText){
  return new Promise(resolve=>{
    setTimeout(()=>{
      const lowered = userText.toLowerCase();
      if(lowered.includes('não') || lowered.includes('erro') || lowered.includes('falha') || lowered.includes('bug')){
        resolve({solved:false, reply:'Sinto muito — parece um problema que precisa de atenção humana. Posso abrir um chamado para você? Vou avaliar.'});
      } else if(lowered.includes('como') || lowered.includes('como faço') || lowered.includes('ajuda')){
        resolve({solved:true, reply:'Aqui está um passo a passo rápido que pode ajudar: 1) Verifique a conexão 2) Reinicie o app 3) Se persistir, me avise.'});
      } else{
        if(Math.random() < 0.15){
          resolve({solved:false, reply:'Não consegui resolver automaticamente. Deseja que eu abra um chamado?'});
        } else {
          resolve({solved:true, reply:'Tente este procedimento e me diga se funcionou.'});
        }
      }
    }, 800 + Math.random()*600);
  });
}

async function handleSend(){
  const text = input.value.trim();
  if(!text) return;
  addMessage(text, 'user');
  input.value = '';

  const ai = await simulateAIReply(text);
  addMessage(ai.reply, 'ai');

  if(!ai.solved){
    failCounter++;
  } else {
    failCounter = Math.max(0, failCounter-1);
  }

  if(failCounter > autoOpenThreshold){
    const ticket = createTicketFromChat();
    showTicketCreated(ticket);
  }
}

btnSend.addEventListener('click', handleSend);
input.addEventListener('keydown', e=>{ if(e.key === 'Enter'){ e.preventDefault(); handleSend(); } });

// Tickets store (localStorage)
function loadTickets(){ try{ return JSON.parse(localStorage.getItem('tickets_v1')||'[]'); }catch(e){ return []; } }
function saveTickets(list){ localStorage.setItem('tickets_v1', JSON.stringify(list)); updateTicketBadge(); }

function createTicketFromChat(){
  const tickets = loadTickets();
  const id = 'CH-' + Date.now().toString().slice(-6);
  const ticket = {
    id,
    title: (chatHistory[0] && chatHistory[0].text.slice(0,80)) || 'Chamado gerado via chat',
    description: chatHistory.map(m=>`[${m.who}] ${m.text}`).join('\n'),
    category: categorySelect.value || 'Outros',
    area: 'Suporte Técnico',
    status: 'pending',
    openedBy: 'Solicitante',
    createdAt: new Date().toISOString(),
    chat: [...chatHistory]
  };
  tickets.unshift(ticket);
  saveTickets(tickets);
  return ticket;
}

function showTicketCreated(ticket){
  document.getElementById('ticket-status-area').innerHTML = `<span class="ticket-pill ticket-pending">Chamado aberto: ${ticket.id}</span>`;
  renderTicketsList();
  const badge = document.getElementById('badge-count');
  badge.classList.remove('bg-secondary'); badge.classList.add('bg-danger');
  setTimeout(()=>{ badge.classList.remove('bg-danger'); badge.classList.add('bg-secondary'); }, 1500);
}

// Render tickets (mesmo código, pode manter)
function renderTicketsList(){
  const listEl = document.getElementById('tickets-list');
  const noEl = document.getElementById('no-tickets');
  const tickets = loadTickets();
  const q = document.getElementById('search-tickets').value.trim().toLowerCase();
  const statusFilter = document.getElementById('filter-status').value;
  const filtered = tickets.filter(t=>{
    if(statusFilter !== 'all'){
      if(statusFilter === 'pending' && t.status !== 'pending') return false;
      if(statusFilter === 'open' && t.status !== 'open') return false;
      if(statusFilter === 'closed' && t.status !== 'closed') return false;
    }
    if(!q) return true;
    return t.id.toLowerCase().includes(q) || (t.title && t.title.toLowerCase().includes(q)) || (t.category && t.category.toLowerCase().includes(q));
  });
  listEl.innerHTML = '';
  if(filtered.length === 0){ noEl.classList.remove('d-none'); } else { noEl.classList.add('d-none'); }
  filtered.forEach(t=>{
    const item = document.createElement('a');
    item.href='#'; item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-start';
    item.innerHTML = `<div>
        <div class=\"fw-bold\">${t.title}</div>
        <div class=\"text-muted small\">${t.category} • ${new Date(t.createdAt).toLocaleString()}</div>
      </div>
      <div class=\"text-end\">
        <div class=\"small mb-1\">ID: ${t.id}</div>
        <div>${renderStatusPill(t.status)}</div>
      </div>`;
    item.addEventListener('click', (e)=>{ e.preventDefault(); openTicketModal(t.id); });
    listEl.appendChild(item);
  });
  updateTicketBadge();
}

function renderStatusPill(status){
  if(status === 'pending') return `<span class='ticket-pill ticket-pending'>Pendente</span>`;
  if(status === 'closed') return `<span class='ticket-pill ticket-closed'>Fechado</span>`;
  return `<span class='ticket-pill' style='background:#e7f3ff;color:#0b2b5a;'>Em andamento</span>`;
}

function updateTicketBadge(){
  const tickets = loadTickets();
  const count = tickets.length;
  document.getElementById('badge-count').innerText = count;
}


// Modal (mesmo código, pode manter)
const ticketModal = new bootstrap.Modal(document.getElementById('ticketModal'));
function openTicketModal(id){ 
  const tickets = loadTickets();
  const t = tickets.find(x=> x.id === id);
  if(!t) return;
  document.getElementById('modal-ticket-id').innerText = t.id;
  document.getElementById('modal-ticket-title').innerText = t.title;
  document.getElementById('modal-ticket-desc').innerText = t.description;
  document.getElementById('modal-category').innerText = t.category;
  document.getElementById('modal-status').innerHTML = renderStatusPill(t.status);
  document.getElementById('modal-id').innerText = t.id;
  const historyEl = document.getElementById('modal-chat-history');
  historyEl.innerHTML = '';
  (t.chat || []).forEach(m=>{
    const p = document.createElement('div'); p.className = m.who === 'user' ? 'text-end small mb-2' : 'small mb-2';
    p.innerHTML = `<strong>${m.who === 'user' ? 'Você' : 'Agente'}</strong>: ${m.text}`;
    historyEl.appendChild(p);
  });
  ticketModal.show();
}

// inicialização
(function init(){
  renderTicketsList();
})();
