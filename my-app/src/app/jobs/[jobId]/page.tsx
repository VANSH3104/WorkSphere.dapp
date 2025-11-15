"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft,
  Clock,
  DollarSign,
  Calendar,
  Briefcase,
  Star,
  CheckCircle,
  FileText,
  Users,
  Edit,
  XCircle,
  MapPin,
  User
} from "lucide-react";
import { Badge } from "@/app/(module)/ui/badge";
import { Button } from "@/app/(module)/ui/button";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

import { PublicKey } from "@solana/web3.js";
import { useUser } from "@/(providers)/userProvider";
import { fetchJobByPublicKey } from "@/(anchor)/actions/fetchjob";
import BN from "bn.js";

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
    bidders?: any[];
  };
}

interface UserData {
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
  resume: string | null;
}

interface ClientInfo {
  name: string;
  rating: number;
  verified: boolean;
  jobsPosted: number;
  hireRate: number;
  location: string;
  successRate?: number;
  totalSpent?: string;
  reputation?: number;
  activeJobs?: number;
  completedJobs?: number;
}

const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const userRole = searchParams.get("role") || "client";
  const { wallet } = useWallet();
  const { fetchUserByAddress } = useUser();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadJob = async () => {
      if (!wallet?.adapter?.publicKey || !jobId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const jobPublicKey = new PublicKey(jobId as string);
        const jobData = await fetchJobByPublicKey(wallet.adapter, jobPublicKey);
        
        if (jobData) {
          setJob(jobData);
          
          // Fetch client data AFTER job data is set
          try {
            const clientAddress = jobData.account.client.toBase58();
            const clientUserData = await fetchUserByAddress(clientAddress);
            setClientData(clientUserData);
            console.log("Client data:", clientUserData);
          } catch (clientError) {
            console.error("Failed to fetch client data:", clientError);
            // Continue even if client data fails
          }
        } else {
          setError('Job not found');
        }
      } catch (err) {
        console.error('Failed to load job:', err);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [wallet?.adapter?.publicKey, jobId, fetchUserByAddress]);

  // Format BN budget from lamports to SOL
  const formatBudget = (budget: any): string => {
    if (!budget) return "0 SOL";
    
    if (budget.toNumber) {
      const lamports = budget.toNumber();
      const solAmount = lamports / 1000000000;
      return `${solAmount.toFixed(2)} SOL`;
    }
    
    const solAmount = budget / 1000000000;
    return `${solAmount.toFixed(2)} SOL`;
  };

  // Format job status for display
  const formatJobStatus = (status: any) => {
    if (!status) return "Unknown";
    const statusKey = Object.keys(status)[0];
    return statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
  };

  // Format timestamp to readable date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    
    let timestampNumber: number;
    if (timestamp.toNumber) {
      timestampNumber = timestamp.toNumber();
    } else {
      timestampNumber = timestamp;
    }

    return new Date(timestampNumber * 1000).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format relative time
  const formatRelativeTime = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    
    let timestampNumber: number;
    if (timestamp.toNumber) {
      timestampNumber = timestamp.toNumber();
    } else {
      timestampNumber = timestamp;
    }

    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestampNumber;
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return `${Math.floor(diff / 604800)} weeks ago`;
  };

  // Format deadline
  const formatDeadline = (deadline: any) => {
    if (!deadline) return "Not set";
    
    let deadlineNumber: number;
    if (deadline.toNumber) {
      deadlineNumber = deadline.toNumber();
    } else {
      deadlineNumber = deadline;
    }

    const now = Math.floor(Date.now() / 1000);
    const diffDays = Math.ceil((deadlineNumber - now) / (60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "inprogress":
      case "in_progress":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "completed":
        return "bg-gray-500/20 text-gray-500 border-gray-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      case "disputed":
        return "bg-orange-500/20 text-orange-500 border-orange-500/30";
      default:
        return "bg-glass-secondary text-foreground-muted";
    }
  };

  // Get number of proposals
  const getProposalCount = (bidders: any[] | undefined): number => {
    if (!bidders || !Array.isArray(bidders)) return 0;
    return bidders.length;
  };

  // Format reputation from BN to number (assuming 10000 = 100.00)
  const formatReputation = (reputation: BN): number => {
    return reputation.toNumber();
  };

  // Get enhanced client info with proper BN extraction
  const getClientInfo = (): ClientInfo => {
    // If we have actual user data, use it
    if (clientData) {
      const totalJobs = clientData.activeJobs.toNumber() + 
                       clientData.cancelledJobs.toNumber() + 
                       clientData.completedJobs.toNumber() + 
                       clientData.pendingJobs.toNumber();
      console.log(clientData.activeJobs.toNumber(), "number")
      const successRate = totalJobs > 0 ? 
        (clientData.completedJobs.toNumber() / totalJobs) * 100 : 0;

      return {
        name: clientData.name || "Anonymous Client",
        rating: formatReputation(clientData.reputation),
        verified: clientData.reputation.toNumber() >= 50, // Example threshold
        jobsPosted: totalJobs,
        hireRate: successRate,
        location: "Global",
        successRate: successRate,
        reputation: formatReputation(clientData.reputation),
      };
    }

    // Fallback when clientData is not available yet
    return {
      name: "Loading...",
      rating: 0,
      verified: false,
      jobsPosted: 0,
      hireRate: 0,
      location: "Global"
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading job details...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error || "Job not found"}</div>
          <Button onClick={() => navigate.push('/jobs')}>
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  const jobStatus = formatJobStatus(job.account.status);
  const postedDate = formatRelativeTime(job.account.createdAt);
  const deadline = formatDeadline(job.account.deadline);
  const proposalsCount = getProposalCount(job.account.bidders);
  const clientInfo = getClientInfo();
  const jobSkills = job.account.skills || [];
  const jobCategory = job.account.category || "other";

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-neon-cyan/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate.push(`/manage-jobs`)}
            className="gap-2 hover:text-neon-cyan"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
                    {job.account.title}
                  </h1>
                  <div className="flex items-center gap-3 text-foreground-muted">
                    <span>Posted {postedDate}</span>
                    <span>•</span>
                    <Badge className={getStatusColor(jobStatus)}>
                      {jobStatus}
                    </Badge>
                    {jobCategory !== "other" && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="bg-neon-purple/20 text-neon-purple border-neon-purple/30">
                          {jobCategory}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="glass-panel p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-neon-gold mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm text-foreground-muted">Budget</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    {formatBudget(job.account.budget)}
                  </p>
                </div>

                <div className="glass-panel p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-neon-cyan mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm text-foreground-muted">Deadline</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{deadline}</p>
                </div>

                <div className="glass-panel p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-neon-purple mb-1">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm text-foreground-muted">Proposals</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{proposalsCount}</p>
                </div>

                <div className="glass-panel p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-warning mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm text-foreground-muted">Job ID</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">#{job.account.jobId.toString()}</p>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">Job Description</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground-muted whitespace-pre-line leading-relaxed">
                  {job.account.description}
                </p>
              </div>
            </motion.div>

            {/* Skills Required */}
            {jobSkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8"
              >
                <h2 className="text-2xl font-bold text-foreground mb-4">Skills & Expertise</h2>
                <div className="flex flex-wrap gap-3">
                  {jobSkills.map((skill) => (
                    <Badge
                      key={skill}
                      className="px-4 py-2 text-sm bg-gradient-primary text-white border-0"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Job Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">Job Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-neon-cyan" />
                    <div>
                      <p className="text-sm text-foreground-muted">Client</p>
                      <p className="font-medium text-foreground">
                        {clientInfo.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-neon-purple" />
                    <div>
                      <p className="text-sm text-foreground-muted">Created</p>
                      <p className="font-medium text-foreground">{formatDate(job.account.createdAt)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-neon-gold" />
                    <div>
                      <p className="text-sm text-foreground-muted">Last Updated</p>
                      <p className="font-medium text-foreground">
                        {formatRelativeTime(job.account.updatedAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-foreground-muted">Authority</p>
                      <p className="font-medium text-foreground">
                        {job.account.authority.toString().slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 sticky top-6"
            >
              {userRole === "freelancer" ? (
                <>
                  <h3 className="text-xl font-bold text-foreground mb-4">Ready to Apply?</h3>
                  <Button
                    variant="neon"
                    size="lg"
                    className="w-full mb-3"
                    onClick={() => navigate.push(`/jobs/${jobId}/apply`)}
                  >
                    Submit Proposal
                  </Button>
                  <p className="text-sm text-foreground-muted text-center">
                    {jobStatus === "Open" ? "Accepting proposals" : "Not accepting proposals"}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-foreground mb-4">Manage Job</h3>
                  <div className="space-y-3">
                    <Button 
                      variant="neon" 
                      size="lg" 
                      className="w-full gap-2"
                      onClick={() => navigate.push(`/manage-jobs?selected=${job.publicKey.toString()}`)}
                    >
                      <Users className="h-4 w-4" />
                      View Proposals ({proposalsCount})
                    </Button>
                    <Button variant="glass" size="lg" className="w-full gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Job
                    </Button>
                    {jobStatus === "Open" && (
                      <Button variant="glass" size="lg" className="w-full gap-2 text-destructive hover:text-destructive">
                        <XCircle className="h-4 w-4" />
                        Close Job
                      </Button>
                    )}
                  </div>
                </>
              )}
            </motion.div>

            {/* Client Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">About the Client</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-foreground">{clientInfo.name}</p>
                    {clientInfo.verified && (
                      <Badge variant="outline" className="text-xs border-green-500/30 text-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-neon-gold">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-semibold">{clientInfo.rating.toFixed(1)}</span>
                    <span className="text-foreground-muted text-sm ml-1">rating</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-glass-border">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted">Jobs Posted</span>
                    <span className="font-semibold text-foreground">{clientInfo.jobsPosted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted">Success Rate</span>
                    <span className="font-semibold text-foreground  text-green-500">{clientInfo.successRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted">Location</span>
                    <span className="font-semibold text-foreground">{clientInfo.location}</span>
                  </div>
                </div>

                {/* Client Address */}
                <div className="pt-4 border-t border-glass-border">
                  <p className="text-sm text-foreground-muted mb-2">Client Address:</p>
                  <code className="text-xs bg-glass-primary p-2 rounded break-all">
                    {job.account.client.toString()}
                  </code>
                </div>
              </div>
            </motion.div>

            {/* Job Public Key */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold text-foreground mb-3">Job Address</h3>
              <code className="text-xs bg-glass-primary p-3 rounded break-all w-full block">
                {job.publicKey.toString()}
              </code>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;