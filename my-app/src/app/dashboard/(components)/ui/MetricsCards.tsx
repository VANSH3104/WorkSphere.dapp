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
  Hourglass
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
      {/* Background Glow Effect - Fixed with proper color mapping */}
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
              isPositive ? 'text-success bg-success/20' : 
              isNegative ? 'text-destructive bg-destructive/20' : 
              'text-foreground-muted bg-glass-secondary'
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

export const MetricsCards = ({ userRole }: { userRole: "freelancer" | "client" }) => {
  const freelancerMetrics = [
    {
      title: "Total Earnings",
      value: "2,847 SOL",
      target: 2847,
      change: "+24%",
      icon: DollarSign,
      color: "neon-gold"
    },
    {
      title: "Jobs Completed",
      value: "127",
      target: 127,
      change: "+8%",
      icon: CheckCircle,
      color: "success"
    },
    {
      title: "Active Projects",
      value: "8",
      target: 8,
      change: "+2",
      icon: Briefcase,
      color: "neon-cyan"
    },
    {
      title: "Success Rate",
      value: "98.5%",
      target: 98.5,
      change: "+1.2%",
      icon: TrendingUp,
      color: "neon-purple"
    },
    {
      title: "Avg Response Time",
      value: "1.2h",
      target: 1.2,
      change: "-15%",
      icon: Clock,
      color: "neon-gold"
    },
    {
      title: "Pending Reviews",
      value: "3",
      target: 3,
      change: "0",
      icon: Hourglass,
      color: "warning"
    },
    {
      title: "Disputes Resolved",
      value: "2",
      target: 2,
      change: "+1",
      icon: AlertTriangle,
      color: "destructive"
    },
    {
      title: "Cancelled Projects",
      value: "1",
      target: 1,
      change: "0",
      icon: XCircle,
      color: "foreground-muted"
    }
  ];

  const clientMetrics = [
    {
      title: "Total Spent",
      value: "3,245 SOL",
      target: 3245,
      change: "+18%",
      icon: DollarSign,
      color: "neon-gold"
    },
    {
      title: "Projects Posted",
      value: "24",
      target: 24,
      change: "+4",
      icon: Briefcase,
      color: "neon-cyan"
    },
    {
      title: "Completed Projects",
      value: "19",
      target: 19,
      change: "+3",
      icon: CheckCircle,
      color: "success"
    },
    {
      title: "Active Projects",
      value: "5",
      target: 5,
      change: "+1",
      icon: Hourglass,
      color: "neon-purple"
    },
    {
      title: "Average Rating Given",
      value: "4.8★",
      target: 4.8,
      change: "+0.2",
      icon: TrendingUp,
      color: "neon-gold"
    },
    {
      title: "Pending Milestones",
      value: "12",
      target: 12,
      change: "+3",
      icon: Clock,
      color: "warning"
    },
    {
      title: "Disputes Raised",
      value: "1",
      target: 1,
      change: "0",
      icon: AlertTriangle,
      color: "destructive"
    },
    {
      title: "Cancelled Projects",
      value: "0",
      target: 0,
      change: "0",
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