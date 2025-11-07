// app/dashboard/page.tsx
"use client";
import { useUser } from "@/(providers)/userProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import { DashboardComponent } from "./(components)/Dashcomponent";
import { Toaster as Sonner } from "../(module)/ui/toaster";
import { RegisterComponent } from "./(components)/Register/RegistereComponent";
import { TooltipProvider } from "../(module)/ui/tooltip";
import { Toaster } from "../(module)/ui/toaster";
import { SidebarProvider } from "../(module)/ui/sidebar";

export default function DashboardPage() {
  const { connected } = useWallet();
  const { user, isRegistered, loading } = useUser();
  const role = user?.isFreelancer === true ? "freelancer" : "client";
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
    return (
      <div>
        <SidebarProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <DashboardComponent role={role} />;
        </TooltipProvider>
        </SidebarProvider>
      </div>
    )
  }

  return null;
}