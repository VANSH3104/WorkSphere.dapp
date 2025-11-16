  import { Program, AnchorProvider, IdlAccounts } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { Idl } from "@coral-xyz/anchor";
import BN from 'bn.js';
import BackendIdl from "./idl.json";

type BackendProgram = typeof BackendIdl;

const programAddress = BackendIdl.address || BackendIdl.metadata?.address;
if (!programAddress) {
  throw new Error("Program address not found in IDL");
}
export const programId = new PublicKey(programAddress);

export const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com", // localnet
  "confirmed"
);

export const getProgram = (wallet: any) => {
  // Validate wallet
  if (!wallet) {
    throw new Error("Wallet is required");
  }
  if (!wallet.publicKey) {
    throw new Error("Wallet public key not available");
  }

  const provider = new AnchorProvider(
    connection,
    wallet,
    { preflightCommitment: "confirmed" }
  );

  return new Program(
    BackendIdl as Idl,
    provider
  );
};

// ✅ PDA helpers
export const findUserPDA = (authority: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("user"), authority.toBuffer()],
    programId
  );


export const findJobCounterPDA = () =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("job_counter")],
    programId
  );

// ✅ FIXED: Job PDA uses universal job ID only (matches your Rust seeds)
  export const findJobPDA = (jobId: number | BN | bigint) => {
    const jobIdBN = new BN(jobId.toString());
    const jobIdBytes = jobIdBN.toArrayLike(Buffer, 'le', 8);
    
    console.log("🔍 Job PDA Seeds Debug:");
    console.log("Job ID:", jobIdBN.toString());
    console.log("Job ID bytes (hex):", Buffer.from(jobIdBytes).toString('hex'));
    
    return PublicKey.findProgramAddressSync(
      [Buffer.from("job"), jobIdBytes], // Only job ID, no authority
      programId
    );
  };
  export const findEscrowPDA = (jobPDA: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), jobPDA.toBuffer()],
      programId
    );
// ✅ Types
export type BackendAccounts = IdlAccounts<BackendProgram>;
export type UserAccount = BackendAccounts["user"];
export type JobAccount = BackendAccounts["job"];
export type JobCounterAccount = BackendAccounts["jobCounter"];
