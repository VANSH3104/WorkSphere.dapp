import { Badge } from "@/app/(module)/ui/badge";
import { Button } from "@/app/(module)/ui/button";
import { motion } from "framer-motion";
import { Wallet, Star, Shield, User, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

interface HeroHeaderProps {
  userName: string;
  userRole: "freelancer" | "client";
  reputation: number;
  totalEarnings: string;
  walletAddress: string;
  walletBalance: string;
}

export const HeroHeader = ({
  userName,
  userRole,
  reputation,
  totalEarnings,
  walletAddress,
  walletBalance
}: HeroHeaderProps) => {
  const [isConnected, setIsConnected] = useState(true);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div 
      className="relative glass-panel p-8 mb-8 overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-neon-purple/20 blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-8 right-8 w-32 h-32 rounded-full bg-neon-cyan/15 blur-xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-4 left-1/3 w-20 h-20 rounded-full bg-neon-gold/25 blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* User Info Section */}
        <motion.div 
          className="flex items-center space-x-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="relative">
            <motion.div 
              className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-2xl font-bold text-white shadow-neon"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {userName.slice(0, 2).toUpperCase()}
            </motion.div>
            <motion.div
              className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full border-2 border-background"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          <div className="space-y-2">
            <motion.h1 
              className="text-3xl font-bold text-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {userName}
            </motion.h1>
            <div className="flex items-center space-x-3">
              <Badge 
                variant="secondary" 
                className="capitalize bg-gradient-secondary text-white border-0 px-4 py-1"
              >
                <User className="w-3 h-3 mr-1" />
                {userRole}
              </Badge>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-neon-gold fill-neon-gold" />
                <span className="text-neon-gold font-semibold">{reputation}</span>
                <span className="text-foreground-muted text-sm">rating</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="glass-card p-4 text-center hover-lift">
            <div className="text-2xl font-bold text-neon-gold">{totalEarnings}</div>
            <div className="text-sm text-foreground-muted">Total Earnings</div>
          </div>
          <div className="glass-card p-4 text-center hover-lift">
            <div className="text-2xl font-bold text-neon-cyan">4.9★</div>
            <div className="text-sm text-foreground-muted">Reputation</div>
          </div>
        </motion.div>

        {/* Wallet Section */}
        <motion.div 
          className="flex flex-col items-end space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="glass-card p-4 w-full max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-neon-purple" />
                <span className="font-semibold text-foreground">Wallet</span>
              </div>
              <Badge variant="outline" className={isConnected ? "text-success border-success" : "text-destructive border-destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted text-sm">Balance</span>
                <span className="font-bold text-neon-gold">{walletBalance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground-muted text-sm">Address</span>
                <div className="flex items-center space-x-1">
                  <span className="font-mono text-sm text-foreground">
                    {truncateAddress(walletAddress)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(walletAddress)}
                    className="h-6 w-6 p-0 hover:bg-glass-secondary"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-glass-secondary"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant={isConnected ? "outline" : "default"}
              className={`${isConnected 
                ? "border-destructive text-destructive hover:bg-destructive hover:text-white" 
                : "bg-gradient-primary text-white hover:shadow-neon border-0"
              } px-8 py-2 font-semibold transition-all duration-300`}
              onClick={() => setIsConnected(!isConnected)}
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isConnected ? "Disconnect" : "Connect Wallet"}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};