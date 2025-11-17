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
  User,
  Star,
  Zap,
  Shield
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  target: number;
  change: string;
  icon: React.ElementType;
  color: string;
  index: number;
}

interface UserProfile {
  name: string;
  address: string;
  reputation: number;
  completedJobs: number;
  cancelledJobs: number;
  disputesRaised: number;
  totalEarnings: number;
  totalSpent: number;
  resume?: {
    skills: string[];
  };
}

interface MetricsCardsProps {
  userRole: "freelancer" | "client";
  userData: UserProfile;
  activeJobs?: number;
  avgResponseTime?: number;
  successRate?: number;
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
      const increment = target / 60; // 60 frames animation
      const counter = setInterval(() => {
        currentValue += increment;
        if (currentValue >= target) {
          currentValue = target;
          clearInterval(counter);
        }
        setDisplayValue(Math.floor(currentValue));
      }, 16); // ~60fps

      return () => clearInterval(counter);
    }, index * 150); // Stagger the animations

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
      {/* Background Glow Effect */}
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

        {/* Animated Border */}
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

export const MetricsCards = ({ 
  userRole, 
  userData, 
  activeJobs = 0, 
  avgResponseTime = 0,
  successRate = 0 
}: MetricsCardsProps) => {
  
  // Calculate derived metrics from userData
  const calculateSuccessRate = () => {
    if (userData.completedJobs === 0) return 0;
    const totalJobs = userData.completedJobs + userData.cancelledJobs;
    return Math.round((userData.completedJobs / totalJobs) * 100);
  };

  const calculateAvgRating = () => {
    // Assuming reputation score out of 100 converts to 5-star rating
    return (userData.reputation / 20).toFixed(1);
  };

  const calculateCompletionRate = () => {
    if (userData.completedJobs === 0) return 0;
    const totalJobs = userData.completedJobs + userData.cancelledJobs;
    return Math.round((userData.completedJobs / totalJobs) * 100);
  };

  // Freelancer-specific metrics
  const freelancerMetrics = [
    {
      title: "Total Earnings",
      value: `${userData.totalEarnings.toFixed(1)} SOL`,
      target: userData.totalEarnings,
      change: userData.totalEarnings > 50 ? "+12%" : "+5%",
      icon: DollarSign,
      color: "neon-gold"
    },
    {
      title: "Jobs Completed",
      value: userData.completedJobs.toString(),
      target: userData.completedJobs,
      change: userData.completedJobs > 20 ? "+8%" : "+3%",
      icon: CheckCircle,
      color: "success"
    },
    {
      title: "Active Projects",
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
      title: "Reputation Score",
      value: userData.reputation.toString(),
      target: userData.reputation,
      change: userData.reputation > 80 ? "+5" : "+2",
      icon: Star,
      color: "neon-gold"
    },
    {
      title: "Response Time",
      value: `${avgResponseTime}h`,
      target: avgResponseTime,
      change: avgResponseTime < 2 ? "-15%" : "-5%",
      icon: Clock,
      color: "warning"
    },
    {
      title: "Disputes Involved",
      value: userData.disputesRaised.toString(),
      target: userData.disputesRaised,
      change: userData.disputesRaised > 0 ? "+1" : "0",
      icon: AlertTriangle,
      color: "destructive"
    },
    {
      title: "Cancelled Jobs",
      value: userData.cancelledJobs.toString(),
      target: userData.cancelledJobs,
      change: userData.cancelledJobs > 0 ? "+1" : "0",
      icon: XCircle,
      color: "foreground-muted"
    }
  ];

  // Client-specific metrics
  const clientMetrics = [
    {
      title: "Total Spent",
      value: `${userData.totalSpent.toFixed(1)} SOL`,
      target: userData.totalSpent,
      change: userData.totalSpent > 30 ? "+18%" : "+8%",
      icon: DollarSign,
      color: "neon-gold"
    },
    {
      title: "Projects Posted",
      value: userData.completedJobs.toString(),
      target: userData.completedJobs,
      change: userData.completedJobs > 15 ? "+4" : "+2",
      icon: Briefcase,
      color: "neon-cyan"
    },
    {
      title: "Completed Projects",
      value: userData.completedJobs.toString(),
      target: userData.completedJobs,
      change: userData.completedJobs > 10 ? "+3" : "+1",
      icon: CheckCircle,
      color: "success"
    },
    {
      title: "Active Projects",
      value: activeJobs.toString(),
      target: activeJobs,
      change: activeJobs > 3 ? "+1" : "0",
      icon: Hourglass,
      color: "neon-purple"
    },
    {
      title: "Average Rating",
      value: `${calculateAvgRating()}★`,
      target: parseFloat(calculateAvgRating()),
      change: parseFloat(calculateAvgRating()) > 4.5 ? "+0.2" : "+0.1",
      icon: Star,
      color: "neon-gold"
    },
    {
      title: "Completion Rate",
      value: `${calculateCompletionRate()}%`,
      target: calculateCompletionRate(),
      change: calculateCompletionRate() > 85 ? "+3%" : "+1%",
      icon: TrendingUp,
      color: "warning"
    },
    {
      title: "Disputes Raised",
      value: userData.disputesRaised.toString(),
      target: userData.disputesRaised,
      change: userData.disputesRaised > 0 ? "+1" : "0",
      icon: Shield,
      color: "destructive"
    },
    {
      title: "Cancelled Projects",
      value: userData.cancelledJobs.toString(),
      target: userData.cancelledJobs,
      change: userData.cancelledJobs > 0 ? "+1" : "0",
      icon: XCircle,
      color: "foreground-muted"
    }
  ];

  const metrics = userRole === "freelancer" ? freelancerMetrics : clientMetrics;

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

