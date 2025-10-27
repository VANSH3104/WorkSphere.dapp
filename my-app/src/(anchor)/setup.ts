import { Program, AnchorProvider, IdlAccounts, Wallet } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import BackendIdl from "./idl.json";
import { Idl } from "@project-serum/anchor";

// ✅ Program ID
export const programId = new PublicKey(BackendIdl.address);

// ✅ Connection
export const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// ✅ Function to create program with actual wallet
export const getProgram = (wallet: Wallet) => {
    console.log("here")
  const provider = new AnchorProvider(
    connection,
    wallet,
    { preflightCommitment: "confirmed" }
  );
  return new Program(
    BackendIdl as Idl,
    // programId,
    provider
  );
};

// ✅ PDA helpers (these don't need wallet)
export const findUserPDA = (authority: PublicKey) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("user"), authority.toBuffer()],
    programId
  );

export const findJobPDA = (authority: PublicKey, title: string) =>
  PublicKey.findProgramAddressSync(
    [Buffer.from("job"), authority.toBuffer(), Buffer.from(title)],
    programId
  );

// ✅ Types
export type BackendAccounts = IdlAccounts<typeof BackendIdl>;
export type UserAccount = BackendAccounts["User"];
export type JobAccount = BackendAccounts["Job"];