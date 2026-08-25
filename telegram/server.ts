import express from "express";
import cors from "cors";
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { 
  createApproveInstruction, 
  getAssociatedTokenAddressSync, 
  createAssociatedTokenAccountInstruction,
  getAccount,
  mintTo,
  TOKEN_PROGRAM_ID 
} from "@solana/spl-token";
import { BeerTapController } from "./beerTapController";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const connection = new Connection(process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");
const TOKEN_MINT = new PublicKey(process.env.TOKEN_MINT!);
const tap = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.TAP_SECRET_KEY!)));
const faucetAuthority = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.CUSTOMER_SECRET_KEY!)));

let activeSession: BeerTapController | null = null;
const MAX_ALLOWANCE = 15_000_000n; // 15 USDC

app.post("/api/prepare-auth", async (req, res) => {
  try {
    const { customerPubkey } = req.body;
    if (!customerPubkey) return res.status(400).json({ error: "Chave pública do cliente é obrigatória." });

    const user = new PublicKey(customerPubkey);
    const userAta = getAssociatedTokenAddressSync(TOKEN_MINT, user);

    try {
      await getAccount(connection, userAta);
    } catch {
      console.log(`[Devnet] Criando ATA e mintando 100 USDC para ${user.toBase58()}...`);
      const createAtaTx = new Transaction().add(
        createAssociatedTokenAccountInstruction(tap.publicKey, userAta, user, TOKEN_MINT)
      );
      await connection.sendTransaction(createAtaTx, [tap]);
      await new Promise(r => setTimeout(r, 1200));
      await mintTo(connection, tap, TOKEN_MINT, userAta, faucetAuthority, 100_000_000n);
    }

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    // O cliente delega permissão para a máquina operar a torneira
    const tx = new Transaction({
      feePayer: tap.publicKey,
      blockhash,
      lastValidBlockHeight,
    }).add(
      createApproveInstruction(
        userAta,
        tap.publicKey,
        user,
        MAX_ALLOWANCE,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    tx.partialSign(tap);

    res.json({
      success: true,
      transactionBase64: Buffer.from(tx.serialize({ requireAllSignatures: false })).toString("base64"),
    });
  } catch (err: any) {
    console.error("Erro no prepare-auth:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/start-session", (req, res) => {
  const { customerPubkey, destinationAddress } = req.body;
  const destination = destinationAddress ? new PublicKey(destinationAddress.trim()) : tap.publicKey;

  activeSession = new BeerTapController(new PublicKey(customerPubkey), tap, destination, MAX_ALLOWANCE);
  console.log(`✓ [Sessão Iniciada] Cliente: ${customerPubkey} | Destino do Pagamento (QR Code): ${destination.toBase58()}`);
  res.json({ success: true });
});

app.post("/api/pulse", (req, res) => {
  if (!activeSession) return res.status(400).json({ error: "Torneira bloqueada." });
  const ml = activeSession.onFlowSensorPulse(4.5);
  res.json({ success: true, mlServed: ml });
});

app.post("/api/settle", async (req, res) => {
  if (!activeSession) return res.status(400).json({ error: "Nenhuma sessão ativa para liquidar." });
  try {
    const result = await activeSession.finalizePourAndCharge();
    console.log(`✓ [Liquidado On-Chain] Volume: ${result.mlServed} ml | Destinatário: ${result.destination} | Tx: ${result.txHash}`);
    activeSession = null;
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error("Erro no settle:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🍻 Servidor GummyTap escutando em: http://localhost:${PORT}`));