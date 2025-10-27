// contexts/UserContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getProgram, findUserPDA } from "@/(anchor)/setup";

interface UserContextType {
  user: any | null;
  isRegistered: boolean | null;
  loading: boolean;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey, connected } = useWallet();
  const wallet = useWallet();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);

  const checkUser = async () => {
    try {
      if (!connected || !publicKey || !wallet) {
        setIsRegistered(null);
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      const program = getProgram(wallet as any);
      const [userPDA] = findUserPDA(publicKey);
      const userAccount = await program.account.user.fetchNullable(userPDA);
      
      if (userAccount) {
        setUser(userAccount);
        setIsRegistered(true);
      } else {
        setUser(null);
        setIsRegistered(false);
      }
    } catch (error) {
      console.error("❌ Error checking user:", error);
      setIsRegistered(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, [connected, publicKey]);

  return (
    <UserContext.Provider value={{ user, isRegistered, loading, refetchUser: checkUser }}>
    
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }
  return context;
};