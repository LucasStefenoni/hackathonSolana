import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ROTA 1: Processar o pagamento (Já estava aqui)
app.post("/api/process-solana-pay", async (req, res) => {
  try {
    const { qrData, customerPubkey } = req.body;
    if (!qrData || !customerPubkey) return res.status(400).json({ error: "Faltam dados." });

    let targetUrl = decodeURIComponent(qrData.trim());
    if (targetUrl.startsWith("solana:")) targetUrl = targetUrl.replace("solana:", "");

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "GummyTap-Wallet/1.0" },
      body: JSON.stringify({ account: customerPubkey })
    });

    if (!response.ok) throw new Error(`Erro Python: ${await response.text()}`);
    const data = await response.json();
    
    res.json({ success: true, transactionBase64: data.transaction, message: data.message });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// NOVA ROTA: Iniciar a Chopeira
// NOVA ROTA: Iniciar a Chopeira
app.post("/api/start-tap", async (req, res) => {
  try {
    const { reference } = req.body;
    const response = await fetch("http://127.0.0.1:5000/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference })
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Python retornou erro inesperado: ${text.slice(0, 80)}`);
    }
    
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// NOVA ROTA: Parar a Chopeira e processar reembolso
app.post("/api/stop-tap", async (req, res) => {
  try {
    const { reference, customerPubkey } = req.body;
    const response = await fetch("http://127.0.0.1:5000/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference, account: customerPubkey })
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Python retornou erro inesperado: ${text.slice(0, 80)}`);
    }
    
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});