import express from "express"; // Framework para criar API e servidor web
import fs from "fs";           // Módulo do Node.js para manipular arquivos
import path from "path";       // Módulo do Node.js para lidar com caminhos de arquivos/pastas

// Cria uma aplicação Express
const app = express();
// Define a porta do servidor (pode ser alterada se precisar)
const PORT = 3000;

// Middleware para entender requisições JSON
// Exemplo: quando o frontend manda { titulo: "...", descricao: "..." }
app.use(express.json());

// Middleware para servir arquivos estáticos da pasta "public"
// Assim você pode abrir seu frontend (HTML, CSS, JS) direto pelo servidor
app.use(express.static("public"));

// Caminho para o arquivo de dados (chamados.json) dentro da pasta /data
const dataPath = path.join(process.cwd(), "data", "chamados.json");

/* 
  ============================
   ROTA GET /api/chamados
   Lista todos os chamados
  ============================
*/
app.get("/api/chamados", (req, res) => {
  // Lê o arquivo chamados.json como texto
  const raw = fs.readFileSync(dataPath, "utf8");
  // Converte o texto JSON em objeto JavaScript
  const db = JSON.parse(raw);
  // Retorna o objeto como resposta
  res.json(db);
});

/* 
  ============================
   ROTA POST /api/chamados
   Cria um novo chamado
  ============================
*/
app.post("/api/chamados", (req, res) => {
  // Lê os dados existentes do arquivo
  const raw = fs.readFileSync(dataPath, "utf8");
  const db = JSON.parse(raw);

  // Cria um novo chamado
  const novoChamado = {
    // Gera ID incremental (último ID + 1 ou 1 se não houver nenhum chamado ainda)
    id: db.chamados.length ? db.chamados[db.chamados.length - 1].id + 1 : 1,
    // Usa título e descrição enviados pelo frontend
    titulo: req.body.titulo || "Chamado gerado via chat",
    descricao: req.body.descricao || "Sem descrição",
    // Todo chamado novo começa como "Aberto"
    status: "Aberto"
  };

  // Adiciona o chamado ao array
  db.chamados.push(novoChamado);

  // Salva a versão atualizada no arquivo JSON
  fs.writeFileSync(dataPath, JSON.stringify(db, null, 2));

  // Responde para o frontend confirmando a criação
  res.status(201).json(novoChamado);
});

/* 
  ============================
   INICIALIZAÇÃO DO SERVIDOR
  ============================
*/
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
