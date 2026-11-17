import express from "express";
import dotenv from "dotenv";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "data.json");

const colecoesPermitidas = [
  "beneficiarios",
  "doadores",
  "voluntarios",
  "doacoes",
  "entregas"
];

app.use(express.json({ limit: "100kb" }));

async function lerDados() {
  try {
    const conteudo = await readFile(DATA_FILE, "utf8");
    return JSON.parse(conteudo);
  } catch (error) {
    if (error.code === "ENOENT") {
      const inicial = {
        beneficiarios: [],
        doadores: [],
        voluntarios: [],
        doacoes: [],
        entregas: []
      };
      await salvarDados(inicial);
      return inicial;
    }
    throw error;
  }
}

async function salvarDados(dados) {
  await writeFile(
    DATA_FILE,
    JSON.stringify(dados, null, 2),
    "utf8"
  );
}

// Verificação da API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API funcionando corretamente",
    organization: "ONG Rede Solidária Esperança",
    timestamp: new Date().toISOString()
  });
});

// Consultar todos os registros
app.get("/api/:colecao", async (req, res) => {
  try {
    const { colecao } = req.params;

    if (!colecoesPermitidas.includes(colecao)) {
      return res.status(404).json({ erro: "Coleção não encontrada" });
    }

    const dados = await lerDados();
    res.json(dados[colecao]);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao consultar registros" });
  }
});

// Cadastrar registro
app.post("/api/:colecao", async (req, res) => {
  try {
    const { colecao } = req.params;

    if (!colecoesPermitidas.includes(colecao)) {
      return res.status(404).json({ erro: "Coleção não encontrada" });
    }

    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body) ||
      Object.keys(req.body).length === 0
    ) {
      return res.status(400).json({ erro: "Dados inválidos" });
    }

    const dados = await lerDados();

    const registro = {
      ...req.body,
      id: randomUUID(),
      criadoEm: new Date().toISOString()
    };

    dados[colecao].push(registro);
    await salvarDados(dados);

    res.status(201).json({
      mensagem: "Cadastro realizado com sucesso",
      registro
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao cadastrar registro" });
  }
});

// Editar registro
app.put("/api/:colecao/:id", async (req, res) => {
  try {
    const { colecao, id } = req.params;

    if (!colecoesPermitidas.includes(colecao)) {
      return res.status(404).json({ erro: "Coleção não encontrada" });
    }

    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body)
    ) {
      return res.status(400).json({ erro: "Dados inválidos" });
    }

    const dados = await lerDados();
    const indice = dados[colecao].findIndex(
      item => item.id === id
    );

    if (indice === -1) {
      return res.status(404).json({ erro: "Registro não encontrado" });
    }

    const { id: idIgnorado, criadoEm: dataOriginal, ...alteracoes } = req.body;

    dados[colecao][indice] = {
      ...dados[colecao][indice],
      ...alteracoes,
      id,
      criadoEm: dataOriginal || dados[colecao][indice].criadoEm,
      atualizadoEm: new Date().toISOString()
    };

    await salvarDados(dados);

    res.json({
      mensagem: "Registro atualizado com sucesso",
      registro: dados[colecao][indice]
    });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atualizar registro" });
  }
});

// Excluir registro
app.delete("/api/:colecao/:id", async (req, res) => {
  try {
    const { colecao, id } = req.params;

    if (!colecoesPermitidas.includes(colecao)) {
      return res.status(404).json({ erro: "Coleção não encontrada" });
    }

    const dados = await lerDados();
    const quantidadeAnterior = dados[colecao].length;

    dados[colecao] = dados[colecao].filter(
      item => item.id !== id
    );

    if (dados[colecao].length === quantidadeAnterior) {
      return res.status(404).json({ erro: "Registro não encontrado" });
    }

    await salvarDados(dados);

    res.json({ mensagem: "Registro excluído com sucesso" });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao excluir registro" });
  }
});

app.listen(PORT, () => {
  console.log("API disponivel na porta 3001");
});
