import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import { createTransferCheckedInstruction, getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, getAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import "dotenv/config";

const connection = new Connection(process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");
const TOKEN_MINT = new PublicKey(process.env.TOKEN_MINT!);
const PRICE_PER_ML_UNITS = 100_000n; // 0.01 USDC por ml
const PULSES_PER_LITER = 450;

export class BeerTapController {
  private userPubkey: PublicKey;
  private tapSigner: Keypair;
  private destinationPubkey: PublicKey;
  private pulseCount: number = 0;
  private maxAllowanceUnits: bigint;

  constructor(userPubkey: PublicKey, tapSigner: Keypair, destinationPubkey: PublicKey, maxAllowanceUnits: bigint) {
    this.userPubkey = userPubkey;
    this.tapSigner = tapSigner;
    this.destinationPubkey = destinationPubkey;
    this.maxAllowanceUnits = maxAllowanceUnits;
  }

  public onFlowSensorPulse(pulses: number = 1): number {
    this.pulseCount += pulses;
    return Math.floor((this.pulseCount / PULSES_PER_LITER) * 1000);
  }

  public async finalizePourAndCharge(): Promise<{ mlServed: number; txHash: string; destination: string }> {
    const mlServed = Math.floor((this.pulseCount / PULSES_PER_LITER) * 1000);
    const totalCostUnits = BigInt(mlServed) * PRICE_PER_ML_UNITS;
    const chargeAmount = totalCostUnits > this.maxAllowanceUnits ? this.maxAllowanceUnits : totalCostUnits;

    const userAta = getAssociatedTokenAddressSync(TOKEN_MINT, this.userPubkey);
    const destinationAta = getAssociatedTokenAddressSync(TOKEN_MINT, this.destinationPubkey);

    const tx = new Transaction();

    // Garante que a conta de token do destinatário existe
    try {
      await getAccount(connection, destinationAta);
    } catch {
      tx.add(
        createAssociatedTokenAccountInstruction(
          this.tapSigner.publicKey,
          destinationAta,
          this.destinationPubkey,
          TOKEN_MINT
        )
      );
    }

    // Transfere o valor exato consumido direto para o endereço lido no QR Code
    tx.add(
      createTransferCheckedInstruction(
        userAta,
        TOKEN_MINT,
        destinationAta,
        this.tapSigner.publicKey,
        chargeAmount,
        6,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const txHash = await sendAndConfirmTransaction(connection, tx, [this.tapSigner]);
    return { mlServed, txHash, destination: this.destinationPubkey.toBase58() };
  }
}
