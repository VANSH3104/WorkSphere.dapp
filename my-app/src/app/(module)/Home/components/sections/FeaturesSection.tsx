
import { Button } from "@/app/(module)/ui/button";
import { 
  Shield, 
  Users, 
  Zap, 
  Lock, 
  Coins, 
  Globe,
  ArrowRight,
  Star
} from "lucide-react";


const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Smart Escrow Protection",
      description: "Automated smart contracts ensure secure payment release only when milestones are completed and verified.",
      gradient: "from-neon-cyan to-neon-purple"
    },
    {
      icon: Users,
      title: "DAO Dispute Resolution",
      description: "Community-powered arbitration system where token holders vote on disputes fairly and transparently.",
      gradient: "from-neon-purple to-neon-gold"
    },
    {
      icon: Zap,
      title: "Instant Solana Payments",
      description: "Lightning-fast payments on Solana blockchain with minimal fees and instant confirmations.",
      gradient: "from-neon-gold to-neon-cyan"
    },
    {
      icon: Lock,
      title: "Zero-Knowledge Privacy",
      description: "Advanced cryptographic privacy features protect sensitive project information and communications.",
      gradient: "from-neon-cyan to-neon-purple"
    },
    {
      icon: Coins,
      title: "Multi-Token Support",
      description: "Accept payments in SOL, USDC, and other SPL tokens with automatic conversion options.",
      gradient: "from-neon-purple to-neon-gold"
    },
    {
      icon: Globe,
      title: "Global Talent Network",
      description: "Connect with verified freelancers and clients worldwide through our decentralized reputation system.",
      gradient: "from-neon-gold to-neon-cyan"
    }
  ];

  return (
    <section id="features" className="py-16 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-neon-purple/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 glass-panel px-3 py-1.5 rounded-full mb-4">
            <Star className="h-3 w-3 text-neon-gold" />
            <span className="text-xs font-medium text-foreground">Premium Features</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            <span className="text-neon bg-gradient-primary bg-clip-text text-transparent">
              Advanced Trading
            </span>
            <br />
            <span className="text-foreground">Features & Tools</span>
          </h2>
          
          <p className="text-base text-foreground-muted max-w-2xl mx-auto">
            Experience professional-grade trading tools and features designed for both 
            novice and experienced crypto traders.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="glass-card p-6 hover-lift group relative overflow-hidden cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Feature Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>

              {/* Feature Content */}
              <h3 className="text-base font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-foreground-muted leading-relaxed text-sm">
                {feature.description}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Workflow Showcase */}
        <div className="glass-card p-6 lg:p-8 text-center">
          <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-4">
            Simple <span className="text-neon bg-gradient-gold bg-clip-text text-transparent">5-Step</span> Workflow
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
            {['Post Job', 'Review Proposals', 'Secure Escrow', 'Complete Work', 'DAO Verification'].map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold mb-3">
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-foreground-muted">{step}</span>
                {index < 4 && (
                  <ArrowRight className="hidden md:block h-6 w-6 text-neon-cyan mt-2 absolute translate-x-16" />
                )}
              </div>
            ))}
          </div>
          
          <Button variant="neon" size="lg" className="mt-8 gap-2">
            Start Your Journey
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;