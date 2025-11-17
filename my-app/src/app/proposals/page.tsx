"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  Star,
  Eye,
  AlertCircle,
  User,
  Briefcase,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Target,
  FileText,
  RefreshCw,
  MessageSquare,
  Download,
  Wallet
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Badge } from "../(module)/ui/badge";
import { Button } from "../(module)/ui/button";
import { fetchJobs } from "@/(anchor)/actions/fetchjob";
import { useUser } from "@/(providers)/userProvider";
import BN from "bn.js";
import { getProgram } from "@/(anchor)/setup";
import { toast } from "sonner";

interface Job {
  publicKey: PublicKey;
  account: {
    authority: PublicKey;
    client: PublicKey;
    freelancer: PublicKey | null;
    jobId: any;
    title: string;
    description: string;
    budget: any;
    deadline: any;
    status: any;
    createdAt: any;
    updatedAt: any;
    category?: string;
    skills?: string[];
    bidders?: Array<{
      freelancer: PublicKey;
      bidAmount: number;
      proposal: string;
      submittedAt: number;
    }>;
    workSubmitted: boolean;
    workApproved: boolean;
    workSubmissionUrl: string;
    workSubmissionDescription: string;
    workSubmittedAt: any;
    workApprovedAt: any;
    escrow: PublicKey;
    revisionRequest?: {
      reason: string;
      requestedAt: any;
      changesRequired: string[];
    } | null;
  };
}

interface FreelancerUser {
  authority: PublicKey;
  name: string;
  isClient: boolean;
  isFreelancer: boolean;
  reputation: BN;
  activeJobs: BN;
  completedJobs: BN;
  pendingJobs: BN;
  cancelledJobs: BN;
  totalEarnings: BN;
  totalSpent: BN;
  disputesRaised: BN;
  disputesResolved: BN;
  createdAt: BN;
  resume: {
    education: Array<any>;
    experience: Array<any>;
    skills: Array<string>;
    certifications: Array<any>;
    portfolio: Array<any>;
    bio?: string;
  } | null;
}

interface Proposal {
  id: string;
  job: Job;
  bid: number;
  duration: string;
  submittedDate: string;
  status: "pending" | "shortlisted" | "assigned" | "hired" | "inProgress" | "completed" | "disputed" | "rejected" | "revisionRequested";
  clientResponse?: string;
  views?: number;
  isAssigned: boolean;
  hasBid: boolean;
  wasRejected: boolean;
  myBid?: {
    amount: number;
    proposal: string;
    submittedAt: number;
  };
}

