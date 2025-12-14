// contexts/UserContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getProgram, findUserPDA } from "@/(anchor)/setup";

interface UserContextType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any | null;
  isRegistered: boolean | null;
  loading: boolean;
  refetchUser: () => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fetchUserByAddress: (address: string | PublicKey) => Promise<any | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey, connected } = useWallet();
  const wallet = useWallet();

  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);

  // Function to fetch any user by their address
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fetchUserByAddress = async (address: string | PublicKey): Promise<any | null> => {
    try {
      const pubKey = typeof address === 'string' ? new PublicKey(address) : address;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const program = getProgram(wallet as any);
      const [userPDA] = findUserPDA(pubKey);
      const userAccount = await program.account.user.fetchNullable(userPDA);
      console.log(userAccount, "account")
      return userAccount;
    } catch (error) {
      console.error("❌ Error fetching user by address:", error);
      return null;
    }
  };

  // Function to check current connected user
  const checkUser = async () => {
    try {
      if (!connected || !publicKey || !wallet) {
        setIsRegistered(null);
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <UserContext.Provider value={{
      user,
      isRegistered,
      loading,
      refetchUser: checkUser,
      fetchUserByAddress
    }}>
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