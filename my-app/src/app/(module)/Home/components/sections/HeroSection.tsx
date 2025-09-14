"use client"

import { ArrowRight, Sparkles, Shield, Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/app/(module)/ui/button";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-12">
      {/* Space gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-indigo-900/30 to-black" />
      
      {/* Hero Image */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-[450px] h-[450px] sm:w-[600px] sm:h-[600px] lg:w-[700px] lg:h-[700px] relative">
          <Image
            src="/heroimg1.gif"
            alt="Hero animation showcasing the Web3 freelancing platform"
            fill
            className="object-contain rounded-lg opacity-80"
            priority
          />
        </div>
      </div>

      {/* Floating Star Particles */}
      <div className="absolute inset-0 overflow-hidden z-20">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              repeat: Infinity,
              duration: 3 + Math.random() * 2,
              delay: i * 0.2
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}

        {/* Additional Design Elements */}
        {/* Glowing Nebula Clouds */}
        <motion.div
          className="absolute top-1/4 left-1/3 w-48 h-48 bg-gradient-radial from-neon-purple/30 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-gradient-radial from-neon-cyan/25 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Subtle Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`subtle-particle-${i}`}
            className="absolute w-2 h-2 bg-neon-gold rounded-full opacity-40"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.4, 0],
              scale: [0.8, 1, 0.8]
            }}
            transition={{
              repeat: Infinity,
              duration: 4 + Math.random() * 3,
              delay: i * 0.5
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Luxury Animated Elements */}
      {/* Top Left - Floating Geometric Shapes */}
      <div className="absolute top-20 left-10 z-0 pointer-events-none opacity-30">
        <motion.div
          className="w-16 h-16 border border-neon-cyan/30 rounded-lg backdrop-blur-sm"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-full opacity-60"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Top Right - Blockchain Blocks */}
      <div className="absolute top-16 right-12 z-0 pointer-events-none opacity-30">
        <motion.div
          className="flex space-x-2"
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-8 h-8 bg-gradient-to-br from-neon-gold/20 to-neon-purple/20 border border-neon-gold/40 rounded"
              animate={{
                rotateY: [0, 180, 360],
                scale: [1, 1.05, 1]
              }}
              transition={{
                rotateY: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 },
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Bottom Left - Elegant Light Rays */}
      <div className="absolute bottom-32 left-8 z-0 pointer-events-none opacity-30">
        <motion.div
          className="relative w-24 h-24"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-12 bg-gradient-to-t from-neon-cyan/40 to-transparent origin-bottom"
              style={{
                left: '50%',
                top: '50%',
                transformOrigin: '50% 100%',
                rotate: `${i * 60}deg`
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scaleY: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Bottom Right - Floating Code Symbols */}
      <div className="absolute bottom-24 right-16 z-0 pointer-events-none opacity-30">
        <motion.div
          className="flex flex-col space-y-2"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          {['{', '}', '<', '>', '/', '*'].map((symbol, i) => (
            <motion.div
              key={i}
              className="text-neon-gold/60 text-lg font-mono font-bold"
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3
              }}
            >
              {symbol}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Corner Accents - Subtle Glow Effects */}
      <div className="absolute top-0 left-0 w-32 h-32 z-0 pointer-events-none opacity-20">
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-neon-purple/10 to-transparent rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 z-0 pointer-events-none opacity-20">
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-neon-cyan/10 to-transparent rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="absolute bottom-0 left-0 w-32 h-32 z-0 pointer-events-none opacity-20">
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-neon-gold/8 to-transparent rounded-full blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="absolute bottom-0 right-0 w-32 h-32 z-0 pointer-events-none opacity-20">
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-neon-purple/8 to-transparent rounded-full blur-xl"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 pt-16 pb-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass-panel px-3 py-1.5 rounded-full mb-8 animate-fade-in backdrop-blur-md">
          <Sparkles className="h-3 w-3 text-neon-gold" />
          <span className="text-xs font-medium text-foreground">
            Next-gen Web3 freelancing platform
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 animate-fade-in">
          <span className="block text-neon bg-gradient-primary bg-clip-text text-transparent drop-shadow-lg">
            Freelance in the Future
          </span>
          <span className="block text-foreground mt-1 text-2xl sm:text-3xl lg:text-4xl drop-shadow-lg">
            Decentralized. Transparent.{" "}
            <span className="text-gold bg-gradient-gold bg-clip-text text-transparent">
              Empowered.
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-foreground-muted max-w-2xl mx-auto mb-12 animate-fade-in leading-relaxed backdrop-blur-sm bg-background/20 rounded-lg p-6">
          Experience seamless Web3 freelancing with smart escrow, DAO governance,
          and blockchain transparency. Connect talent with opportunity globally.
        </p>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button variant="hero" size="lg" className="gap-2 group relative overflow-hidden shadow-lg hover:shadow-neon transition-all duration-300" asChild>
              <Link href="/onboarding">
                <span className="relative z-10 font-semibold">Connect Wallet</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-cyan opacity-0 group-hover:opacity-20 rounded-lg"
                  initial={false}
                  whileHover={{ opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="absolute inset-0 border border-neon-purple/50 rounded-lg opacity-0 group-hover:opacity-100"
                  initial={false}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button variant="glass" size="lg" className="gap-2 relative overflow-hidden group shadow-lg hover:shadow-gold transition-all duration-300 backdrop-blur-md">
              <span className="relative z-10 font-semibold">Get Started</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-neon-gold to-neon-cyan opacity-0 group-hover:opacity-15 rounded-lg"
                initial={false}
                whileHover={{ opacity: 0.15 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute inset-0 border border-neon-gold/40 rounded-lg opacity-0 group-hover:opacity-100"
                initial={false}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-gold/5 to-transparent opacity-0 group-hover:opacity-100"
                initial={false}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'shine 2s infinite'
                }}
              />
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto animate-slide-up mb-8">
          <div className="glass-card p-6 hover-lift group cursor-pointer backdrop-blur-lg bg-background/30 flex flex-col items-center text-center">
            <Shield className="h-8 w-8 text-neon-cyan mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-semibold text-foreground mb-3">
              Smart Escrow
            </h3>
            <p className="text-foreground-muted text-sm leading-relaxed">
              Automated blockchain escrow ensures secure payments for all freelance projects
            </p>
          </div>

          <div className="glass-card p-6 hover-lift group cursor-pointer backdrop-blur-lg bg-background/30 flex flex-col items-center text-center">
            <Users className="h-8 w-8 text-neon-purple mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-semibold text-foreground mb-3">
              DAO Governance
            </h3>
            <p className="text-foreground-muted text-sm leading-relaxed">
              Community-driven dispute resolution through decentralized voting
            </p>
          </div>

          <div className="glass-card p-6 hover-lift group cursor-pointer backdrop-blur-lg bg-background/30 flex flex-col items-center text-center">
            <Sparkles className="h-8 w-8 text-neon-gold mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-base font-semibold text-foreground mb-3">
              Transparent Bidding
            </h3>
            <p className="text-foreground-muted text-sm leading-relaxed">
              Fair, transparent bidding system with blockchain-verified proposals
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-5 h-8 border-2 border-glass-border rounded-full flex justify-center">
          <div className="w-0.5 h-2 bg-primary rounded-full mt-1.5 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;