const ProposalManagementPage = () => {
  const navigate = useRouter();
  const { wallet, publicKey } = useWallet();
  const { user } = useUser();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedRevisionJob, setSelectedRevisionJob] = useState<string | null>(null);
  const [withdrawingFunds, setWithdrawingFunds] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState<string | null>(null);
  const [clientRating, setClientRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Helper function to convert BN to number
  const bnToNumber = (bn: any): number => {
    if (!bn) return 0;
    if (typeof bn === 'number') return bn;
    if (bn.toNumber) return bn.toNumber();
    return 0;
  };

  // Helper function to format SOL from lamports
  const lamportsToSOL = (lamports: number): string => {
    return (lamports / 1_000_000_000).toFixed(2);
  };

  // Function to handle rating submission
  const handleSubmitRating = async (jobPublicKey: string, proposal: Proposal) => {
    if (!wallet?.adapter || !publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    if (clientRating === 0) {
      toast.error("Please select a rating before submitting");
      return;
    }

    try {
      setIsSubmittingRating(true);
      
      const program = getProgram(wallet.adapter);
      const jobAccount = new PublicKey(jobPublicKey);
      
      // Fetch current job data
      const jobData = await program.account.job.fetch(jobAccount);
      const numericJobId = jobData.jobId;

      // Demo blockchain function - rate client and withdraw funds
      const tx = await program.methods
        .withdrawFromEscrow(numericJobId, clientRating)
        .accounts({
          job: jobAccount,
          freelancer: publicKey,
          client: proposal.job.account.client,
          escrow: proposal.job.account.escrow,
        })
        .rpc();

      console.log("Client rated and funds withdrawn successfully:", tx);
      console.log("Client rating:", clientRating);
      
      // Update local state
      setProposals(prev => prev.map(p => 
        p.id === jobPublicKey 
          ? { ...p, status: "completed" as const }
          : p
      ));

      toast.success(`Successfully rated client and withdrawn ${proposal.bid.toFixed(2)} SOL!`);
      setShowRatingModal(null);
      setClientRating(0);
      
    } catch (error) {
      console.error("Failed to rate client and withdraw funds:", error);
      toast.error("Failed to complete transaction. Please try again.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Function to open rating modal and withdraw funds
  const handleWithdrawFunds = async (jobPublicKey: string, proposal: Proposal) => {
    setShowRatingModal(jobPublicKey);
  };

  // Check if funds can be withdrawn (job completed and escrow has funds)
  const canWithdrawFunds = (proposal: Proposal): boolean => {
    return proposal.status === "completed" && 
           proposal.isAssigned && 
           !proposal.job.account.escrow.equals(PublicKey.default) &&
           proposal.job.account.workApproved;
  };

  useEffect(() => {
    const loadProposals = async () => {
      // Use wallet adapter publicKey directly
      const userPublicKey = publicKey;
      
      // Comprehensive checks for required data
      if (!userPublicKey || !wallet?.adapter || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch ALL jobs first
        const allJobs = await fetchJobs(wallet.adapter);
        console.log(allJobs)
        // CRITICAL FIX: Only show jobs where freelancer has actually interacted
        const freelancerJobs = (allJobs || []).filter(job => {
          if (!job?.account) return false;

          const jobFreelancer = job.account.freelancer;
          const jobBidders = job.account.bidders || [];
          
          // Case 1: Freelancer is assigned to this job (hired)
          const isAssigned = jobFreelancer && 
                            !jobFreelancer.equals(PublicKey.default) && 
                            jobFreelancer.equals(userPublicKey);
          
          // Case 2: Freelancer has bid on this job (check bidders array)
          const hasBid = jobBidders.length > 0 && jobBidders.some((bidder: any) => {
            if (!bidder?.freelancer) return false;
            try {
              return bidder.freelancer.equals(userPublicKey);
            } catch (e) {
              return false;
            }
          });

          // ONLY include if freelancer has actually applied (hasBid) or is assigned
          return isAssigned || hasBid;
        });


        const proposalData: Proposal[] = freelancerJobs.map((job) => {
          const jobStatus = job?.account?.status ? Object.keys(job.account.status)[0] : 'open';
          
          // Check freelancer assignment status
          const isAssigned = job.account.freelancer && 
                            !job.account.freelancer.equals(PublicKey.default) &&
                            job.account.freelancer.equals(userPublicKey);
          
          // Check if freelancer has bid on this job
          const myBid = job.account.bidders?.find((bidder: any) => {
            if (!bidder?.freelancer) return false;
            try {
              const matches = bidder.freelancer.equals(userPublicKey);
              return matches;
            } catch (e) {
              console.error("Error comparing bidder:", e);
              return false;
            }
          });

          const hasBid = !!myBid;
          
          // Check if freelancer was rejected (had bid but not selected)
          const wasRejected = hasBid && job.account.freelancer && 
                            !job.account.freelancer.equals(PublicKey.default) &&
                            !job.account.freelancer.equals(userPublicKey);

          // Check for revision request
          const hasRevisionRequest = job.account.revisionRequest !== null && 
                                   job.account.revisionRequest !== undefined;

          let status: Proposal["status"] = "pending";
          
          // Check if job has a dispute first (highest priority)
          const hasDispute = job.account.dispute !== null && 
                            job.account.dispute !== undefined;
          
          // PERFECTED STATUS DETERMINATION
          if (hasDispute) {
            status = "disputed";
          } else if (isAssigned) {
            // Freelancer is hired/assigned
            if (hasRevisionRequest) {
              status = "revisionRequested";
            } else if (job.account.workSubmitted && !job.account.workApproved) {
              status = "inProgress"; // Work submitted, waiting approval
            } else if (job.account.workApproved) {
              status = "completed"; // Work approved, job completed
            } else {
              status = "assigned"; // Hired but haven't started/submitted work
            }
          } else if (wasRejected) {
            // Freelancer had bid but wasn't selected
            status = "rejected";
          } else if (hasBid) {
            // Freelancer has bid but job is still open/no decision yet
            status = "pending";
          } else {
            // Shouldn't happen due to our filter, but fallback
            status = "pending";
          }


          const budgetLamports = bnToNumber(job.account.budget);
          const bidAmount = budgetLamports /1000000000
          
          const duration = calculateDuration(job.account.createdAt, job.account.deadline);
          const submittedDate = formatRelativeTime(
            hasBid && myBid ? myBid.submittedAt : job.account.createdAt
          );

          const proposalItem = {
            id: job.publicKey.toString(),
            job: job,
            bid: bidAmount,
            duration: duration,
            submittedDate: submittedDate,
            status: status,
            views: Math.floor(Math.random() * 10) + 1,
            isAssigned,
            hasBid,
            wasRejected: !!wasRejected,
            myBid: myBid ? {
              amount: bnToNumber(myBid.bidAmount),
              proposal: myBid.proposal,
              submittedAt: bnToNumber(myBid.submittedAt)
            } : undefined
          };
          return proposalItem;
        }).filter((proposal): proposal is Proposal => proposal !== null);

        setProposals(proposalData);
      } catch (error) {
        console.error("Failed to load proposals:", error);
        setProposals([]);
      } finally {
        setLoading(false);
      }
    };

    loadProposals();
  }, [wallet, publicKey, user]); // Add publicKey to dependencies

  const calculateDuration = (createdAt: any, deadline: any): string => {
    if (!createdAt || !deadline) return "Not specified";
    
    const created = bnToNumber(createdAt);
    const deadlineNum = bnToNumber(deadline);
    
    const diffWeeks = Math.ceil((deadlineNum - created) / (60 * 60 * 24 * 7));
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''}`;
  };

  const formatRelativeTime = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    
    const timestampNumber = bnToNumber(timestamp);
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestampNumber;
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return `${Math.floor(diff / 604800)} weeks ago`;
  };

  const formatBudget = (budget: any): string => {
    if (!budget) return "0 SOL";
    const lamports = bnToNumber(budget);
    const solAmount = lamports / 1_000_000_000;
    return `${solAmount.toFixed(2)} SOL`;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-warning/20 text-warning border-warning/30",
          icon: Clock,
          label: "Under Review"
        };
      case "shortlisted":
        return {
          color: "bg-neon-gold/20 text-neon-gold border-neon-gold/30",
          icon: Star,
          label: "Shortlisted"
        };
      case "assigned":
        return {
          color: "bg-blue-500/20 text-blue-500 border-blue-500/30",
          icon: Briefcase,
          label: "Assigned - Start Work"
        };
      case "hired":
        return {
          color: "bg-success/20 text-success border-success/30",
          icon: CheckCircle2,
          label: "Hired - Ready to Start"
        };
      case "inProgress":
        return {
          color: "bg-purple-500/20 text-purple-500 border-purple-500/30",
          icon: RefreshCw,
          label: "In Progress - Waiting Approval"
        };
      case "completed":
        return {
          color: "bg-green-500/20 text-green-500 border-green-500/30",
          icon: CheckCircle2,
          label: "Completed"
        };
      case "disputed":
        return {
          color: "bg-orange-500/20 text-orange-500 border-orange-500/30",
          icon: AlertCircle,
          label: "Disputed"
        };
      case "rejected":
        return {
          color: "bg-destructive/20 text-destructive border-destructive/30",
          icon: XCircle,
          label: "Not Selected"
        };
      case "revisionRequested":
        return {
          color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
          icon: MessageSquare,
          label: "Revision Requested"
        };
      default:
        return {
          color: "bg-foreground-muted/20 text-foreground-muted",
          icon: AlertCircle,
          label: status
        };
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    if (filter === "all") return true;
    return proposal.status === filter;
  });

  const stats = {
    pending: proposals.filter(p => p.status === "pending").length,
    assigned: proposals.filter(p => p.status === "assigned").length,
    inProgress: proposals.filter(p => p.status === "inProgress").length,
    revisionRequested: proposals.filter(p => p.status === "revisionRequested").length,
    completed: proposals.filter(p => p.status === "completed").length,
    rejected: proposals.filter(p => p.status === "rejected").length,
    disputed: proposals.filter(p => p.status === "disputed").length
  };
  const totalEarn = user.totalEarnings/1000000000;
  // Calculate freelancer stats from user data with safety checks
  const freelancerStats = user && publicKey ? {
    reputation: bnToNumber(user.reputation || 0),
    activeJobs: bnToNumber(user.activeJobs || 0),
    completedJobs: bnToNumber(user.completedJobs || 0),
    totalEarnings: totalEarn,
    successRate: user.completedJobs && user.activeJobs 
      ? Math.round((bnToNumber(user.completedJobs) / (bnToNumber(user.completedJobs) + bnToNumber(user.cancelledJobs || 0) || 1)) * 100)
      : 0,
    skills: user.resume?.skills || []
  } : null;

  const handleViewJob = (jobPublicKey: string) => {
    navigate.push(`/jobs/${jobPublicKey}?role=freelancer`);
  };

  const handleSubmitWork = (jobPublicKey: string) => {
    navigate.push(`/submit-work/${jobPublicKey}`);
  };

  const handleViewRevisionRequest = (jobPublicKey: string) => {
    setSelectedRevisionJob(selectedRevisionJob === jobPublicKey ? null : jobPublicKey);
  };

  const handleResubmitWork = (jobPublicKey: string) => {
    navigate.push(`/submit-work/${jobPublicKey}?revision=true`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
          <div className="text-lg text-foreground">Loading your proposals...</div>
        </div>
      </div>
    );
  }

  // Check if wallet is connected
  if (!publicKey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-16 w-16 text-foreground-muted" />
          <h2 className="text-2xl font-bold text-foreground">Wallet Not Connected</h2>
          <p className="text-foreground-muted">Please connect your wallet to view your proposals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              My Proposals & Jobs
            </span>
          </h1>
          <p className="text-foreground-muted text-lg">
            Track all jobs you've applied to and been assigned to
          </p>
          <div className="mt-2 text-sm text-foreground-muted">
            Wallet: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
          </div>
        </motion.div>

        {/* Freelancer Profile Stats */}
        {user && publicKey && freelancerStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-6 mb-8"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {user.name || "Unknown User"}
                </h2>
                <Badge variant="outline" className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30">
                  <Star className="h-3 w-3 mr-1" />
                  Freelancer
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-sm text-foreground-muted mb-1">Total Earnings</div>
                <div className="text-2xl font-bold text-neon-gold">
                  {freelancerStats.totalEarnings} SOL
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-panel p-4 rounded-lg">
                <div className="flex items-center gap-2 text-neon-cyan mb-1">
                  <Award className="h-4 w-4" />
                  <span className="text-xs text-foreground-muted">Reputation</span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {freelancerStats.reputation}
                </p>
              </div>

              <div className="glass-panel p-4 rounded-lg">
                <div className="flex items-center gap-2 text-blue-500 mb-1">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-xs text-foreground-muted">Active Jobs</span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {freelancerStats.activeJobs}
                </p>
              </div>

              <div className="glass-panel p-4 rounded-lg">
                <div className="flex items-center gap-2 text-green-500 mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs text-foreground-muted">Completed</span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {freelancerStats.completedJobs}
                </p>
              </div>

              <div className="glass-panel p-4 rounded-lg">
                <div className="flex items-center gap-2 text-neon-purple mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs text-foreground-muted">Success Rate</span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {freelancerStats.successRate}%
                </p>
              </div>
            </div>

            {freelancerStats.skills.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-sm text-foreground-muted mb-2">Skills</div>
                <div className="flex flex-wrap gap-2">
                  {freelancerStats.skills.map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-8"
        >
          <div className="glass-card p-6 hover-lift">
            <div className="flex items-center gap-2 text-warning mb-2">
              <Clock className="h-5 w-5" />
              <span className="text-sm text-foreground-muted">Pending</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.pending}</p>
          </div>

          <div className="glass-card p-6 hover-lift">
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <Briefcase className="h-5 w-5" />
              <span className="text-sm text-foreground-muted">Assigned</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.assigned}</p>
          </div>

          <div className="glass-card p-6 hover-lift">
            <div className="flex items-center gap-2 text-purple-500 mb-2">
              <RefreshCw className="h-5 w-5" />
              <span className="text-sm text-foreground-muted">In Progress</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.inProgress}</p>
          </div>

          <div className="glass-card p-6 hover-lift">
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm text-foreground-muted">Revision</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.revisionRequested}</p>
          </div>

          <div className="glass-card p-6 hover-lift">
            <div className="flex items-center gap-2 text-green-500 mb-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm text-foreground-muted">Completed</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.completed}</p>
          </div>

          <div className="glass-card p-6 hover-lift">
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm text-foreground-muted">Disputed</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.disputed}</p>
          </div>

          <div className="glass-card p-6 hover-lift">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <XCircle className="h-5 w-5" />
              <span className="text-sm text-foreground-muted">Not Selected</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.rejected}</p>
          </div>
        </motion.div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: "all", label: "All Proposals" },
            { key: "pending", label: "Pending" },
            { key: "assigned", label: "Assigned" },
            { key: "inProgress", label: "In Progress" },
            { key: "revisionRequested", label: "Revision" },
            { key: "completed", label: "Completed" },
            { key: "disputed", label: "Disputed" },
            { key: "rejected", label: "Not Selected" }
          ].map((filterOption) => (
            <Button
              key={filterOption.key}
              variant={filter === filterOption.key ? "neon" : "glass"}
              onClick={() => setFilter(filterOption.key)}
              className="whitespace-nowrap"
            >
              {filterOption.label}
            </Button>
          ))}
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          {filteredProposals.map((proposal, index) => {
            const statusConfig = getStatusConfig(proposal.status);
            const StatusIcon = statusConfig.icon;
            const hasRevisionRequest = proposal.job.account.revisionRequest !== null && 
                                     proposal.job.account.revisionRequest !== undefined;

            return (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="glass-card p-6 hover-lift"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {proposal.job.account.title}
                    </h3>
                    <p className="text-sm text-foreground-muted mb-3 line-clamp-2">
                      {proposal.job.account.description}
                    </p>
                    
                    {/* Bid/Assignment Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {proposal.isAssigned && (
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Assigned
                        </Badge>
                      )}
                      {proposal.hasBid && !proposal.isAssigned && (
                        <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                          <Clock className="h-3 w-3 mr-1" />
                          Applied
                        </Badge>
                      )}
                      {hasRevisionRequest && (
                        <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Revision Requested
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-foreground-muted">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Client: {proposal.job.account.client.toString().slice(0, 8)}...</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted {proposal.submittedDate}</span>
                      </div>
                      {proposal.job.account.category && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {proposal.job.account.category}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge className={`${statusConfig.color} gap-2 flex-shrink-0`}>
                    <StatusIcon className="h-4 w-4" />
                    {statusConfig.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="glass-panel p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-neon-gold mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs text-foreground-muted">
                        {proposal.myBid ? "Your Bid" : "Budget"}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      {proposal.bid.toFixed(2)} SOL
                    </p>
                  </div>

                  <div className="glass-panel p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-neon-cyan mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs text-foreground-muted">Duration</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{proposal.duration}</p>
                  </div>

                  <div className="glass-panel p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-neon-purple mb-1">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs text-foreground-muted">Views</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{proposal.views}</p>
                  </div>

                  <div className="glass-panel p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-500 mb-1">
                      <Target className="h-4 w-4" />
                      <span className="text-xs text-foreground-muted">Job ID</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">
                      #{bnToNumber(proposal.job.account.jobId)}
                    </p>
                  </div>
                </div>

                {/* Revision Request Section */}
                {hasRevisionRequest && proposal.job.account.revisionRequest && (
                  <div className={`glass-panel p-4 rounded-lg mb-4 border-l-4 border-yellow-500 transition-all duration-300 ${
                    selectedRevisionJob === proposal.id ? 'bg-yellow-500/10' : ''
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-yellow-500" />
                        <span className="font-semibold text-foreground">Revision Requested</span>
                        <Badge variant="outline" className="text-yellow-500 border-yellow-500/50 text-xs">
                          {formatRelativeTime(proposal.job.account.revisionRequest.requestedAt)}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                        onClick={() => handleViewRevisionRequest(proposal.id)}
                      >
                        {selectedRevisionJob === proposal.id ? 'Hide Details' : 'View Details'}
                      </Button>
                    </div>
                    
                    {selectedRevisionJob === proposal.id && (
                      <div className="space-y-3 animate-in fade-in duration-300">
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-1">Reason for Revision:</h4>
                          <p className="text-sm text-foreground-muted bg-black/20 p-3 rounded-lg">
                            {proposal.job.account.revisionRequest}
                          </p>
                        </div>
                        
                        {proposal.job.account.revisionRequest.changesRequired && 
                         proposal.job.account.revisionRequest.changesRequired.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-1">Changes Required:</h4>
                            <ul className="text-sm text-foreground-muted space-y-1">
                              {proposal.job.account.revisionRequest.changesRequired.map((change, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-yellow-500 mt-1">•</span>
                                  <span>{change}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex gap-3 pt-2">
                          <Button
                            className="gap-2 bg-yellow-500 hover:bg-yellow-600"
                            onClick={() => handleResubmitWork(proposal.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                            Resubmit Work
                          </Button>
                          <Button
                            variant="outline"
                            className="gap-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                            onClick={() => handleViewJob(proposal.id)}
                          >
                            <Eye className="h-4 w-4" />
                            View Job Details
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Work Submission Status */}
                {proposal.status === "inProgress" && proposal.job.account.workSubmitted && (
                  <div className="glass-panel p-4 rounded-lg mb-4 border-l-4 border-purple-500">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-500" />
                      <span className="font-semibold text-foreground">Work Submitted</span>
                    </div>
                    <p className="text-sm text-foreground-muted">
                      Waiting for client approval
                    </p>
                    {proposal.job.account.workSubmittedAt && (
                      <p className="text-xs text-foreground-muted mt-1">
                        Submitted {formatRelativeTime(proposal.job.account.workSubmittedAt)}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="glass"
                    className="gap-2"
                    onClick={() => handleViewJob(proposal.id)}
                  >
                    <Eye className="h-4 w-4" />
                    View Job Details
                  </Button>

                  {proposal.status === "assigned" && (
                    <Button 
                      variant="neon" 
                      className="gap-2"
                      onClick={() => handleSubmitWork(proposal.id)}
                    >
                      <Briefcase className="h-4 w-4" />
                      Start Work
                    </Button>
                  )}

                  {proposal.status === "inProgress" && !proposal.job.account.workSubmitted && (
                    <>
                      <Button 
                        variant="neon" 
                        className="gap-2"
                        onClick={() => handleSubmitWork(proposal.id)}
                      >
                        <Briefcase className="h-4 w-4" />
                        Continue Work
                      </Button>
                      <Button 
                        variant="outline" 
                        className="gap-2 border-purple-500 text-purple-500 hover:bg-purple-500/10"
                        onClick={() => handleSubmitWork(proposal.id)}
                      >
                        <FileText className="h-4 w-4" />
                        Submit Work
                      </Button>
                    </>
                  )}

                  {canWithdrawFunds(proposal) && (
                    <Button 
                      variant="neon" 
                      className="gap-2 bg-green-600 hover:bg-green-700"
                      onClick={() => handleWithdrawFunds(proposal.id, proposal)}
                    >
                      <Wallet className="h-4 w-4" />
                      Get Money ({proposal.bid.toFixed(2)} SOL)
                    </Button>
                  )}

                  {proposal.status === "completed" && !canWithdrawFunds(proposal) && (
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30 gap-2 text-sm px-4 py-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Payment Released
                    </Badge>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProposals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center"
          >
            <AlertCircle className="h-16 w-16 text-foreground-muted mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {filter === "all" ? "No Proposals Yet" : `No ${filter} Proposals`}
            </h3>
            <p className="text-foreground-muted mb-6">
              {filter === "all" 
                ? "Start applying to jobs to see your proposals here"
                : `You don't have any ${filter} proposals at the moment`
              }
            </p>
            {filter === "all" && (
              <Button
                variant="neon"
                onClick={() => navigate.push(`/jobs`)}
              >
                Browse Jobs
              </Button>
            )}
          </motion.div>
        )}
      </div>

      {/* Rating Modal for Withdrawing Funds */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-lg w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Rate Client & Withdraw Funds</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowRatingModal(null);
                  setClientRating(0);
                }}
                className="hover:text-neon-cyan"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3 text-center">Rate Your Client Experience</h4>
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setClientRating(star)}
                      className="text-3xl focus:outline-none transition-transform hover:scale-110"
                    >
                      {star <= clientRating ? (
                        <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <Star className="h-8 w-8 text-gray-400 hover:text-yellow-500" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-center text-foreground-muted text-sm">
                  {clientRating === 0 ? "Select a rating" : `You rated ${clientRating} star${clientRating > 1 ? 's' : ''}`}
                </p>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="flex gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-foreground-muted">
                    <p className="font-medium text-foreground mb-1">Withdrawing funds will:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Transfer {proposals.find(p => p.id === showRatingModal)?.bid.toFixed(2)} SOL to your wallet</li>
                      <li>Submit your rating to the client's profile</li>
                      <li>Update both parties' reputation scores</li>
                      <li>Close the job permanently</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="glass"
                  className="flex-1"
                  onClick={() => {
                    setShowRatingModal(null);
                    setClientRating(0);
                  }}
                  disabled={isSubmittingRating}
                >
                  Cancel
                </Button>
                <Button
                  variant="neon"
                  className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                  onClick={() => handleSubmitRating(showRatingModal, proposals.find(p => p.id === showRatingModal)!)}
                  disabled={isSubmittingRating || clientRating === 0}
                >
                  {isSubmittingRating ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4" />
                      Rate & Withdraw
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProposalManagementPage;