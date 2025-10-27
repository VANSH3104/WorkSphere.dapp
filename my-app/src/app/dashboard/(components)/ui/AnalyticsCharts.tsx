import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface AnalyticsChartsProps {
  userRole: "freelancer" | "client";
}

interface ChartDataItem {
  month: string;
  earnings: number;
  spending: number;
  rating?: number;
}

interface JobStatusItem {
  name: string;
  value: number;
  color: string;
}

interface SkillDemandItem {
  skill: string;
  demand: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const AnalyticsCharts = ({ userRole }: AnalyticsChartsProps) => {
  // Sample data - in real app this would come from props or API
  const earningsData: ChartDataItem[] = [
    { month: "Jan", earnings: 150, spending: userRole === "client" ? 280 : 0 },
    { month: "Feb", earnings: 220, spending: userRole === "client" ? 320 : 0 },
    { month: "Mar", earnings: 180, spending: userRole === "client" ? 180 : 0 },
    { month: "Apr", earnings: 300, spending: userRole === "client" ? 420 : 0 },
    { month: "May", earnings: 280, spending: userRole === "client" ? 380 : 0 },
    { month: "Jun", earnings: 420, spending: userRole === "client" ? 520 : 0 },
    { month: "Jul", earnings: 380, spending: userRole === "client" ? 450 : 0 },
    { month: "Aug", earnings: 350, spending: userRole === "client" ? 400 : 0 },
    { month: "Sep", earnings: 480, spending: userRole === "client" ? 580 : 0 },
    { month: "Oct", earnings: 520, spending: userRole === "client" ? 620 : 0 },
    { month: "Nov", earnings: 450, spending: userRole === "client" ? 520 : 0 },
    { month: "Dec", earnings: 600, spending: userRole === "client" ? 700 : 0 }
  ];

  const jobStatusData: JobStatusItem[] = userRole === "freelancer" ? [
    { name: "Completed", value: 45, color: "#10B981" },
    { name: "In Progress", value: 25, color: "#06B6D4" },
    { name: "Pending", value: 20, color: "#F59E0B" },
    { name: "Cancelled", value: 10, color: "#EF4444" }
  ] : [
    { name: "Active", value: 35, color: "#8B5CF6" },
    { name: "Completed", value: 40, color: "#10B981" },
    { name: "Draft", value: 15, color: "#6B7280" },
    { name: "Cancelled", value: 10, color: "#EF4444" }
  ];

  const reputationData: Omit<ChartDataItem, 'earnings' | 'spending'>[] = [
    { month: "Jan", rating: 4.5 },
    { month: "Feb", rating: 4.6 },
    { month: "Mar", rating: 4.4 },
    { month: "Apr", rating: 4.7 },
    { month: "May", rating: 4.8 },
    { month: "Jun", rating: 4.9 },
    { month: "Jul", rating: 4.8 },
    { month: "Aug", rating: 4.9 },
    { month: "Sep", rating: 5.0 },
    { month: "Oct", rating: 4.9 },
    { month: "Nov", rating: 4.9 },
    { month: "Dec", rating: 4.9 }
  ];

  const skillDemandData: SkillDemandItem[] = [
    { skill: "Solana", demand: 95 },
    { skill: "Rust", demand: 88 },
    { skill: "React", demand: 82 },
    { skill: "Smart Contracts", demand: 90 },
    { skill: "Web3.js", demand: 75 },
    { skill: "TypeScript", demand: 78 }
  ];

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="glass-panel p-3 border border-glass-border rounded-lg shadow-lg">
        <p className="text-foreground font-semibold">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
            {entry.name.includes("rating") ? "★" : " SOL"}
          </p>
        ))}
      </div>
    );
  };

  const chartAnimationProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const cardAnimationProps = (delay: number, x: number) => ({
    initial: { opacity: 0, x },
    animate: { opacity: 1, x: 0 },
    transition: { delay, duration: 0.6 }
  });

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      {...chartAnimationProps}
    >
      {/* Earnings vs Spending Chart */}
      <motion.div 
        className="glass-card p-6"
        {...cardAnimationProps(0.1, -20)}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {userRole === "freelancer" ? "Monthly Earnings" : "Earnings vs Spending"}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={earningsData}>
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--neon-gold))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--neon-gold))" stopOpacity={0.1}/>
              </linearGradient>
              {userRole === "client" && (
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--neon-cyan))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--neon-cyan))" stopOpacity={0.1}/>
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--glass-border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--foreground-muted))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--foreground-muted))"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="earnings"
              stroke="hsl(var(--neon-gold))"
              fillOpacity={1}
              fill="url(#earningsGradient)"
              strokeWidth={2}
            />
            {userRole === "client" && (
              <Area
                type="monotone"
                dataKey="spending"
                stroke="hsl(var(--neon-cyan))"
                fillOpacity={1}
                fill="url(#spendingGradient)"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Job Status Distribution */}
      <motion.div 
        className="glass-card p-6"
        {...cardAnimationProps(0.2, 20)}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {userRole === "freelancer" ? "Job Status Distribution" : "Project Status Distribution"}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={jobStatusData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {jobStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ 
                fontSize: '12px',
                color: 'hsl(var(--foreground-muted))'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Reputation Trend */}
      <motion.div 
        className="glass-card p-6"
        {...cardAnimationProps(0.3, -20)}
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Reputation Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reputationData}>
            <defs>
              <linearGradient id="reputationGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--neon-purple))" />
                <stop offset="100%" stopColor="hsl(var(--neon-gold))" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--glass-border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--foreground-muted))"
              fontSize={12}
            />
            <YAxis 
              domain={[4.0, 5.0]}
              stroke="hsl(var(--foreground-muted))"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="url(#reputationGradient)"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--neon-gold))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "hsl(var(--neon-gold))", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Skill Demand (Freelancer only) */}
      {userRole === "freelancer" && (
        <motion.div 
          className="glass-card p-6"
          {...cardAnimationProps(0.4, 20)}
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Skill Demand</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillDemandData} layout="horizontal">
              <defs>
                <linearGradient id="skillGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--neon-cyan))" />
                  <stop offset="100%" stopColor="hsl(var(--neon-purple))" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--glass-border))" />
              <XAxis 
                type="number"
                domain={[0, 100]}
                stroke="hsl(var(--foreground-muted))"
                fontSize={12}
              />
              <YAxis 
                type="category"
                dataKey="skill"
                stroke="hsl(var(--foreground-muted))"
                fontSize={12}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="demand"
                fill="url(#skillGradient)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </motion.div>
  );
};