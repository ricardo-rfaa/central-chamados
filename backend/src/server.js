require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./modules/auth/auth.routes");
const ticketRoutes = require("./modules/tickets/ticket.routes");

const app = express();

// Libera o front do Vite (padrão: http://localhost:5173) a chamar esta API.
// Ajuste CORS_ORIGIN no .env se o front rodar em outra porta/host.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
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
