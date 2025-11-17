import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { 
  DollarSign, 
  Briefcase, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Hourglass,
  Star,
  Shield,
  FileText,
  Target,
  Users,
  Award
} from "lucide-react";
import { useUser } from "@/(providers)/userProvider";
import { BN } from "@coral-xyz/anchor";

interface MetricCardProps {
  title: string;
  value: string | number;
  target: number;
  change: string;
  icon: React.ElementType;
  color: string;
  index: number;
}

// Color mapping for consistent styling
const colorMap = {
  "neon-gold": {
    bg: "bg-amber-500/20",
    text: "text-amber-500",
    gradient: "from-amber-500",
    border: "bg-amber-500"
  },
  "success": {
    bg: "bg-green-500/20",
    text: "text-green-500",
    gradient: "from-green-500",
    border: "bg-green-500"
  },
  "neon-cyan": {
    bg: "bg-cyan-500/20",
    text: "text-cyan-500",
    gradient: "from-cyan-500",
    border: "bg-cyan-500"
  },
  "neon-purple": {
    bg: "bg-purple-500/20",
    text: "text-purple-500",
    gradient: "from-purple-500",
    border: "bg-purple-500"
  },
  "warning": {
    bg: "bg-yellow-500/20",
    text: "text-yellow-500",
    gradient: "from-yellow-500",
    border: "bg-yellow-500"
  },
  "destructive": {
    bg: "bg-red-500/20",
    text: "text-red-500",
    gradient: "from-red-500",
    border: "bg-red-500"
  },
  "foreground-muted": {
    bg: "bg-gray-500/20",
    text: "text-gray-500",
    gradient: "from-gray-500",
    border: "bg-gray-500"
  }
};

