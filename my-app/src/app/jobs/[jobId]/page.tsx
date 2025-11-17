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
  User,
  ExternalLink,
  AlertTriangle,
  ThumbsUp,
  Trash2
} from "lucide-react";
import { Badge } from "@/app/(module)/ui/badge";
import { Button } from "@/app/(module)/ui/button";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useUser } from "@/(providers)/userProvider";
import { fetchJobByPublicKey } from "@/(anchor)/actions/fetchjob";
import BN from "bn.js";
import { findUserPDA, getProgram } from "@/(anchor)/setup";
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
    bidders?: any[];
    workSubmitted: boolean;
    workApproved: boolean;
    workSubmissionUrl: string;
    workSubmissionDescription: string;
    workSubmittedAt: any;
    workApprovedAt: any;
    escrow: PublicKey;
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
  const { wallet , publicKey } = useWallet();
  const { fetchUserByAddress } = useUser();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState<UserData | null>(null);
  const [freelancerData, setFreelancerData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showAcceptWorkModal, setShowAcceptWorkModal] = useState(false);
  const [revisionDescription, setRevisionDescription] = useState("");
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [rating, setRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
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
          
          try {
            const clientAddress = jobData.account.client.toBase58();
            const clientUserData = await fetchUserByAddress(clientAddress);
            setClientData(clientUserData);

            if (jobData.account.freelancer) {
              const freelancerAddress = jobData.account.freelancer.toBase58();
              const freelancerUserData = await fetchUserByAddress(freelancerAddress);
              setFreelancerData(freelancerUserData);
            }
          } catch (clientError) {
            console.error("Failed to fetch user data:", clientError);
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

  const formatJobStatus = (status: any) => {
    if (!status) return "Unknown";
    const statusKey = Object.keys(status)[0];
    return statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
  };

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

  const getProposalCount = (bidders: any[] | undefined): number => {
    if (!bidders || !Array.isArray(bidders)) return 0;
    return bidders.length;
  };

  const formatReputation = (reputation: BN): number => {
    return reputation.toNumber();
  };

  const getClientInfo = (): ClientInfo => {
    if (clientData) {
      const totalJobs = clientData.activeJobs.toNumber() + 
                       clientData.cancelledJobs.toNumber() + 
                       clientData.completedJobs.toNumber() + 
                       clientData.pendingJobs.toNumber();
      const successRate = totalJobs > 0 ? 
        (clientData.completedJobs.toNumber() / totalJobs) * 100 : 0;

      return {
        name: clientData.name || "Anonymous Client",
        rating: formatReputation(clientData.reputation),
        verified: clientData.reputation.toNumber() >= 50,
        jobsPosted: totalJobs,
        hireRate: successRate,
        location: "Global",
        successRate: successRate,
        reputation: formatReputation(clientData.reputation),
      };
    }

    return {
      name: "Loading...",
      rating: 0,
      verified: false,
      jobsPosted: 0,
      hireRate: 0,
      location: "Global"
    };
  };
 
  const getFreelancerInfo = () => {
    if (freelancerData) {
      const totalJobs = freelancerData.activeJobs.toNumber() + 
                       freelancerData.cancelledJobs.toNumber() + 
                       freelancerData.completedJobs.toNumber() + 
                       freelancerData.pendingJobs.toNumber();
      const successRate = totalJobs > 0 ? 
        (freelancerData.completedJobs.toNumber() / totalJobs) * 100 : 0;

      return {
        name: freelancerData.name || "Anonymous Freelancer",
        rating: formatReputation(freelancerData.reputation),
        verified: freelancerData.reputation.toNumber() >= 50,
        jobsCompleted: freelancerData.completedJobs.toNumber(),
        successRate: successRate,
        location: "Global",
        totalEarnings: freelancerData.totalEarnings.toNumber() / 1000000000,
        activeJobs: freelancerData.activeJobs.toNumber(),
      };
    }

    return {
      name: "Not assigned",
      rating: 0,
      verified: false,
      jobsCompleted: 0,
      successRate: 0,
      location: "Global",
      totalEarnings: 0,
      activeJobs: 0,
    };
  };

  const isJobInProgress = job?.account.status?.inProgress !== undefined;
  const isWorkSubmitted = job?.account.workSubmitted || false;
  const isWorkApproved = job?.account.workApproved || false;
  const isJobCompleted = job?.account.status?.completed !== undefined;

  const handleAcceptWork = () => {
    setShowWorkModal(false);
    setShowAcceptWorkModal(true);
  };

  const handleSubmitRating = async () => {
    if (!job || !wallet?.adapter?.publicKey || !publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    if (rating === 0) {
      alert("Please select a rating before submitting");
      return;
    }

    try {
      setIsSubmittingRating(true);
      const jobAccount = new PublicKey(jobId);
      const program = getProgram(wallet.adapter);
      
      const jobData = await program.account.job.fetch(jobAccount);
      const numericJobId = jobData.jobId;
      const freelancerPubkey = jobData.freelancer;
      const [freelancerUserPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("user"), freelancerPubkey.toBuffer()],
            program.programId
          );
      const [clientUserPDA] = findUserPDA(wallet.adapter.publicKey)
      // Demo blockchain function - accept work and submit rating
      const tx = await program.methods
        .acceptWork(numericJobId, rating)
        .accounts({
          job: jobAccount,
          clientUser: clientUserPDA,
          freelancerUser: freelancerUserPDA,
          client: publicKey,
        })
        .rpc();
      
      console.log("Work accepted and rated successfully:", tx);
      console.log("Rating submitted:", rating);
      
      // Update local state
      setJob({
        ...job,
        account: {
          ...job.account,
          workApproved: true,
          status: { completed: {} }
        }
      });
      
      toast.success("Work accepted and rated successfully!");
      setShowAcceptWorkModal(false);
      setRating(0);
    } catch (error) {
      console.error("Failed to accept work and submit rating:", error);
      toast.error("Failed to accept work. Please try again.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!job || !wallet?.adapter?.publicKey || !publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      const jobAccount = new PublicKey(jobId);
      const program = getProgram(wallet.adapter);
      
      const jobData = await program.account.job.fetch(jobAccount);
      const numericJobId = jobData.jobId;
      
      // Demo blockchain function - delete job
      const tx = await program.methods
        .deleteJob(numericJobId)
        .accounts({
          job: jobAccount,
          authority: publicKey,
        })
        .rpc();
      
      console.log("Job deleted successfully:", tx);
      
      toast.success("Job deleted successfully!");
      navigate.push('/manage-jobs');
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast.error("Failed to delete job. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDispute = () => {
    console.log("Opening dispute for job:", job?.publicKey.toString());
    // TODO: Implement dispute logic
  };

  const handleRequestRevision = async () => {
    if (!job || !wallet?.adapter?.publicKey) return;
    
    if (!revisionDescription.trim()) {
      alert("Please provide a revision description");
      return;
    }

    if (revisionDescription.length > 500) {
      alert("Revision description must be 500 characters or less");
      return;
    }
    if (!wallet?.adapter?.publicKey || !publicKey) {
      toast.error("Wallet not connected");
      return;
    }
    try {
      setIsSubmittingRevision(true);
      const jobAccount = new PublicKey(jobId);
      const program = getProgram(wallet.adapter);
      
      const jobData = await program.account.job.fetch(jobAccount);
      const numericJobId = jobData.jobId;
      const tx = await program.methods
        .requestRevision(numericJobId, revisionDescription)
        .accounts({
          job: jobAccount,
          client: publicKey,
        })
        .rpc();
      
      console.log("Requesting revision for job:", tx);
      console.log("Revision description:", revisionDescription);
      
      // After successful submission:
      setShowRevisionModal(false);
      setRevisionDescription("");
      alert("Revision request submitted successfully!");
    } catch (error) {
      console.error("Failed to request revision:", error);
      alert("Failed to submit revision request. Please try again.");
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  const handleViewWork = () => {
    if (job?.account.workSubmissionUrl) {
      window.open(job.account.workSubmissionUrl, '_blank');
    }
  };

  const formatWorkSubmissionDate = () => {
    if (!job?.account.workSubmittedAt) return "Not submitted";
    return formatRelativeTime(job.account.workSubmittedAt);
  };

  const formatWorkApprovalDate = () => {
    if (!job?.account.workApprovedAt) return "Not approved";
    return formatRelativeTime(job.account.workApprovedAt);
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
  const isAssignedFreelancer = job?.account.freelancer && publicKey 
    ? job.account.freelancer.equals(publicKey)
    : false;
  const jobStatus = formatJobStatus(job.account.status);
  const postedDate = formatRelativeTime(job.account.createdAt);
  const deadline = formatDeadline(job.account.deadline);
  const proposalsCount = getProposalCount(job.account.bidders);
  const clientInfo = getClientInfo();
  const freelancerInfo = getFreelancerInfo();
  const jobSkills = job.account.skills || [];
  const jobCategory = job.account.category || "other";
  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-neon-cyan/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          {userRole == 'client' ? (
            <Button
              variant="ghost"
              onClick={() => navigate.push(`/manage-jobs`)}
              className="gap-2 hover:text-neon-cyan"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => navigate.push(`/jobs`)}
              className="gap-2 hover:text-neon-cyan"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Jobs
            </Button>
          )}
          
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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
                  
                  {isJobInProgress && job.account.freelancer && (
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-neon-purple" />
                      <div>
                        <p className="text-sm text-foreground-muted">Assigned Freelancer</p>
                        <p className="font-medium text-foreground">
                          {freelancerInfo.name}
                        </p>
                      </div>
                    </div>
                  )}
                  
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

                  {isJobInProgress && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-foreground-muted">Escrow Address</p>
                        <p className="font-medium text-foreground text-xs">
                          {job.account.escrow.toString().slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 sticky top-6"
            >
              {userRole === "freelancer" ? (
                <>
                  <h3 className="text-xl font-bold text-foreground mb-4">Job Actions</h3>
                  
                  {jobStatus === "Open" ? (
                    // Job is open - any freelancer can apply
                    <>
                      <Button
                        variant="neon"
                        size="lg"
                        className="w-full mb-3"
                        onClick={() => navigate.push(`/jobs/${jobId}/apply`)}
                      >
                        Submit Proposal
                      </Button>
                      <p className="text-sm text-foreground-muted text-center text-green-500">
                        Accepting proposals from all freelancers
                      </p>
                    </>
                  ) : jobStatus === "InProgress" && isAssignedFreelancer ? (
                    // Job in progress and this freelancer is assigned - can submit work or raise dispute
                    <>
                      <Button
                        variant="default"
                        size="lg"
                        className="w-full mb-3"
                        onClick={() => navigate.push(`/submit-work/${jobId}`)}
                      >
                        Submit Work
                      </Button>
                      <Button
                        variant="destructive"
                        size="lg"
                        className="w-full mb-3"
                        onClick={() => navigate.push(`/dispute-create/${jobId}/?role=${userRole}`)}
                      >
                        Raise Dispute
                      </Button>
                      <p className="text-sm text-foreground-muted text-center text-yellow-500">
                        You are assigned to this job
                      </p>
                    </>
                  ) : jobStatus === "Disputed" && isAssignedFreelancer ? (
                    // Job is disputed and this freelancer is involved - can vote or view dispute
                    <>
                      <Button
                        variant="destructive"
                        size="lg"
                        className="w-full mb-3"
                        onClick={() => navigate.push(`/dispute/${jobId}`)}
                      >
                        View Dispute
                      </Button>
                      <p className="text-sm text-foreground-muted text-center text-orange-500">
                        This job has an active dispute
                      </p>
                    </>
                  ) : (
                    // Job is not available for this freelancer
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full mb-3"
                        disabled
                      >
                        {jobStatus === "InProgress" ? "Job In Progress" : "Job Not Available"}
                      </Button>
                      <p className="text-sm text-foreground-muted text-center text-red-500">
                        {jobStatus === "InProgress" 
                          ? "Already assigned to another freelancer" 
                          : jobStatus === "Completed" 
                          ? "Job completed" 
                          : "Not accepting proposals"}
                      </p>
                    </>
                  )}
                </>
              ) : (
                // Client section - ONLY ONE CLIENT SECTION
                <>
                  <h3 className="text-xl font-bold text-foreground mb-4">Manage Job</h3>
                  <div className="space-y-3">
                    {isJobCompleted && job.account.escrow.equals(PublicKey.default) ? (
                      <>
                        <Button 
                          variant="destructive" 
                          size="lg" 
                          className="w-full gap-2"
                          onClick={handleDeleteJob}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                          {isDeleting ? "Deleting..." : "Delete Job"}
                        </Button>
                        <Badge className="w-full justify-center bg-green-500/20 text-green-500 border-green-500/30">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Job Completed
                        </Badge>
                      </>
                    ) : isJobInProgress ? (
                      <>
                        {isWorkSubmitted ? (
                          <>
                            <Button 
                              variant="neon" 
                              size="lg" 
                              className="w-full gap-2"
                              onClick={() => setShowWorkModal(true)}
                            >
                              <FileText className="h-4 w-4" />
                              Review Submitted Work
                            </Button>
                            {isWorkApproved && (
                              <Badge className="w-full justify-center bg-green-500/20 text-green-500 border-green-500/30">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Work Accepted
                              </Badge>
                            )}
                          </>
                        ) : (
                          <div className="text-center p-4 border border-dashed border-glass-border rounded-lg">
                            <Clock className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
                            <p className="text-foreground-muted text-sm">
                              Waiting for freelancer to submit work
                            </p>
                          </div>
                        )}
                        <Button 
                          variant="glass" 
                          size="lg" 
                          className="w-full gap-2 text-red-500 hover:text-red-400"
                          onClick={handleDispute}
                        >
                          <AlertTriangle className="h-4 w-4" />
                          Raise Dispute
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="neon" 
                          size="lg" 
                          className="w-full gap-2"
                          onClick={() => navigate.push(`/manage-jobs?selected=${job.publicKey.toString()}`)}
                        >
                          <Users className="h-4 w-4" />
                          View Proposals ({proposalsCount})
                        </Button>
                        {jobStatus === "Open" && (
                          <Button variant="glass" size="lg" className="w-full gap-2 text-destructive hover:text-destructive">
                            <XCircle className="h-4 w-4" />
                            Close Job
                          </Button>
                        )}
                        {jobStatus === "Disputed" ? (
                          <Button variant="glass" size="lg" className="w-full gap-2 text-destructive hover:text-destructive"
                            onClick={() => navigate.push(`/disputes/${job.publicKey.toString()}`)}
                          >
                            <CheckCircle className="h-4 w-4" />
                            View Dispute
                          </Button>
                        ): (
                          <Button variant="glass" size="lg" className="w-full gap-2">
                            <Edit className="h-4 w-4" />
                            Edit Job
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </motion.div>

            {isJobInProgress && job.account.freelancer && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-bold text-foreground mb-4">Assigned Freelancer</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-foreground">{freelancerInfo.name}</p>
                      {freelancerInfo.verified && (
                        <Badge variant="outline" className="text-xs border-green-500/30 text-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-neon-gold">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-semibold">{freelancerInfo.rating.toFixed(1)}</span>
                      <span className="text-foreground-muted text-sm ml-1">rating</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-glass-border">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground-muted">Jobs Completed</span>
                      <span className="font-semibold text-foreground">{freelancerInfo.jobsCompleted}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground-muted">Success Rate</span>
                      <span className="font-semibold text-foreground text-green-500">{freelancerInfo.successRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground-muted">Active Jobs</span>
                      <span className="font-semibold text-foreground">{freelancerInfo.activeJobs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground-muted">Total Earnings</span>
                      <span className="font-semibold text-foreground">{freelancerInfo.totalEarnings.toFixed(2)} SOL</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-glass-border">
                    <p className="text-sm text-foreground-muted mb-2">Freelancer Address:</p>
                    <code className="text-xs bg-glass-primary p-2 rounded break-all">
                      {job.account.freelancer?.toString()}
                    </code>
                  </div>
                </div>
              </motion.div>
            )}

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

                <div className="pt-4 border-t border-glass-border">
                  <p className="text-sm text-foreground-muted mb-2">Client Address:</p>
                  <code className="text-xs bg-glass-primary p-2 rounded break-all">
                    {job.account.client.toString()}
                  </code>
                </div>
              </div>
            </motion.div>

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

      {/* Work Submission Modal */}
      {showWorkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Submitted Work</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWorkModal(false)}
                className="hover:text-neon-cyan"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Work Description</h4>
                <p className="text-foreground-muted bg-glass-primary p-3 rounded">
                  {job.account.workSubmissionDescription || "No description provided"}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Work URL</h4>
                {job.account.workSubmissionUrl ? (
                  <Button
                    variant="glass"
                    className="w-full justify-between"
                    onClick={handleViewWork}
                  >
                    <span className="truncate">{job.account.workSubmissionUrl}</span>
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <p className="text-foreground-muted bg-glass-primary p-3 rounded">No URL provided</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Submitted</h4>
                  <p className="text-foreground-muted">{formatWorkSubmissionDate()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Status</h4>
                  <Badge className={isWorkApproved ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"}>
                    {isWorkApproved ? "Approved" : "Pending Review"}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                {!isWorkApproved && (
                  <Button
                    variant="neon"
                    className="flex-1 gap-2"
                    onClick={handleAcceptWork}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Accept Work
                  </Button>
                )}
                <Button
                  variant="glass"
                  className="flex-1 gap-2 text-orange-500 hover:text-orange-400"
                  onClick={() => {
                    setShowWorkModal(false);
                    setShowRevisionModal(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Request Revision
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Accept Work with Rating Modal */}
      {showAcceptWorkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-lg w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Accept Work & Rate Freelancer</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAcceptWorkModal(false);
                  setRating(0);
                }}
                className="hover:text-neon-cyan"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3">Rate the Freelancer</h4>
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-3xl focus:outline-none transition-transform hover:scale-110"
                    >
                      {star <= rating ? (
                        <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <Star className="h-8 w-8 text-gray-400 hover:text-yellow-500" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-center text-foreground-muted text-sm">
                  {rating === 0 ? "Select a rating" : `You rated ${rating} star${rating > 1 ? 's' : ''}`}
                </p>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-foreground-muted">
                    <p className="font-medium text-foreground mb-1">Accepting this work will:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Release payment to the freelancer</li>
                      <li>Mark the job as completed</li>
                      <li>Submit your rating to the freelancer's profile</li>
                      <li>Update both parties' reputation scores</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="glass"
                  className="flex-1"
                  onClick={() => {
                    setShowAcceptWorkModal(false);
                    setRating(0);
                  }}
                  disabled={isSubmittingRating}
                >
                  Cancel
                </Button>
                <Button
                  variant="neon"
                  className="flex-1 gap-2"
                  onClick={handleSubmitRating}
                  disabled={isSubmittingRating || rating === 0}
                >
                  {isSubmittingRating ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="h-4 w-4" />
                      Accept & Rate
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Revision Request Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-lg w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Request Work Revision</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowRevisionModal(false);
                  setRevisionDescription("");
                }}
                className="hover:text-neon-cyan"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Revision Description *
                </label>
                <textarea
                  value={revisionDescription}
                  onChange={(e) => setRevisionDescription(e.target.value)}
                  placeholder="Describe what needs to be revised or improved..."
                  className="w-full h-32 bg-glass-primary border border-glass-border rounded-lg p-3 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-foreground-muted">
                    Be specific about what needs to be changed
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {revisionDescription.length}/500
                  </p>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-foreground-muted">
                    <p className="font-medium text-foreground mb-1">Before requesting a revision:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Clearly describe what needs to be changed</li>
                      <li>The freelancer will be notified immediately</li>
                      <li>This does not affect escrow or payment</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="glass"
                  className="flex-1"
                  onClick={() => {
                    setShowRevisionModal(false);
                    setRevisionDescription("");
                  }}
                  disabled={isSubmittingRevision}
                >
                  Cancel
                </Button>
                <Button
                  variant="neon"
                  className="flex-1 gap-2"
                  onClick={handleRequestRevision}
                  disabled={isSubmittingRevision || !revisionDescription.trim()}
                >
                  {isSubmittingRevision ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      Request Revision
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

export default JobDetailPage;