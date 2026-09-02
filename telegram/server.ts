import { Connection } from "@solana/web3.js";
import express from "express";
import cors from "cors";
import "dotenv/config";
const connection = new Connection(
  process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com", 
  "confirmed"
);

const app = express();
app.use(cors());
app.use(express.json());
const pythonApiUrl = (process.env.PYTHON_API_URL || "http://localhost:5000").replace(/\/$/, "");

async function proxyToPython(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${pythonApiUrl}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
}

app.get("/api/health", async (_req, res) => {
  try {
    const response = await proxyToPython("/health");
    res.status(response.status).send(await response.text());
  } catch {
    res.status(503).json({ status: "unavailable", error: "API Python indisponível." });
  }
});

app.get("/api/pay", async (req, res) => {
  const reference = typeof req.query.reference === "string" ? req.query.reference : "";
  if (!reference) return res.status(400).json({ error: "Referência do pedido é obrigatória." });

  try {
    const response = await proxyToPython(`/pay?reference=${encodeURIComponent(reference)}`);
    res.status(response.status).send(await response.text());
  } catch {
    res.status(503).json({ error: "API Python indisponível." });
  }
});

app.post("/api/process-solana-pay", async (req, res) => {
  try {
    const response = await proxyToPython("/process-solana-pay", {
      method: "POST",
      body: JSON.stringify(req.body),
    });
    res.status(response.status).send(await response.text());
  } catch {
    res.status(503).json({ success: false, error: "API Python indisponível para processar o pagamento." });
  }
});

app.post("/api/pay", async (req, res) => {
  const reference = typeof req.query.reference === "string" ? req.query.reference : "";
  if (!reference) return res.status(400).json({ error: "Referência do pedido é obrigatória." });

  try {
    const response = await proxyToPython(`/pay?reference=${encodeURIComponent(reference)}`, {
      method: "POST",
      body: JSON.stringify(req.body),
    });
    res.status(response.status).send(await response.text());
  } catch {
    res.status(503).json({ error: "API Python indisponível." });
  }
});

app.use(express.static("public"));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`🍻 Mini App em http://localhost:${port} | API Python: ${pythonApiUrl}`));