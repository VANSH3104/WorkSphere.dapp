"use client"
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { AnalyticsCharts } from "./ui/AnalyticsCharts";
import { RecentDisputes } from "./ui/RecentDisputes";
import { RecentJobs } from "./ui/RecentJobs";
import { ResumePortfolio } from "./ui/ResumePortfolio";
import { MetricsCards } from "./ui/MetricsCards";
import { HeroHeader } from "./ui/HeroHeader";
import { Sidebar } from "./ui/Sidebar";
import { useUser } from "@/(providers)/userProvider";
import { useWallet } from "@solana/wallet-adapter-react";;
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { connection } from "@/(anchor)/setup";

export const DashboardComponent = ({ role }: { role:  "freelancer" | "client" }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);
  const { user } = useUser()  
  useEffect(() => {
      const fetchBalance = async () => {
        if (publicKey) {
          const lamports = await connection.getBalance(publicKey);
          setBalance(lamports / LAMPORTS_PER_SOL);
        }
      };
      fetchBalance();
    }, [publicKey]);
  const userRole = role;
  const userData = {
    userName: user?.name,
    reputation: user.reputation.toNumber(),
    totalEarnings: user.totalEarnings.toNumber(),
    walletAddress: publicKey?.toBase58() || "",
    walletBalance: `${balance} SOL`
  };
  console.log(user.totalEarnings.toNumber())
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-neon-purple/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userRole={userRole}
          userName={userData.userName}
          walletAddress={userData.walletAddress}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Main Content */}
        <motion.div 
          className={`flex-1 min-h-screen transition-all duration-300 ${
            isCollapsed ? 'ml-16' : 'ml-64'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <main className="p-6 lg:p-8 space-y-8">
            {activeTab === "dashboard" && (
              <motion.div 
                className="space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Hero Header */}
                <HeroHeader
                  userName={userData.userName}
                  userRole={userRole}
                  reputation={userData.reputation}
                  totalEarnings={userData.totalEarnings}
                  walletAddress={userData.walletAddress}
                  walletBalance={userData.walletBalance}
                />

                {/* Metrics Cards */}
                <MetricsCards userRole={userRole} />

                {/* Resume & Portfolio (Freelancer only) */}
                <ResumePortfolio userRole={userRole} />

                {/* Recent Jobs & Projects */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <RecentJobs userRole={userRole} />
                  <RecentDisputes userRole={userRole} />
                </div>

                {/* Analytics Charts */}
                <AnalyticsCharts userRole={userRole} />
              </motion.div>
            )}

            {/* Other tab content */}
            {activeTab !== "dashboard" && (
              <motion.div 
                className="glass-card p-12 text-center min-h-[60vh] flex flex-col items-center justify-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="w-20 h-20 rounded-2xl bg-gradient-primary mb-6 flex items-center justify-center"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <span className="text-3xl">🚀</span>
                </motion.div>
                
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon
                </h2>
                
                <p className="text-foreground-muted text-lg max-w-2xl leading-relaxed">
                  We're crafting amazing features for the WorkSphere decentralized freelancing platform. 
                  This section will provide powerful tools for {userRole}s to manage their Web3 workflow efficiently.
                </p>
                
                <motion.div 
                  className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  {["Smart Contracts", "DAO Integration", "NFT Rewards"].map((feature, index) => (
                    <motion.div
                      key={feature}
                      className="glass-panel p-4 text-center hover-lift"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                    >
                      <div className="text-2xl mb-2">✨</div>
                      <div className="text-foreground font-semibold">{feature}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </main>
        </motion.div>
      </div>
    </div>
  );
};