const MetricCard = ({ title, value, target, change, icon: Icon, color, index }: MetricCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const colorStyles = colorMap[color as keyof typeof colorMap] || colorMap["foreground-muted"];

  useEffect(() => {
    const timer = setTimeout(() => {
      let currentValue = 0;
      const increment = target / 60;
      const counter = setInterval(() => {
        currentValue += increment;
        if (currentValue >= target) {
          currentValue = target;
          clearInterval(counter);
        }
        setDisplayValue(Math.floor(currentValue));
      }, 16);

      return () => clearInterval(counter);
    }, index * 150);

    return () => clearTimeout(timer);
  }, [target, index]);

  const isPositive = change.startsWith('+');
  const isNegative = change.startsWith('-');

  return (
    <motion.div
      className="glass-card p-6 hover-lift cursor-pointer group relative overflow-hidden"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.6,
        type: "spring",
        stiffness: 100 
      }}
      whileHover={{ scale: 1.02 }}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${colorStyles.gradient} to-transparent`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            className={`w-12 h-12 rounded-xl ${colorStyles.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Icon className={`h-6 w-6 ${colorStyles.text}`} />
          </motion.div>
          
          <motion.span 
            className={`text-sm font-medium px-3 py-1 rounded-full ${
              isPositive ? 'text-green-500 bg-green-500/20' : 
              isNegative ? 'text-red-500 bg-red-500/20' : 
              'text-gray-500 bg-gray-500/20'
            }`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (index * 0.1) + 0.3 }}
          >
            {change}
          </motion.span>
        </div>

        <motion.h3 
          className="text-3xl font-bold text-foreground mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (index * 0.1) + 0.2 }}
        >
          {typeof value === 'string' ? value : displayValue.toLocaleString()}
        </motion.h3>
        
        <motion.p 
          className="text-foreground-muted text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: (index * 0.1) + 0.4 }}
        >
          {title}
        </motion.p>

        <motion.div
          className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${colorStyles.gradient} to-transparent`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ delay: (index * 0.1) + 0.5, duration: 0.8 }}
        />
      </div>
    </motion.div>
  );
};

export const MetricsCards = () => {
  const { user } = useUser();
  
  if (!user) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="glass-card p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-300/20"></div>
              <div className="w-16 h-6 rounded-full bg-gray-300/20"></div>
            </div>
            <div className="h-8 bg-gray-300/20 rounded mb-2"></div>
            <div className="h-4 bg-gray-300/20 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Helper function to convert BN to number safely
  const bnToNumber = (bn: BN): number => {
    try {
      return bn.toNumber();
    } catch (error) {
      // If the number is too large, convert to string and parse as number
      return parseFloat(bn.toString());
    }
  };

  // Convert all BN fields to numbers
  const activeJobs = bnToNumber(user.activeJobs);
  const cancelledJobs = bnToNumber(user.cancelledJobs);
  const completedJobs = bnToNumber(user.completedJobs);
  const disputesRaised = bnToNumber(user.disputesRaised);
  const disputesResolved = bnToNumber(user.disputesResolved);
  const pendingJobs = bnToNumber(user.pendingJobs);
  const reputation = bnToNumber(user.reputation);
  const totalEarnings = bnToNumber(user.totalEarnings);
  const totalSpent = bnToNumber(user.totalSpent);

  // Convert SOL from lamports (assuming 1 SOL = 1_000_000_000 lamports)
  const solToLamports = 1000000000;
  const totalEarningsSOL = totalEarnings / solToLamports;
  const totalSpentSOL = totalSpent / solToLamports;

  // Calculate derived metrics
  const calculateSuccessRate = (): number => {
    if (completedJobs === 0) return 0;
    const totalJobs = completedJobs + cancelledJobs;
    return Math.round((completedJobs / totalJobs) * 100);
  };

  const calculateAvgRating = (): string => {
    // Convert reputation (0-100) to 5-star rating
    return (reputation / 20).toFixed(1);
  };

  const calculateCompletionRate = (): number => {
    if (completedJobs === 0) return 0;
    const totalJobs = completedJobs + cancelledJobs;
    return Math.round((completedJobs / totalJobs) * 100);
  };

  const calculateProductivity = (): number => {
    if (completedJobs === 0) return 0;
    const totalJobs = completedJobs + pendingJobs + cancelledJobs;
    return Math.round((completedJobs / totalJobs) * 100);
  };

  const calculateResponseTime = (): string => {
    // Simple calculation based on user activity and reputation
    const baseTime = user.isFreelancer ? 2.5 : 1.8;
    const reputationFactor = reputation / 100;
    return (baseTime - (reputationFactor * 1.2)).toFixed(1);
  };

  const calculateTotalJobs = (): number => {
    return completedJobs + activeJobs + pendingJobs + cancelledJobs;
  };

  const calculateDisputeResolutionRate = (): number => {
    if (disputesRaised === 0) return 0;
    return Math.round((disputesResolved / disputesRaised) * 100);
  };

  // Determine user role
  const isFreelancer = user.isFreelancer;
  const isClient = user.isClient;

  // Common metrics for both roles
  const commonMetrics = [
    {
      title: "Reputation Score",
      value: reputation.toString(),
      target: reputation,
      change: reputation > 80 ? "+5" : "+2",
      icon: Star,
      color: "neon-gold"
    },
    {
      title: "Completed Jobs",
      value: completedJobs.toString(),
      target: completedJobs,
      change: completedJobs > 20 ? "+8%" : "+3%",
      icon: CheckCircle,
      color: "success"
    },
    {
      title: "Active Jobs",
      value: activeJobs.toString(),
      target: activeJobs,
      change: activeJobs > 5 ? "+2" : "+1",
      icon: Briefcase,
      color: "neon-cyan"
    },
    {
      title: "Success Rate",
      value: `${calculateSuccessRate()}%`,
      target: calculateSuccessRate(),
      change: calculateSuccessRate() > 90 ? "+2%" : "+1%",
      icon: TrendingUp,
      color: "neon-purple"
    },
    {
      title: "Total Jobs",
      value: calculateTotalJobs().toString(),
      target: calculateTotalJobs(),
      change: calculateTotalJobs() > 30 ? "+5" : "+2",
      icon: FileText,
      color: "warning"
    }
  ];

  // Freelancer-specific metrics
  const freelancerMetrics = [
    {
      title: "Total Earnings",
      value: `${totalEarningsSOL.toFixed(2)} SOL`,
      target: totalEarningsSOL,
      change: totalEarningsSOL > 50 ? "+12%" : "+5%",
      icon: DollarSign,
      color: "neon-gold"
    },
    {
      title: "Pending Jobs",
      value: pendingJobs.toString(),
      target: pendingJobs,
      change: pendingJobs > 3 ? "+2" : "+1",
      icon: Hourglass,
      color: "warning"
    },
    ...commonMetrics,
    {
      title: "Disputes Resolved",
      value: `${calculateDisputeResolutionRate()}%`,
      target: calculateDisputeResolutionRate(),
      change: calculateDisputeResolutionRate() > 80 ? "+3%" : "+1%",
      icon: Shield,
      color: "success"
    },
    {
      title: "Productivity",
      value: `${calculateProductivity()}%`,
      target: calculateProductivity(),
      change: calculateProductivity() > 80 ? "+3%" : "+1%",
      icon: Target,
      color: "success"
    }
  ];

  // Client-specific metrics
  const clientMetrics = [
    {
      title: "Total Spent",
      value: `${totalSpentSOL.toFixed(2)} SOL`,
      target: totalSpentSOL,
      change: totalSpentSOL > 30 ? "+18%" : "+8%",
      icon: DollarSign,
      color: "neon-gold"
    },
    {
      title: "Pending Jobs",
      value: pendingJobs.toString(),
      target: pendingJobs,
      change: pendingJobs > 2 ? "+1" : "0",
      icon: Hourglass,
      color: "warning"
    },
    ...commonMetrics,
    {
      title: "Completion Rate",
      value: `${calculateCompletionRate()}%`,
      target: calculateCompletionRate(),
      change: calculateCompletionRate() > 85 ? "+3%" : "+1%",
      icon: Award,
      color: "neon-cyan"
    },
    {
      title: "Disputes Raised",
      value: disputesRaised.toString(),
      target: disputesRaised,
      change: disputesRaised > 0 ? "+1" : "0",
      icon: AlertTriangle,
      color: "destructive"
    }
  ];

  // Additional metrics for users who are both client and freelancer
  const hybridMetrics = [
    {
      title: "Total Earnings",
      value: `${totalEarningsSOL.toFixed(2)} SOL`,
      target: totalEarningsSOL,
      change: totalEarningsSOL > 50 ? "+12%" : "+5%",
      icon: DollarSign,
      color: "neon-gold"
    },
    {
      title: "Total Spent",
      value: `${totalSpentSOL.toFixed(2)} SOL`,
      target: totalSpentSOL,
      change: totalSpentSOL > 30 ? "+18%" : "+8%",
      icon: DollarSign,
      color: "neon-cyan"
    },
    ...commonMetrics,
    {
      title: "Net Balance",
      value: `${(totalEarningsSOL - totalSpentSOL).toFixed(2)} SOL`,
      target: Math.abs(totalEarningsSOL - totalSpentSOL),
      change: (totalEarningsSOL - totalSpentSOL) > 0 ? "+" : "-",
      icon: Users,
      color: "neon-purple"
    }
  ];

  // Determine which metrics to show based on user role
  let metrics = commonMetrics;
  if (isFreelancer && isClient) {
    metrics = hybridMetrics;
  } else if (isFreelancer) {
    metrics = freelancerMetrics;
  } else if (isClient) {
    metrics = clientMetrics;
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          {...metric}
          index={index}
        />
      ))}
    </motion.div>
  );
};