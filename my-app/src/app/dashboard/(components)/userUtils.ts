"use client";
import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getProgram, findUserPDA } from "@/(anchor)/setup";

export const CheckUser = () => {
  const { publicKey, connected } = useWallet();
  const wallet = useWallet(); // Get full wallet object
  
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        if (!connected || !publicKey || !wallet) {
          console.log("⚠️ Wallet not connected");
          return;
        }

        setLoading(true);

        // ✅ Create program with actual wallet
        const program = getProgram(wallet as any);
        console.log("Program initialized:", program.programId.toBase58());  
        const [userPDA] = findUserPDA(publicKey);

        // Fetch user account
        const userAccount = await program.account.user.fetchNullable(userPDA);
        console.log("Fetched user account:", userAccount);

        if (userAccount) {
          console.log("✅ User account found:", userAccount);
          setUser(userAccount);
        } else {
          console.log("🆕 No user account found, please register.");
          setUser(null);    
        }
      } catch (error) {
        console.error(" Error checking user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [connected, publicKey, wallet]);

  return null;
};  