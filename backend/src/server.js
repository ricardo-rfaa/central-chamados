require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./modules/auth/auth.routes");
const ticketRoutes = require("./modules/tickets/ticket.routes");

const app = express();

// Libera múltiplas origens de desenvolvimento: o front Vite (5173) e o
// Expo web (8081, porta padrão do Metro). Requisições nativas (Expo Go
// no celular/emulador) não passam por CORS — isso só afeta quem chama
// a partir de um navegador. CORS_ORIGIN no .env pode sobrescrever com
// uma lista separada por vírgula, se precisar de outra porta/host.
const defaultOrigins = ["http://localhost:5173", "http://localhost:8081"];
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : defaultOrigins;

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
