import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API funcionando corretamente",
    organization: "ONG Rede Solidária Esperança",
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`API disponível em http://localhost:${PORT}`);
});
