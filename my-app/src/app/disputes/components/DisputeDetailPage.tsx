"use client"
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  Calendar, 
  Briefcase, 
  Shield, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Eye,
  FileText,
  Users,
  TrendingUp,
  Award,
  Target,
  DollarSign,
  Vote,
  Scale,
  Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/(module)/ui/card";
import { Input } from "@/app/(module)/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/(module)/ui/select";
import { Badge } from "@/app/(module)/ui/badge";
import Link from "next/link";
import { Button } from "@/app/(module)/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { fetchJobs, fetchMyJobs, Job } from "@/(anchor)/actions/fetchjob";
import { useUser } from "@/(providers)/userProvider";
import BN from "bn.js";

interface Dispute {
  id: string;
  jobId: string;
  jobTitle: string;
  reason: string;
  status: "open" | "voting" | "resolved" | "rejected";
  createdDate: string;
  amount: number;
  client: string;
  freelancer: string;
  votesForClient: number;
  votesForFreelancer: number;
  totalVotes: number;
  jobPublicKey: PublicKey;
  disputeData?: any;
}

export const DisputeOverviewPage = () => {
  const { wallet, publicKey } = useWallet();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    voting: 0,
    resolved: 0,
    rejected: 0,
    totalAmount: 0
  });

  // Helper function to convert BN to number
  const bnToNumber = (bn: any): number => {
    if (!bn) return 0;
    if (typeof bn === 'number') return bn;
    if (bn.toNumber) return bn.toNumber();
    return 0;
  };

  useEffect(() => {
    const loadDisputes = async () => {
      if (!wallet?.adapter || !publicKey) {
        setLoading(false);
        return;
      }
    
      try {
        setLoading(true);
        
        // Fetch all jobs with disputed status
        const disputedJobs = await fetchJobs(wallet.adapter, { 
          statusFilter: 'disputed' 
        });
    
        // Transform job data into dispute format using REAL dispute data
        const disputeData: Dispute[] = disputedJobs
          .filter(job => job.account.dispute) // Only jobs with actual disputes
          .map((job) => {
            const dispute = job.account.dispute;
            if (!dispute) return null;
    
            const budgetSOL = bnToNumber(job.account.budget) / 1000000000;
            
            // Use REAL dispute data from blockchain
            const votesForRaiser = bnToNumber(dispute.votesForRaiser);
            const votesForAgainst = bnToNumber(dispute.votesForAgainst);
            const totalVotes = votesForRaiser + votesForAgainst;
            
            // Determine actual dispute status from blockchain
            let status: "open" | "voting" | "resolved" | "rejected" = "open";
            if (dispute.status?.open) status = "open";
            else if (dispute.status?.resolved) status = "resolved";
            // Add more status checks as needed
            
            // Check if voting period has ended
            const votingEnd = bnToNumber(dispute.votingEnd);
            const currentTime = Math.floor(Date.now() / 1000);
            if (status === "open" && currentTime >= votingEnd) {
              status = "voting"; // Or create a "pending_finalization" status
            }
    
            return {
              id: job.publicKey.toString(),
              jobId: `job-${bnToNumber(job.account.jobId)}`,
              jobTitle: job.account.title,
              reason: dispute.reason || "No reason provided",
              status,
              createdDate: new Date(bnToNumber(dispute.createdAt) * 1000).toISOString().split('T')[0],
              amount: budgetSOL,
              client: job.account.client.toString().slice(0, 8) + '...' + job.account.client.toString().slice(-8),
              freelancer: job.account.freelancer 
                ? job.account.freelancer.toString().slice(0, 8) + '...' + job.account.freelancer.toString().slice(-8)
                : "Not assigned",
              votesForClient: dispute.raiserRole?.client ? votesForAgainst : votesForRaiser,
              votesForFreelancer: dispute.raiserRole?.freelancer ? votesForRaiser : votesForAgainst,
              totalVotes,
              jobPublicKey: job.publicKey,
              // Add real dispute data for access
              disputeData: dispute
            };
          })
          .filter(Boolean) as Dispute[]; // Remove null entries
    
        setDisputes(disputeData);
    
        // Calculate stats from REAL data
        const statsData = {
          total: disputeData.length,
          open: disputeData.filter(d => d.status === 'open').length,
          voting: disputeData.filter(d => d.status === 'voting').length,
          resolved: disputeData.filter(d => d.status === 'resolved').length,
          rejected: disputeData.filter(d => d.status === 'rejected').length,
          totalAmount: disputeData.reduce((sum, dispute) => sum + dispute.amount, 0)
        };
        setStats(statsData);
    
      } catch (error) {
        console.error("Failed to load disputes:", error);
        setDisputes([]);
      } finally {
        setLoading(false);
      }
    };

    loadDisputes();
  }, [wallet, publicKey]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4" />;
      case "voting":
        return <Vote className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "voting":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "resolved":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      default:
        return "bg-glass-secondary text-foreground-muted";
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case "open":
        return "from-yellow-500/10 to-yellow-600/5";
      case "voting":
        return "from-blue-500/10 to-blue-600/5";
      case "resolved":
        return "from-green-500/10 to-green-600/5";
      case "rejected":
        return "from-red-500/10 to-red-600/5";
      default:
        return "from-glass-secondary to-glass-primary";
    }
  };

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      dispute.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || dispute.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const groupedDisputes = {
    open: filteredDisputes.filter((d) => d.status === "open"),
    voting: filteredDisputes.filter((d) => d.status === "voting"),
    resolved: filteredDisputes.filter((d) => d.status === "resolved"),
    rejected: filteredDisputes.filter((d) => d.status === "rejected"),
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-8 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
            <div className="text-lg text-foreground">Loading disputes...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-neon-cyan/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-neon-purple/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20">
              <Scale className="h-8 w-8 text-neon-cyan" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Dispute Resolution Center
              </h1>
              <p className="text-foreground-muted text-lg mt-2">
                Manage and resolve job disputes through community voting
              </p>
            </div>
          </div>
          
          {publicKey && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass-primary border border-glass-border text-sm text-foreground-muted">
              <div className="w-2 h-2 bg-neon-cyan rounded-full"></div>
              Connected: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
            </div>
          )}
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8"
        >
          <StatCard
            title="Total Disputes"
            value={stats.total}
            icon={<Shield className="h-5 w-5" />}
            color="cyan"
          />
          <StatCard
            title="Open"
            value={stats.open}
            icon={<AlertTriangle className="h-5 w-5" />}
            color="yellow"
          />
          <StatCard
            title="Voting"
            value={stats.voting}
            icon={<Vote className="h-5 w-5" />}
            color="blue"
          />
          <StatCard
            title="Resolved"
            value={stats.resolved}
            icon={<CheckCircle2 className="h-5 w-5" />}
            color="green"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={<XCircle className="h-5 w-5" />}
            color="red"
          />
          <StatCard
            title="Total Value"
            value={`${stats.totalAmount} SOL`}
            icon={<DollarSign className="h-5 w-5" />}
            color="purple"
          />
        </motion.div>

        {/* Enhanced Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <Input
                  placeholder="Search disputes, jobs, or addresses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-glass-primary border-glass-border focus:border-neon-cyan/50 h-12 rounded-xl"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-glass-primary border-glass-border h-12 rounded-xl min-w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="glass-card border-glass-border rounded-xl">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="voting">Under Voting</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="bg-glass-primary border-glass-border h-12 rounded-xl min-w-[150px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent className="glass-card border-glass-border rounded-xl">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Dispute Sections */}
        <div className="space-y-8">
          {/* Open Disputes */}
          {groupedDisputes.open.length > 0 && (
            <DisputeSection
              title="Open Disputes"
              description="Disputes awaiting review and assignment"
              disputes={groupedDisputes.open}
              icon={<AlertTriangle className="h-5 w-5" />}
              delay={0.3}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              getStatusGradient={getStatusGradient}
              formatRelativeTime={formatRelativeTime}
            />
          )}

          {/* Under Voting */}
          {groupedDisputes.voting.length > 0 && (
            <DisputeSection
              title="Under Voting"
              description="Active disputes being voted on by the community"
              disputes={groupedDisputes.voting}
              icon={<Vote className="h-5 w-5" />}
              delay={0.4}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              getStatusGradient={getStatusGradient}
              formatRelativeTime={formatRelativeTime}
            />
          )}

          {/* Resolved */}
          {groupedDisputes.resolved.length > 0 && (
            <DisputeSection
              title="Resolved"
              description="Successfully resolved disputes"
              disputes={groupedDisputes.resolved}
              icon={<CheckCircle2 className="h-5 w-5" />}
              delay={0.5}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              getStatusGradient={getStatusGradient}
              formatRelativeTime={formatRelativeTime}
            />
          )}

          {/* Rejected */}
          {groupedDisputes.rejected.length > 0 && (
            <DisputeSection
              title="Rejected"
              description="Disputes that were rejected or dismissed"
              disputes={groupedDisputes.rejected}
              icon={<XCircle className="h-5 w-5" />}
              delay={0.6}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              getStatusGradient={getStatusGradient}
              formatRelativeTime={formatRelativeTime}
            />
          )}
        </div>

        {/* Enhanced Empty State */}
        {filteredDisputes.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <div className="glass-card p-12 max-w-2xl mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                <Scale className="h-10 w-10 text-neon-cyan" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                No Disputes Found
              </h3>
              <p className="text-foreground-muted mb-8 text-lg">
                {searchQuery || statusFilter !== "all"
                  ? "No disputes match your current search criteria"
                  : "All disputes are currently resolved. New disputes will appear here automatically"}
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="glass"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setDateFilter("all");
                  }}
                  className="rounded-xl"
                >
                  Clear Filters
                </Button>
                <Button variant="neon" className="rounded-xl">
                  <Zap className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Enhanced Stat Card Component
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: "cyan" | "yellow" | "blue" | "green" | "red" | "purple";
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  const colorClasses = {
    cyan: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20",
    yellow: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
    purple: "bg-neon-purple/10 text-neon-purple border-neon-purple/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="glass-card p-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground-muted">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

interface DisputeSectionProps {
  title: string;
  description: string;
  disputes: Dispute[];
  icon: React.ReactNode;
  delay: number;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  getStatusGradient: (status: string) => string;
  formatRelativeTime: (date: string) => string;
}

const DisputeSection = ({ 
  title, 
  description,
  disputes, 
  icon, 
  delay, 
  getStatusIcon, 
  getStatusColor,
  getStatusGradient,
  formatRelativeTime 
}: DisputeSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
            <div className="text-neon-cyan">{icon}</div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
            <p className="text-foreground-muted mt-1">{description}</p>
          </div>
        </div>
        <Badge variant="outline" className="px-3 py-1.5 bg-glass-primary border-glass-border text-foreground-muted">
          {disputes.length} {disputes.length === 1 ? 'dispute' : 'disputes'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {disputes.map((dispute, index) => (
          <motion.div
            key={dispute.id}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: delay + index * 0.05 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className={`h-full bg-gradient-to-br ${getStatusGradient(dispute.status)} glass-card border-glass-border hover:border-neon-cyan/30 hover-lift group overflow-hidden`}>
              {/* Status Indicator Bar */}
              <div className={`h-1 ${getStatusColor(dispute.status).split(' ')[0]} ${dispute.status === 'voting' ? 'animate-pulse' : ''}`} />
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <CardTitle className="text-lg leading-6 text-foreground group-hover:text-neon-cyan transition-colors line-clamp-2">
                    {dispute.jobTitle}
                  </CardTitle>
                  <div className={`p-2 rounded-lg border ${getStatusColor(dispute.status)} shrink-0`}>
                    {getStatusIcon(dispute.status)}
                  </div>
                </div>
                <CardDescription className="text-foreground-muted line-clamp-2 text-sm leading-relaxed">
                  {dispute.reason}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Voting Progress for Voting disputes */}
                {dispute.status === 'voting' && (
                  <div className="space-y-3 p-3 rounded-lg bg-glass-secondary border border-glass-border">
                    <div className="flex justify-between text-xs font-medium text-foreground-muted">
                      <span>Client: {dispute.votesForClient}</span>
                      <span>Freelancer: {dispute.votesForFreelancer}</span>
                    </div>
                    <div className="w-full bg-glass-primary rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-neon-cyan to-neon-purple h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(dispute.votesForClient / dispute.totalVotes) * 100}%` 
                        }}
                      />
                    </div>
                    <div className="text-xs text-center text-foreground-muted font-medium">
                      {dispute.totalVotes} total votes • {Math.round((Math.max(dispute.votesForClient, dispute.votesForFreelancer) / dispute.totalVotes) * 100)}% consensus
                    </div>
                  </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-foreground-muted">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm font-medium">Amount</span>
                    </div>
                    <div className="text-lg font-semibold text-foreground">
                      {dispute.amount} SOL
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-foreground-muted">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm font-medium">Created</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {formatRelativeTime(dispute.createdDate)}
                    </div>
                  </div>
                </div>

                {/* Parties Involved */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="text-foreground-muted font-medium">Client</div>
                      <div className="font-mono text-foreground bg-glass-primary px-2 py-1 rounded border border-glass-border">
                        {dispute.client}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-foreground-muted font-medium">Freelancer</div>
                      <div className="font-mono text-foreground bg-glass-primary px-2 py-1 rounded border border-glass-border">
                        {dispute.freelancer}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Link href={`/disputes/${dispute.id}`} className="block">
                  <Button
                    className="w-full bg-glass-primary border-glass-border text-foreground hover:bg-neon-cyan/10 hover:border-neon-cyan/50 hover:text-neon-cyan transition-all duration-300 group-hover:shadow-lg rounded-xl py-2.5"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};