"use client";
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowLeft, Shield } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ReactNode } from 'react';

export function WalletProtected({ children }: { children: ReactNode }) {
  const { connected } = useWallet();
  const pathname = usePathname();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  console.log(connected, "wallet connected");
  
  useEffect(() => {
    if (!connected && pathname !== '/') {
      setIsRedirecting(true);
      // Small delay to show the redirect UI
      const timer = setTimeout(() => {
        router.push('/');
        setIsRedirecting(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [connected, pathname, router]);
  
  // Show redirect UI when redirecting
  if (isRedirecting && !connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90">
        <div className="text-center space-y-6 max-w-md mx-auto p-6">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 border-4 border-red-500/30 rounded-full animate-spin"></div>
            <Shield className="absolute inset-4 h-8 w-8 text-red-500 animate-pulse" />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
            <p className="text-foreground-muted">Wallet not connected. Redirecting to home page...</p>
            <div className="flex items-center justify-center gap-2 text-sm text-foreground-muted">
              <ArrowLeft className="h-4 w-4 animate-bounce" />
              <span>Taking you back to safety</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Only render children if wallet is connected or on home page
  if (!connected && pathname !== '/') {
    return null;
  }
  
  return <>{children}</>;
}