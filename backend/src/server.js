require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./modules/auth/auth.routes");
const ticketRoutes = require("./modules/tickets/ticket.routes");

const app = express();

// Libera apenas as origens web locais configuradas: Vite (5173) e
// Expo web (8081). Requisições nativas não passam por CORS.
// Para adicionar outra origem, informe-a em CORS_ORIGIN, separada por vírgula.
const defaultOrigins = ["http://localhost:5173", "http://localhost:8081"];
const configuredOrigins = process.env.CORS_ORIGIN
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = configuredOrigins?.length ? configuredOrigins : defaultOrigins;

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());

app.use("/", authRoutes);
app.use("/tickets", ticketRoutes);

app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT ?? 3333;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
