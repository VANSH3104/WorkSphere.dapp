"use client"
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/app/(module)/ui/button";
import { Wallet, Menu, X, Globe, Zap } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { connected } = useWallet();
  const router = useRouter();
  useEffect(() => {
    if (connected) {
      router.push("/dashboard");
    }
  }, [connected, router]);
  const navItems = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Community", href: "#community" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b border-glass-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover-glow">
            <div className="relative">
              <Globe className="h-8 w-8 text-neon-cyan animate-spin-slow" />
              <Zap className="absolute inset-0 h-4 w-4 m-2 text-neon-gold animate-pulse" />
            </div>
            <span className="text-xl font-bold text-neon bg-gradient-primary bg-clip-text text-transparent">
              WorkSphere
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground-muted hover:text-primary transition-colors duration-300 font-medium"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="glass" size="sm" asChild>
              <Link href="/onboarding">Launch App</Link>
            </Button>
            
            {/* Wallet Connect Button */}
            <WalletMultiButton className="!bg-gradient-primary hover:!bg-gradient-primary/90 !border-none !rounded-lg !px-4 !py-2 !text-sm !font-medium !transition-all !duration-300">
              {!connected && (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </WalletMultiButton>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 glass-panel mt-2 rounded-xl border border-glass-border">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-foreground-muted hover:text-primary transition-colors duration-300 rounded-lg hover:bg-glass-border/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              
              <div className="pt-4 space-y-3 border-t border-glass-border">
                <Button variant="glass" size="sm" className="w-full" asChild>
                  <Link href="/onboarding">Launch App</Link>
                </Button>
                
                {/* Mobile Wallet Connect */}
                <WalletMultiButton className="!w-full !bg-gradient-primary hover:!bg-gradient-primary/90 !border-none !rounded-lg !px-4 !py-2 !text-sm !font-medium !transition-all !duration-300 !flex !items-center !justify-center">
                  {!connected && (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </WalletMultiButton>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;