// app/dashboard/page.tsx
"use client";
import { useUser } from "@/(providers)/userProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import { DashboardComponent } from "./(components)/Dashcomponent";
import { RegisterComponent } from "./(components)/RegistereComponent";

export default function DashboardPage() {
  const { connected } = useWallet();
  const { user, isRegistered, loading } = useUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!connected) {
    return <div className="text-center p-8">Please connect your wallet</div>;
  }

  if (isRegistered === false) {
    return <RegisterComponent />;
  }

  if (isRegistered === true) {
    return <DashboardComponent user={user} />;
  }

  return null;
}