"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Edit,
  Eye,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  XOctagon,
  Star,
  Filter,
  Plus,
  ArrowUpDown,
  X,
  Lock,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/app/(module)/ui/badge";
import { Button } from "@/app/(module)/ui/button";
import { Card } from "@/app/(module)/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/(module)/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/(providers)/userProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchJobs } from "@/(anchor)/actions/fetchjob";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { ResumeFree } from "./resumeFree";
import { toast } from "@/app/hooks/use-toast";
import BN from "bn.js";
import { findEscrowPDA, findJobPDA, findUserPDA, getProgram } from "@/(anchor)/setup";

const ManageJobsPage = () => {
  const navigate = useRouter();
  const user = useUser();
  const role = user?.isFreelancer === true ? "freelancer" : "client";
  const searchParams = useSearchParams();
  const userRole = searchParams.get("role") || "client";
  const { wallet } = useWallet();
  const [jobs, setJobs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [bidSort, setBidSort] = useState<"lowToHigh" | "highToLow" | "newest" | "oldest">("newest");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      if (!wallet?.adapter?.publicKey) {
        setJobs([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log(wallet.adapter, "adapter");
        
        const data = await fetchJobs(wallet.adapter, {
          clientFilter: wallet.adapter.publicKey,
          statusFilter: statusFilter === 'all' ? 'all' : statusFilter
        });
        
        setJobs(data);
        // Auto-select first job if none selected
        if (data.length > 0 && !selectedJob) {
          setSelectedJob(data[0].publicKey.toString());
        }
      } catch (err) {
        console.error('Failed to load jobs:', err);
        setError('Failed to load jobs. Please try again.');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadJobs();
  }, [wallet?.adapter?.publicKey, statusFilter]);

  // Get selected job data
  const selectedJobData = jobs.find(job => job.publicKey.toString() === selectedJob);
  
  // Get and sort bidders
  const realBidders = selectedJobData?.account.bidders || [];
  
  const sortedBidders = [...realBidders].sort((a, b) => {
    switch (bidSort) {
      case "lowToHigh":
        return a.proposedAmount.toNumber() - b.proposedAmount.toNumber();
      case "highToLow":
        return b.proposedAmount.toNumber() - a.proposedAmount.toNumber();
      case "newest":
        return b.timestamp.toNumber() - a.timestamp.toNumber();
      case "oldest":
        return a.timestamp.toNumber() - b.timestamp.toNumber();
      default:
        return 0;
    }
  });

  const handleAssignClick = (bid: any) => {
    setSelectedBid(bid);
    setAssignDialogOpen(true);
  };

  const handleAssignJob = async () => {
    if (!selectedBid || !selectedJobData) return;
    if (!wallet?.adapter?.publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }
  
    setIsAssigning(true);
  
    try {
      const program = getProgram(wallet.adapter);
      const clientPublicKey = wallet.adapter.publicKey;
      
      // Get the job ID and derive PDAs
      const jobId = selectedJobData.account.jobId;
      const jobIdBN = new BN(jobId);
      const [jobPDA] = findJobPDA(jobIdBN);
      const [clientUserPDA] = findUserPDA(clientPublicKey);
      const [freelancerUserPDA] = findUserPDA(selectedBid.freelancer);
      const [escrowPDA] = findEscrowPDA(jobPDA);
  
      console.log("🔍 Assignment Details:");
      console.log("Job ID:", jobId.toString());
      console.log("Job PDA:", jobPDA.toString());
      console.log("Client PubKey:", clientPublicKey.toString());
      console.log("Client User PDA:", clientUserPDA.toString());
      console.log("Freelancer PubKey:", selectedBid.freelancer.toString());
      console.log("Freelancer User PDA:", freelancerUserPDA.toString());
      console.log("Escrow PDA:", escrowPDA.toString());
      console.log("Bid Amount:", selectedBid.proposedAmount.toString());
      const bidAmountBN = new BN(selectedBid.proposedAmount.toString());
  
  
      // Send transaction
      const tx = await program.methods
        .assignJob(
          jobIdBN,
          selectedBid.freelancer,
          bidAmountBN
        )
        .accounts({
          job: jobPDA,
          client: clientPublicKey,
          clientUser: clientUserPDA,
          freelancerUser: freelancerUserPDA,
          escrow: escrowPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
  
      console.log("Job assigned successfully! Transaction:", tx);
  
      toast({
        title: "Job Assigned Successfully!",
        description: `Job assigned to ${selectedBid.freelancer.toString().slice(0, 8)}... Transaction: ${tx.slice(0, 8)}...`,
        variant: "default",
      });
  
      setAssignDialogOpen(false);
      setSelectedBid(null);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
  
    } catch (error: any) {
      console.error("❌ FULL ERROR:", error);
      console.error("❌ Error logs:", error.logs);
  
      let errorMessage = "Failed to assign job";
  
      // Parse specific errors
      if (error.message?.includes("BidNotFound")) {
        errorMessage = "The selected bid was not found";
      } else if (error.message?.includes("JobNotOpen")) {
        errorMessage = "This job is no longer open for assignment";
      } else if (error.message?.includes("NotJobClient")) {
        errorMessage = "You are not the owner of this job";
      } else if (error.message?.includes("InsufficientBalance")) {
        errorMessage = "Insufficient balance to escrow the bid amount";
      } else if (error.message?.includes("0x1")) {
        errorMessage = "Transaction failed - please check your balance";
      } else if (error.message) {
        errorMessage = error.message;
      }
  
      toast({
        title: "Assignment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
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

  const formatJobStatus = (status: string) => {
    const statusKey = Object.keys(status)[0];
    return statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
  };

  const formatBudget = (budget: any) => {
    if (typeof budget === 'object' && budget.toNumber) {
      const budgetlamp = budget.toNumber() / 1000000000;
      return `${budgetlamp} SOL`;
    }
    const budgetlamp = Number(budget) / 1000000000;
    return `${budgetlamp} SOL`;
  };

  const formatDate = (timestamp: any) => {
    if (typeof timestamp === 'object' && timestamp.toNumber) {
      return new Date(timestamp.toNumber() * 1000).toLocaleDateString();
    }
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-neon-gold/5 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Post New Job Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">
              <span className="text-neon bg-gradient-gold bg-clip-text text-transparent">
                Manage Jobs
              </span>
            </h1>
            <p className="text-foreground-muted text-lg">
              Track your posted jobs and manage proposals
            </p>
          </div>
          
          <Button
            variant="neon"
            className="flex items-center gap-2"
            onClick={() => navigate.push(`/manage-jobs/new`)}
          >
            <Plus className="h-4 w-4" />
            Post New Job
          </Button>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="glass-panel p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-foreground-muted" />
                <span className="text-sm font-medium text-foreground">Filter by Status:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["all", "open", "inProgress", "completed", "cancelled", "disputed"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "neon" : "glass"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === "all" ? "All Jobs" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Jobs List */}
          <div className="lg:col-span-1 space-y-4">
            {jobs.length === 0 ? (
              <Card className="glass-card p-6 text-center">
                <Users className="h-12 w-12 text-foreground-muted mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Jobs Found</h3>
                <p className="text-foreground-muted text-sm mb-4">
                  You haven't posted any jobs yet or no jobs match your current filter.
                </p>
                <Button
                  variant="neon"
                  onClick={() => navigate.push(`/manage-jobs/new`)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Button>
              </Card>
            ) : (
              jobs.map((job, index) => (
                <motion.div
                  key={job.publicKey.toString()}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`glass-card p-6 cursor-pointer hover-lift transition-all ${
                    selectedJob === job.publicKey.toString() 
                      ? "border-primary shadow-neon" 
                      : ""
                  }`}
                  onClick={() => setSelectedJob(job.publicKey.toString())}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-foreground line-clamp-2">
                      {job.account.title}
                    </h3>
                    <Badge className={getStatusColor(formatJobStatus(job.account.status))}>
                      {formatJobStatus(job.account.status)}
                    </Badge>
                  </div>

                  <p className="text-sm text-foreground-muted mb-3 line-clamp-2">
                    {job.account.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground-muted">Budget</span>
                      <span className="font-semibold text-neon-gold">
                        {formatBudget(job.account.budget)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground-muted">Proposals</span>
                      <span className="font-semibold text-foreground">
                        {job.account.bidders.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground-muted">Client</span>
                      <span className="text-foreground-muted text-xs">
                        {job.account.client.toString().slice(0, 8)}...
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="glass"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate.push(`/jobs/${job.publicKey.toString()}?role=${userRole}`);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add edit functionality here
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Proposals Panel */}
          <div className="lg:col-span-2">
            {selectedJob ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Card className="glass-card p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        Proposals Received
                      </h2>
                      <p className="text-foreground-muted">
                        {realBidders.length} proposal{realBidders.length !== 1 ? 's' : ''} for "{selectedJobData?.account.title}"
                      </p>
                    </div>
                    
                    {/* Bid Sorting Filter */}
                    {realBidders.length > 0 && (
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-foreground-muted" />
                        <select 
                          value={bidSort}
                          onChange={(e) => setBidSort(e.target.value as any)}
                          className="glass-panel px-3 py-2 rounded-lg text-sm border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="lowToHigh">Bid: Low to High</option>
                          <option value="highToLow">Bid: High to Low</option>
                        </select>
                      </div>
                    )}
                  </div>
                </Card>

                {sortedBidders.length > 0 ? (
                  sortedBidders.map((bid, index) => (
                    <motion.div
                      key={bid.freelancer.toString() + index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="glass-card p-6"
                    >
                      {/* Freelancer Info */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl">
                          {bid.freelancer.toString().slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-foreground">
                              {bid.freelancer.toString().slice(0, 8)}...
                            </h3>
                            <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">
                              Active Bidder
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-foreground-muted">
                              Wallet: {bid.freelancer.toString().slice(0, 16)}...
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bid Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="glass-panel p-4 rounded-lg">
                          <div className="flex items-center gap-2 text-neon-gold mb-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm text-foreground-muted">
                              Bid Amount
                            </span>
                          </div>
                          <p className="text-xl font-bold text-foreground">
                            {formatBudget(bid.proposedAmount)}
                          </p>
                          <p className="text-xs text-foreground-muted mt-1">
                            {((bid.proposedAmount.toNumber() / selectedJobData.account.budget.toNumber()) * 100).toFixed(1)}% of budget
                          </p>
                        </div>
                        <div className="glass-panel p-4 rounded-lg">
                          <div className="flex items-center gap-2 text-neon-cyan mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm text-foreground-muted">
                              Submitted
                            </span>
                          </div>
                          <p className="text-sm font-bold text-foreground">
                            {formatDate(bid.timestamp)}
                          </p>
                          <p className="text-xs text-foreground-muted mt-1">
                            {new Date(bid.timestamp.toNumber() * 1000).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="">
                        <ResumeFree address={bid.freelancer}/>
                      </div>
                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button 
                          variant="neon" 
                          className="flex-1 gap-2"
                          onClick={() => handleAssignClick(bid)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Hire This Freelancer
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <Card className="glass-card p-12 text-center">
                    <Users className="h-16 w-16 text-foreground-muted mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No Proposals Yet
                    </h3>
                    <p className="text-foreground-muted mb-6">
                      This job hasn't received any proposals yet. Share the job link to attract freelancers.
                    </p>
                    <Button variant="neon">
                      Share Job Link
                    </Button>
                  </Card>
                )}
              </motion.div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Users className="h-16 w-16 text-foreground-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {jobs.length > 0 ? "Select a job to view proposals" : "No jobs available"}
                </h3>
                <p className="text-foreground-muted">
                  {jobs.length > 0 
                    ? "Choose a job from the list to manage its proposals" 
                    : "Start by posting your first job to receive proposals"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Job Dialog - Compact and Responsive */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="glass-card max-w-md sm:max-w-lg border-0 p-0 overflow-hidden">
          <div className="relative">
            {/* Header */}
            <DialogHeader className="p-4 sm:p-6 border-b border-glass-border">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                  Assign Job
                </DialogTitle>
                
              </div>
              <DialogDescription className="text-foreground-muted mt-1 text-sm">
                Confirm job assignment to freelancer
              </DialogDescription>
            </DialogHeader>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Assignment Summary */}
              <div className="glass-panel p-3 sm:p-4 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Assignment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground-muted">Freelancer</span>
                    <span className="font-semibold text-xs sm:text-sm">
                      {selectedBid?.freelancer.toString().slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground-muted">Bid Amount</span>
                    <span className="font-semibold text-neon-gold text-sm">
                      {selectedBid && formatBudget(selectedBid.proposedAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground-muted">Job</span>
                    <span className="font-semibold text-right text-xs sm:text-sm max-w-[150px] truncate">
                      {selectedJobData?.account.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Escrow Process */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
                  <Lock className="h-4 w-4 text-neon-cyan" />
                  Escrow Process
                </h4>
                
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-neon-cyan flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Funds Locked</p>
                      <p className="text-foreground-muted">
                        {selectedBid && formatBudget(selectedBid.proposedAmount)} secured in escrow
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-glass-border flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-foreground-muted text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground-muted">Work Progress</p>
                      <p className="text-foreground-muted">
                        Freelancer works with protected funds
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-glass-border flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-foreground-muted text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground-muted">Completion</p>
                      <p className="text-foreground-muted">
                        Review and approve work
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-glass-border flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-foreground-muted text-xs font-bold">4</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground-muted">Release</p>
                      <p className="text-foreground-muted">
                        Funds released to freelancer
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Escrow Protection */}
              <div className="glass-panel p-3 sm:p-4 rounded-lg border border-neon-cyan/20">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-neon-cyan" />
                  <h4 className="font-semibold text-foreground text-sm sm:text-base">Escrow Protection</h4>
                </div>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Project Cost</span>
                    <span className="font-semibold">
                      {selectedBid && formatBudget(selectedBid.proposedAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Status</span>
                    <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 text-xs">
                      Ready
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-medium text-yellow-500 mb-1">Security Notice</p>
                  <p className="text-yellow-600">
                    Funds secured in escrow until work approval.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-4 sm:p-6 border-t border-glass-border bg-glass-secondary/50">
              <Button
                variant="glass"
                onClick={() => setAssignDialogOpen(false)}
                className="flex-1 text-sm"
                disabled={isAssigning}
              >
                Cancel
              </Button>
              <Button
                variant="neon"
                onClick={handleAssignJob}
                className="flex-1 gap-2 text-sm"
                disabled={isAssigning}
              >
                {isAssigning ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageJobsPage;