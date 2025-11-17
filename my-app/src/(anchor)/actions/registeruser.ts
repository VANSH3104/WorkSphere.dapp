import { SystemProgram, PublicKey } from "@solana/web3.js";
import { getProgram, findUserPDA } from "@/(anchor)/setup";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function registerUser(wallet: any, name: string, isClient = true, isFreelancer = false) {
  try {
    // ✅ Add validation checks
    if (!wallet) {
      throw new Error("Wallet is required");
    }

    if (!wallet.publicKey) {
      throw new Error("Wallet public key not available");
    }

    if (!wallet.signTransaction) {
      throw new Error("Wallet cannot sign transactions");
    }

    console.log("🔑 Wallet publicKey:", wallet.publicKey.toBase58());
    console.log("🆕 Registering user with name:", name);

    const program = getProgram(wallet);
    const [userPDA] = findUserPDA(wallet.publicKey);

    console.log("📝 User PDA:", userPDA.toBase58());

    const tx = await program.methods
  .registerUser(name, isClient, isFreelancer, null)
  .accounts({
    user: userPDA,
    authority: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();   

    console.log("✅ Transaction successful:", tx);
    return { success: true, signature: tx, userPDA: userPDA.toBase58() };
    
  } catch (error) {
    console.error("❌ Error registering user:", error);
    throw error;
  }
}