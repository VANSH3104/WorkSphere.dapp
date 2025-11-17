"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  User,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Paperclip,
  Upload,
  Vote,
  Scale,
  FileText,
  ChevronRight,
  Star,
  Award,
  TrendingUp,
  Shield,
  Target,
  BookOpen,
  Zap,
  ExternalLink,
  Crown,
  Scale as ScaleIcon,
  Gavel
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/(module)/ui/card";
import { Button } from "@/app/(module)/ui/button";
import { Badge } from "@/app/(module)/ui/badge";
import { Progress } from "@/app/(module)/ui/progress";
import { Separator } from "@/app/(module)/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/(module)/ui/tabs";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { fetchJobByPublicKey } from "@/(anchor)/actions/fetchjob";
import { useUser } from "@/(providers)/userProvider";
import { findJobPDA, getProgram } from "@/(anchor)/setup";
import BN from "bn.js";

interface Evidence {
  id: string;
  submittedBy: "client" | "freelancer";
  description: string;
  attachments: string[];
  submittedDate: string;
}

interface UserProfile {
  name: string;
  address: string;
  fullAddress: PublicKey;
  reputation: number;
  totalEarnings: number;
  totalSpent: number;
  completedJobs: number;
  activeJobs: number;
  cancelledJobs: number;
  disputesRaised: number;
  disputesResolved: number;
  isClient: boolean;
  isFreelancer: boolean;
  resume?: {
    skills: string[];
    experience: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
    }>;
    portfolio: Array<{
      title: string;
      description: string;
      url: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      year: string;
    }>;
  };
}

interface DisputeDetail {
  id: string;
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  category: string;
  skills: string[];
  budget: number;
  deadline: string;
  status: "open" | "voting" | "resolved" | "rejected" | "disputed";
  dispute: {
    raiser: PublicKey;
    against: PublicKey;
    reason: string;
    status: any;
    createdAt: number;
    votesForRaiser: BN;
    votesForAgainst: BN;
    votingEnd: BN;
    votingStart: BN;
    resolution?: {
      winner: PublicKey;
      amount: BN;
    };
  };
  client: UserProfile;
  freelancer: UserProfile;
  createdDate: string;
  votingStats: {
    votesFor: number;
    votesAgainst: number;
    totalStake: number;
    endDate: string;
  };
  evidence: Evidence[];
  timeline: {
    created: string;
    votingStarted?: string;
    resolved?: string;
  };
  workSubmission: {
    submitted: boolean;
    submittedAt: string | null;
    url: string;
    description: string;
    approved: boolean;
    approvedAt: string | null;
  };
  bidders: Array<{
    freelancer: PublicKey;
    amount: number;
    proposal: string;
  }>;
}

const DisputeDetailPage = () => {
  const { jobId } = useParams();
  const disputeId = jobId;
  const navigate = useRouter();
  const { wallet, publicKey } = useWallet();
  const [dispute, setDispute] = useState<DisputeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { fetchUserByAddress } = useUser();
  const [votingDialogOpen, setVotingDialogOpen] = useState(false);
  const [selectedVote, setSelectedVote] = useState<"client" | "freelancer" | null>(null);

  useEffect(() => {
    const loadDisputeData = async () => {
      if (!wallet?.adapter || !disputeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const jobPublicKey = new PublicKey(disputeId as string);
        const jobData = await fetchJobByPublicKey(wallet.adapter, jobPublicKey);
        
        if (!jobData) {
          setLoading(false);
          return;
        }

        const clientData = await fetchUserByAddress(jobData.account.client);
        const freelancerData = await fetchUserByAddress(jobData.account.freelancer);

        console.log("Job Data:", jobData);
        console.log("Client Data:", clientData);
        console.log("Freelancer Data:", freelancerData);

        // Helper function to get dispute status
        const getDisputeStatus = (disputeStatus: any): string => {
          if (disputeStatus?.open) return "open";
          if (disputeStatus?.voting) return "voting";
          if (disputeStatus?.resolved) return "resolved";
          if (disputeStatus?.rejected) return "rejected";
          return "open";
        };

        // Transform user data to profile format
        const clientProfile: UserProfile = {
          name: clientData?.name || "Client",
          address: jobData.account.client.toString().slice(0, 8) + '...' + jobData.account.client.toString().slice(-8),
          fullAddress: jobData.account.client,
          reputation: clientData?.reputation?.toNumber() || 0,
          totalEarnings: (clientData?.totalEarnings?.toNumber() || 0) / 1_000_000_000,
          totalSpent: (clientData?.totalSpent?.toNumber() || 0) / 1_000_000_000,
          completedJobs: clientData?.completedJobs?.toNumber() || 0,
          activeJobs: clientData?.activeJobs?.toNumber() || 0,
          cancelledJobs: clientData?.cancelledJobs?.toNumber() || 0,
          disputesRaised: clientData?.disputesRaised?.toNumber() || 0,
          disputesResolved: clientData?.disputesResolved?.toNumber() || 0,
          isClient: clientData?.isClient || true,
          isFreelancer: clientData?.isFreelancer || false,
        };

        const freelancerProfile: UserProfile = {
          name: freelancerData?.name || "Freelancer",
          address: jobData.account.freelancer.toString().slice(0, 8) + '...' + jobData.account.freelancer.toString().slice(-8),
          fullAddress: jobData.account.freelancer,
          reputation: freelancerData?.reputation?.toNumber() || 0,
          totalEarnings: (freelancerData?.totalEarnings?.toNumber() || 0) / 1_000_000_000,
          totalSpent: (freelancerData?.totalSpent?.toNumber() || 0) / 1_000_000_000,
          completedJobs: freelancerData?.completedJobs?.toNumber() || 0,
          activeJobs: freelancerData?.activeJobs?.toNumber() || 0,
          cancelledJobs: freelancerData?.cancelledJobs?.toNumber() || 0,
          disputesRaised: freelancerData?.disputesRaised?.toNumber() || 0,
          disputesResolved: freelancerData?.disputesResolved?.toNumber() || 0,
          isClient: freelancerData?.isClient || false,
          isFreelancer: freelancerData?.isFreelancer || true,
          resume: freelancerData?.resume || undefined,
        };

        // Calculate voting stats
        const votesForRaiser = jobData.account.dispute.votesForRaiser.toNumber();
        const votesForAgainst = jobData.account.dispute.votesForAgainst.toNumber();
        const totalVotes = votesForRaiser + votesForAgainst;
        
        const disputeData: DisputeDetail = {
          id: jobData.publicKey.toString(),
          jobId: `job-${jobData.account.jobId.toString()}`,
          jobTitle: jobData.account.title,
          jobDescription: jobData.account.description,
          category: jobData.account.category || "General",
          skills: jobData.account.skills || [],
          budget: jobData.account.budget.toNumber() / 1_000_000_000,
          deadline: new Date(jobData.account.deadline.toNumber() * 1000).toISOString(),
          status: getDisputeStatus(jobData.account.dispute.status),
          dispute: jobData.account.dispute,
          client: clientProfile,
          freelancer: freelancerProfile,
          createdDate: new Date(jobData.account.createdAt.toNumber() * 1000).toISOString(),
          votingStats: {
            votesFor: votesForRaiser,
            votesAgainst: votesForAgainst,
            totalStake: totalVotes,
            endDate: new Date(jobData.account.dispute.votingEnd.toNumber() * 1000).toISOString(),
          },
          evidence: [
            {
              id: "ev-001",
              submittedBy: "freelancer",
              description: jobData.account.workSubmissionDescription || "Complete work delivery proof with timestamps and verification documents.",
              attachments: jobData.account.workSubmissionUrl ? [jobData.account.workSubmissionUrl] : [],
              submittedDate: jobData.account.workSubmittedAt 
                ? new Date(jobData.account.workSubmittedAt.toNumber() * 1000).toISOString()
                : new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: "ev-002",
              submittedBy: "client",
              description: jobData.account.dispute?.reason || "Quality concerns and incomplete delivery evidence.",
              attachments: [],
              submittedDate: new Date(jobData.account.dispute?.createdAt?.toNumber() * 1000 || Date.now()).toISOString(),
            },
          ],
          timeline: {
            created: new Date(jobData.account.createdAt.toNumber() * 1000).toISOString(),
            votingStarted: new Date(jobData.account.dispute?.votingStart?.toNumber() * 1000 || Date.now()).toISOString(),
            resolved: jobData.account.dispute?.resolvedAt 
              ? new Date(jobData.account.dispute.resolvedAt.toNumber() * 1000).toISOString()
              : undefined,
          },
          workSubmission: {
            submitted: jobData.account.workSubmitted || false,
            submittedAt: jobData.account.workSubmittedAt 
              ? new Date(jobData.account.workSubmittedAt.toNumber() * 1000).toISOString()
              : null,
            url: jobData.account.workSubmissionUrl || "",
            description: jobData.account.workSubmissionDescription || "",
            approved: jobData.account.workApproved || false,
            approvedAt: jobData.account.workApprovedAt
              ? new Date(jobData.account.workApprovedAt.toNumber() * 1000).toISOString()
              : null,
          },
          bidders: jobData.account.bidders || [],
        };

        setDispute(disputeData);
      } catch (error) {
        console.error("Failed to load dispute details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDisputeData();
  }, [wallet, disputeId, fetchUserByAddress]);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertTriangle className="h-5 w-5" />;
      case "voting": return <Clock className="h-5 w-5" />;
      case "resolved": return <CheckCircle2 className="h-5 w-5" />;
      case "rejected": return <XCircle className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
      case "voting": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "resolved": return "bg-green-500/20 text-green-500 border-green-500/30";
      case "rejected": return "bg-red-500/20 text-red-500 border-red-500/30";
      default: return "bg-glass-secondary text-foreground-muted";
    }
  };

  // Calculate voting percentages
  const votesForRaiser = dispute?.dispute.votesForRaiser.toNumber() || 0;
  const votesForAgainst = dispute?.dispute.votesForAgainst.toNumber() || 0;
  const totalVotes = votesForRaiser + votesForAgainst;
  const votesForPercentage = totalVotes > 0 ? Math.round((votesForRaiser / totalVotes) * 100) : 0;
  const votesAgainstPercentage = totalVotes > 0 ? Math.round((votesForAgainst / totalVotes) * 100) : 0;

  // Determine winner and verdict
  const getVerdict = () => {
    if (!dispute) return null;
    
    const isResolved = dispute.dispute.status?.resolved;
    const isRejected = dispute.dispute.status?.rejected;
    
    if (isResolved || isRejected) {
      const winner = dispute.dispute.resolution?.winner;
      if (!winner) return null;
      
      const isClientWinner = winner.equals(dispute.client.fullAddress);
      const isFreelancerWinner = winner.equals(dispute.freelancer.fullAddress);
      
      return {
        winner: isClientWinner ? 'client' : isFreelancerWinner ? 'freelancer' : 'unknown',
        amount: dispute.dispute.resolution?.amount ? dispute.dispute.resolution.amount.toNumber() / 1_000_000_000 : 0,
        isResolved,
        isRejected
      };
    }
    
    // For ongoing disputes, show current leader
    if (votesForRaiser > votesForAgainst) {
      const isRaiserClient = dispute.dispute.raiser.equals(dispute.client.fullAddress);
      return {
        winner: isRaiserClient ? 'client' : 'freelancer',
        amount: dispute.budget,
        isLeading: true
      };
    } else if (votesForAgainst > votesForRaiser) {
      const isAgainstClient = dispute.dispute.against.equals(dispute.client.fullAddress);
      return {
        winner: isAgainstClient ? 'client' : 'freelancer',
        amount: dispute.budget,
        isLeading: true
      };
    }
    
    return null;
  };

  const verdict = getVerdict();

  // Voting Dialog Component
  const VotingDialog = () => {
    const { publicKey, signTransaction, wallet } = useWallet();
    const [submitting, setSubmitting] = useState(false);
  
    const handleVote = async () => {
      if (!selectedVote || !publicKey || !signTransaction || !dispute || !wallet?.adapter) {
        return;
      }
  
      try {
        setSubmitting(true);
        const program = await getProgram(wallet.adapter);
        
        const jobPublicKey = new PublicKey(dispute.id);
        const jobData = await fetchJobByPublicKey(wallet.adapter, jobPublicKey);
        
        if (!jobData) {
          throw new Error("Could not fetch job data");
        }
  
        const jobId = jobData.account.jobId.toNumber();
        console.log("Voting on job ID:", jobId);
  
        const voteForRaiser = selectedVote === "client" 
          ? dispute.dispute.raiser.equals(dispute.client.fullAddress)
          : dispute.dispute.raiser.equals(dispute.freelancer.fullAddress);
  
        console.log("Vote for raiser:", voteForRaiser);
  
        const [jobPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('job'), new BN(jobId).toArrayLike(Buffer, 'le', 8)],
          program.programId
        );
  
        const [voterUserPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('user'), publicKey.toBuffer()],
          program.programId
        );
  
        console.log("Job PDA:", jobPda.toString());
        console.log("Voter User PDA:", voterUserPda.toString());
  
        const txSignature = await program.methods
          .voteDispute(new BN(jobId), voteForRaiser)
          .accounts({
            job: jobPda,
            voterUser: voterUserPda,
            voter: publicKey,
          })
          .rpc();
  
        console.log("Vote transaction successful:", txSignature);
        
        alert(`Vote submitted successfully! Transaction: ${txSignature}`);
        
        setVotingDialogOpen(false);
        setSelectedVote(null);
        window.location.reload();
  
      } catch (error: any) {
        console.error("Failed to submit vote:", error);
        alert(`Failed to submit vote: ${error.message}`);
      } finally {
        setSubmitting(false);
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="glass-card p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold mb-4">Cast Your Vote</h3>
          <p className="text-foreground-muted mb-6">
            Vote for who you believe should win this dispute. Your vote will be recorded on-chain.
          </p>
          
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setSelectedVote("freelancer")}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedVote === "freelancer"
                  ? "border-neon-purple bg-neon-purple/10"
                  : "border-glass-border hover:border-neon-purple/50"
              }`}
            >
              <div className="text-left">
                <div className="font-semibold">Vote for Freelancer</div>
                <div className="text-sm text-foreground-muted">{dispute?.freelancer.name}</div>
                <div className="text-xs text-foreground-muted mt-1">
                  {dispute?.dispute.raiser.equals(dispute?.freelancer.fullAddress) 
                    ? "Supporting the dispute raiser" 
                    : "Supporting the disputed party"}
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setSelectedVote("client")}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedVote === "client"
                  ? "border-neon-cyan bg-neon-cyan/10"
                  : "border-glass-border hover:border-neon-cyan/50"
              }`}
            >
              <div className="text-left">
                <div className="font-semibold">Vote for Client</div>
                <div className="text-sm text-foreground-muted">{dispute?.client.name}</div>
                <div className="text-xs text-foreground-muted mt-1">
                  {dispute?.dispute.raiser.equals(dispute?.client.fullAddress) 
                    ? "Supporting the dispute raiser" 
                    : "Supporting the disputed party"}
                </div>
              </div>
            </button>
          </div>
  
          <div className="text-xs text-foreground-muted mb-4 p-3 bg-glass-secondary rounded-lg">
            <strong>Note:</strong> Voting is final and cannot be changed. You'll earn +3 reputation for participating.
          </div>
    
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setVotingDialogOpen(false);
                setSelectedVote(null);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              variant="neon"
              className="flex-1"
              disabled={!selectedVote || submitting}
              onClick={handleVote}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </div>
              ) : (
                "Submit Vote"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Finalize Dispute Button Component
  const FinalizeDisputeButton = () => {
    const { publicKey, signTransaction, wallet } = useWallet();
    const [finalizing, setFinalizing] = useState(false);
  
    const handleFinalize = async () => {
      if (!publicKey || !signTransaction || !dispute || !wallet?.adapter) {
        alert("Please connect your wallet to finalize the dispute");
        return;
      }
  
      try {
        setFinalizing(true);
        const program = await getProgram(wallet.adapter);
        
        const jobPublicKey = new PublicKey(dispute.id);
        const jobData = await fetchJobByPublicKey(wallet.adapter, jobPublicKey);
        
        if (!jobData) {
          throw new Error("Could not fetch job data");
        }
  
        const jobId = jobData.account.jobId.toNumber();
        console.log("Finalizing dispute for job ID:", jobId);
  
        const [jobPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('job'), new BN(jobId).toArrayLike(Buffer, 'le', 8)],
          program.programId
        );
  
        const [escrowPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('escrow'), jobPda.toBuffer()],
          program.programId
        );
  
        const [raiserUserPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('user'), dispute.dispute.raiser.toBuffer()],
          program.programId
        );
  
        const [againstUserPda] = PublicKey.findProgramAddressSync(
          [Buffer.from('user'), dispute.dispute.against.toBuffer()],
          program.programId
        );
  
        const txSignature = await program.methods
          .finalizeDispute(new BN(jobId))
          .accounts({
            job: jobPda,
            escrow: escrowPda,
            raiser: dispute.dispute.raiser,
            against: dispute.dispute.against,
            raiserUser: raiserUserPda,
            againstUser: againstUserPda,
          })
          .rpc();
  
        console.log("Finalize dispute transaction successful:", txSignature);
        
        alert(`Dispute finalized successfully! Transaction: ${txSignature}`);
        window.location.reload();
  
      } catch (error: any) {
        console.error("Failed to finalize dispute:", error);
        alert(`Failed to finalize dispute: ${error.message}`);
      } finally {
        setFinalizing(false);
      }
    };

    const votingEndTime = dispute.dispute.votingEnd?.toNumber() || 0;
    const currentTime = Math.floor(Date.now() / 1000);
    const votingEnded = currentTime >= votingEndTime;
    const isVotingStatus = dispute.dispute.status?.voting !== undefined;
    const isResolved = dispute.dispute.status?.resolved !== undefined;
    const isRejected = dispute.dispute.status?.rejected !== undefined;

    
    // Show finalize button only when voting has ended and dispute is still in voting status
    return (
      <Button 
        variant="neon" 
        className="flex-1 group bg-green-600 hover:bg-green-700"
        onClick={handleFinalize}
        disabled={finalizing}
      >
        {finalizing ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Finalizing...
          </div>
        ) : (
          <>
            <Gavel className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            Finalize Dispute
            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-card p-8 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
            <div className="text-lg text-foreground">Loading dispute details...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="min-h-screen p-6 lg:p-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="glass-card p-8">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Dispute Not Found</h2>
            <p className="text-foreground-muted mb-6">The dispute you're looking for doesn't exist or you don't have access to it.</p>
            <Button variant="neon" onClick={() => navigate.push('/disputes')}>
              Back to Disputes
            </Button>
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
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Back Button */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Button 
            variant="ghost" 
            className="group hover:text-neon-cyan"
            onClick={() => navigate.push('/disputes')}
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Disputes
          </Button>
        </motion.div>

        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card className="glass-card overflow-hidden">
            <CardHeader className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg border ${getStatusColor(dispute.status)}`}>
                      {getStatusIcon(dispute.status)}
                    </div>
                    <Badge className={`${getStatusColor(dispute.status)}`}>
                      {dispute.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="bg-glass-primary border-glass-border">
                      {dispute.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl mb-2 bg-gradient-primary bg-clip-text text-transparent">
                    {dispute.jobTitle}
                  </CardTitle>
                  <CardDescription className="text-base items-center gap-2 grid text-foreground-muted">
                    <Scale className="h-4 w-4" />
                    Dispute ID: {dispute.id.slice(0, 8)}...{dispute.id.slice(-8)}
                  </CardDescription>
                  <div className="mt-2">
                    <Badge 
                      variant="outline" 
                      className={
                        dispute.dispute.raiser.equals(dispute.client.fullAddress)
                          ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30"
                          : "bg-neon-purple/10 text-neon-purple border-neon-purple/30"
                      }
                    >
                      Dispute Initiated By: {dispute.dispute.raiser.equals(dispute.client.fullAddress) ? "Client" : "Freelancer"}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-foreground-muted mb-1">Disputed Amount</div>
                  <div className="text-3xl font-bold text-neon-gold">{dispute.budget.toFixed(2)} SOL</div>
                  <div className="text-xs text-foreground-muted mt-1">
                    Deadline: {new Date(dispute.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <Separator className="bg-glass-border" />

              {/* Verdict Banner */}
              {verdict && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-lg border ${
                    verdict.isResolved 
                      ? "bg-green-500/10 border-green-500/30" 
                      : verdict.isRejected
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-blue-500/10 border-blue-500/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Crown className={`h-6 w-6 ${
                      verdict.isResolved ? "text-green-500" : 
                      verdict.isRejected ? "text-red-500" : "text-blue-500"
                    }`} />
                    <div className="flex-1">
                      <div className="font-semibold text-foreground">
                        {verdict.isResolved ? "Dispute Resolved" : 
                         verdict.isRejected ? "Dispute Rejected" : "Current Leader"}
                      </div>
                      <div className="text-sm text-foreground-muted">
                        {verdict.isResolved || verdict.isRejected ? (
                          <>
                            Winner: <strong className="text-foreground">
                              {verdict.winner === 'client' ? dispute.client.name : dispute.freelancer.name}
                            </strong>
                            {verdict.amount > 0 && ` - Awarded: ${verdict.amount.toFixed(2)} SOL`}
                          </>
                        ) : (
                          <>
                            <strong className="text-foreground">
                              {verdict.winner === 'client' ? dispute.client.name : dispute.freelancer.name}
                            </strong> is leading with {verdict.winner === 'client' ? votesForPercentage : votesAgainstPercentage}% of votes
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Skills & Requirements */}
              <div className="flex flex-wrap gap-2">
                {dispute.skills.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profiles */}
          <div className="space-y-6">
            {/* Client Profile */}
            <UserProfileCard user={dispute.client} role="Client" />
            
            {/* Freelancer Profile */}
            <UserProfileCard user={dispute.freelancer} role="Freelancer" />
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Voting Stats & Details Tabs */}
            <VotingStatsCard 
              dispute={dispute} 
              votesForPercentage={votesForPercentage} 
              votesAgainstPercentage={votesAgainstPercentage}
              verdict={verdict}
            />
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card">
                <Tabs defaultValue="details" className="w-full">
                  <CardHeader>
                    <TabsList className="grid w-full grid-cols-3 bg-glass-secondary">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="evidence">Evidence</TabsTrigger>
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  
                  <CardContent>
                    <TabsContent value="details" className="space-y-4">
                      <div>
                        <div className="text-sm font-semibold text-foreground-muted mb-2">Job Description</div>
                        <p className="text-foreground leading-relaxed">{dispute.jobDescription}</p>
                      </div>
                      <Separator className="bg-glass-border" />
                      <div>
                        <div className="text-sm font-semibold text-foreground-muted mb-2">Dispute Reason</div>
                        <Badge variant="outline" className="mb-3 bg-glass-primary border-glass-border">
                          Payment Dispute
                        </Badge>
                        <p className="text-foreground leading-relaxed">{dispute.dispute.reason}</p>
                      </div>
                      <Separator className="bg-glass-border" />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-semibold text-foreground-muted mb-2">Raised By</div>
                          <div className="text-sm text-foreground font-mono">
                            {dispute.dispute.raiser.toString().slice(0, 8)}...{dispute.dispute.raiser.toString().slice(-8)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground-muted mb-2">Against</div>
                          <div className="text-sm text-foreground font-mono">
                            {dispute.dispute.against.toString().slice(0, 8)}...{dispute.dispute.against.toString().slice(-8)}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="evidence" className="space-y-4">
                      {dispute.evidence.map((evidence, index) => (
                        <motion.div
                          key={evidence.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 rounded-lg glass-panel border-glass-border space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className={
                                evidence.submittedBy === "client"
                                  ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30"
                                  : "bg-neon-purple/10 text-neon-purple border-neon-purple/30"
                              }
                            >
                              {evidence.submittedBy === "client" ? "Client" : "Freelancer"}
                            </Badge>
                            <span className="text-xs text-foreground-muted">
                              {new Date(evidence.submittedDate).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{evidence.description}</p>
                          {evidence.attachments.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs font-semibold text-foreground-muted">Attachments:</div>
                              <div className="flex flex-wrap gap-2">
                                {evidence.attachments.map((attachment, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="glass-panel hover:bg-neon-cyan/10 hover:border-neon-cyan/30 cursor-pointer transition-colors"
                                  >
                                    <Paperclip className="h-3 w-3 mr-1" />
                                    {attachment}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </TabsContent>

                    <TabsContent value="timeline" className="space-y-4">
                      <TimelineView dispute={dispute} />
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </motion.div>

            {/* Action Buttons - Show Vote button during voting period, Finalize after */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {/* Show Vote Button during voting period */}
              {dispute.dispute.status?.voting && !verdict?.isResolved && !verdict?.isRejected && (
                (() => {
                  const votingEndTime = dispute.dispute.votingEnd?.toNumber() || 0;
                  const currentTime = Math.floor(Date.now() / 1000);
                  const votingActive = currentTime < votingEndTime;
                  
                  if (votingActive) {
                    return (
                      <Button 
                        variant="neon" 
                        className="flex-1 group"
                        onClick={() => setVotingDialogOpen(true)}
                      >
                        <Vote className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                        Cast Your Vote
                        <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    );
                  }
                  return null;
                })()
              )}

              {/* Show Finalize Button after voting period ends */}
              <FinalizeDisputeButton />

              {/* Show message if dispute is resolved */}
              {(verdict?.isResolved || verdict?.isRejected) && (
                <div className="flex-1 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <div className="font-semibold text-foreground">Dispute Resolved</div>
                  <div className="text-sm text-foreground-muted">
                    This dispute has been {verdict.isResolved ? 'resolved' : 'rejected'}
                  </div>
                </div>
              )}

              
            </motion.div>
          </div>
        </div>
        {votingDialogOpen && <VotingDialog />}
      </div>
    </div>
  );
};

// User Profile Card Component
const UserProfileCard = ({ user, role }: { user: UserProfile; role: string }) => {
  const successRate = user.completedJobs > 0 
    ? Math.round((user.completedJobs / (user.completedJobs + user.cancelledJobs)) * 100) 
    : 0;

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-3 rounded-full ${role === "Client" ? "bg-neon-cyan/10" : "bg-neon-purple/10"}`}>
              <User className={`h-6 w-6 ${role === "Client" ? "text-neon-cyan" : "text-neon-purple"}`} />
            </div>
            <div>
              <CardTitle className="text-lg text-foreground">{user.name}</CardTitle>
              <CardDescription className="text-xs font-mono text-foreground-muted">{user.address}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={role === "Client" ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30" : "bg-neon-purple/10 text-neon-purple border-neon-purple/30"}>
            {role}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reputation */}
          <div className="flex items-center justify-between p-3 rounded-lg glass-panel border-glass-border">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-neon-gold" />
              <span className="text-sm text-foreground-muted">Reputation</span>
            </div>
            <span className="font-bold text-foreground">{user.reputation}</span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg glass-panel border-glass-border">
              <div className="text-xs text-foreground-muted mb-1">Completed</div>
              <div className="text-lg font-bold text-green-500">{user.completedJobs}</div>
            </div>
            <div className="p-3 rounded-lg glass-panel border-glass-border">
              <div className="text-xs text-foreground-muted mb-1">Active</div>
              <div className="text-lg font-bold text-blue-500">{user.activeJobs}</div>
            </div>
            <div className="p-3 rounded-lg glass-panel border-glass-border">
              <div className="text-xs text-foreground-muted mb-1">Success Rate</div>
              <div className="text-lg font-bold text-neon-cyan">{successRate}%</div>
            </div>
            <div className="p-3 rounded-lg glass-panel border-glass-border">
              <div className="text-xs text-foreground-muted mb-1">Disputes</div>
              <div className="text-lg font-bold text-yellow-500">{user.disputesRaised}</div>
            </div>
          </div>

          {/* Financial Info */}
          <Separator className="bg-glass-border" />
          <div className="space-y-2">
            {role === "Freelancer" && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-muted">Total Earned</span>
                <span className="font-semibold text-neon-gold">{user.totalEarnings.toFixed(2)} SOL</span>
              </div>
            )}
            {role === "Client" && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-muted">Total Spent</span>
                <span className="font-semibold text-neon-gold">{user.totalSpent.toFixed(2)} SOL</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Voting Stats Card Component
const VotingStatsCard = ({ 
  dispute, 
  votesForPercentage, 
  votesAgainstPercentage,
  verdict 
}: { 
  dispute: DisputeDetail; 
  votesForPercentage: number; 
  votesAgainstPercentage: number;
  verdict: any;
}) => {
  const votesForRaiser = dispute.dispute.votesForRaiser.toNumber();
  const votesForAgainst = dispute.dispute.votesForAgainst.toNumber();
  const totalVotes = votesForRaiser + votesForAgainst;
  
  const isRaiserClient = dispute.dispute.raiser.equals(dispute.client.fullAddress);
  const isAgainstClient = dispute.dispute.against.equals(dispute.client.fullAddress);

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Vote className="h-5 w-5 text-neon-cyan" />
            Voting Statistics
          </CardTitle>
          <CardDescription className="text-foreground-muted">
            {verdict?.isResolved ? "Final Results" : "Live Voting Results"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Votes Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-2xl font-bold text-green-500">{votesForRaiser}</div>
              <div className="text-sm text-foreground-muted mt-1">Votes for {isRaiserClient ? "Client" : "Freelancer"}</div>
              <div className="text-xs text-green-500 font-semibold mt-1">{votesForPercentage}%</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="text-2xl font-bold text-red-500">{votesForAgainst}</div>
              <div className="text-sm text-foreground-muted mt-1">Votes for {isAgainstClient ? "Client" : "Freelancer"}</div>
              <div className="text-xs text-red-500 font-semibold mt-1">{votesAgainstPercentage}%</div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-muted flex items-center gap-2">
                  <User className="h-4 w-4 text-green-500" />
                  {isRaiserClient ? dispute.client.name : dispute.freelancer.name}
                </span>
                <span className="font-semibold text-green-500">{votesForPercentage}%</span>
              </div>
              <Progress value={votesForPercentage} className="h-3 bg-glass-secondary" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-muted flex items-center gap-2">
                  <User className="h-4 w-4 text-red-500" />
                  {isAgainstClient ? dispute.client.name : dispute.freelancer.name}
                </span>
                <span className="font-semibold text-red-500">{votesAgainstPercentage}%</span>
              </div>
              <Progress value={votesAgainstPercentage} className="h-3 bg-glass-secondary" />
            </div>
          </div>

          <Separator className="bg-glass-border" />

          {/* Total Votes */}
          <div className="flex items-center justify-between p-3 rounded-lg glass-panel border-glass-border">
            <span className="text-sm text-foreground-muted">Total Votes Cast</span>
            <span className="font-semibold text-foreground">{totalVotes}</span>
          </div>

          {/* Voting Deadline */}
          <div className="flex items-center justify-between p-3 rounded-lg glass-panel border-glass-border">
            <div>
              <span className="text-sm text-foreground-muted">Voting Ends</span>
              <div className="text-sm font-semibold text-foreground">
                {new Date(dispute.dispute.votingEnd.toNumber() * 1000).toLocaleDateString()}
              </div>
              <div className="text-xs text-foreground-muted">
                {new Date(dispute.dispute.votingEnd.toNumber() * 1000).toLocaleTimeString()}
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={
                Date.now() >= dispute.dispute.votingEnd.toNumber() * 1000
                  ? "bg-red-500/10 text-red-500 border-red-500/30"
                  : "bg-green-500/10 text-green-500 border-green-500/30"
              }
            >
              {Date.now() >= dispute.dispute.votingEnd.toNumber() * 1000 ? "Ended" : "Active"}
            </Badge>
          </div>

          {/* Status Banner */}
          {!verdict?.isResolved && !verdict?.isRejected && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-neon-cyan/10 to-neon-purple/10 border border-neon-cyan/20">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-neon-cyan mt-0.5" />
                <div>
                  <div className="font-semibold text-sm mb-1 text-foreground">
                    {Date.now() >= dispute.dispute.votingEnd.toNumber() * 1000 ? "Voting Ended" : "Voting in Progress"}
                  </div>
                  <div className="text-xs text-foreground-muted">
                    {Date.now() >= dispute.dispute.votingEnd.toNumber() * 1000 
                      ? "Voting period has ended. Waiting for finalization."
                      : "Cast your vote to help resolve this dispute fairly"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Final Verdict Banner */}
          {verdict?.isResolved && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm mb-1 text-foreground">Dispute Resolved</div>
                  <div className="text-xs text-foreground-muted">
                    Winner: <strong>{verdict.winner === 'client' ? dispute.client.name : dispute.freelancer.name}</strong>
                    {verdict.amount > 0 && ` - Awarded ${verdict.amount.toFixed(2)} SOL`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Timeline View Component
const TimelineView = ({ dispute }: { dispute: DisputeDetail }) => {
  const timelineSteps = [
    {
      label: "Job Created",
      date: dispute.createdDate,
      active: false,
      completed: true,
    },
    {
      label: "Work Submitted",
      date: dispute.workSubmission.submittedAt,
      active: false,
      completed: dispute.workSubmission.submitted,
    },
    {
      label: "Work Approved",
      date: dispute.workSubmission.approvedAt,
      active: false,
      completed: dispute.workSubmission.approved,
    },
    {
      label: "Dispute Raised",
      date: new Date(dispute.dispute.createdAt * 1000).toISOString(),
      active: false,
      completed: true,
    },
    {
      label: "Voting Started",
      date: new Date(dispute.dispute.votingStart.toNumber() * 1000).toISOString(),
      active: dispute.status === "voting",
      completed: dispute.status !== "open",
    },
    {
      label: dispute.dispute.status?.resolved ? "Resolved" : "Voting Ends",
      date: dispute.dispute.status?.resolved 
        ? dispute.timeline.resolved
        : new Date(dispute.dispute.votingEnd.toNumber() * 1000).toISOString(),
      active: dispute.status === "resolved",
      completed: dispute.status === "resolved" || dispute.status === "rejected" || Date.now() >= dispute.dispute.votingEnd.toNumber() * 1000,
    },
  ];

  return (
    <div className="relative">
      {/* Connection line */}
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-glass-border -z-10" />
      
      <div className="grid grid-cols-3 gap-4">
        {timelineSteps.map((step, idx) => (
          <TimelineStep
            key={idx}
            label={step.label}
            date={step.date}
            active={step.active}
            completed={step.completed}
          />
        ))}
      </div>

      {/* Conflict Information Section */}
      <div className="mt-8 p-4 rounded-lg glass-panel border-glass-border">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-foreground mb-2">Conflict Details</div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Dispute Initiated By:</span>
                <Badge 
                  variant="outline" 
                  className={
                    dispute.dispute.raiser.equals(dispute.client.fullAddress)
                      ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30"
                      : "bg-neon-purple/10 text-neon-purple border-neon-purple/30"
                  }
                >
                  {dispute.dispute.raiser.equals(dispute.client.fullAddress) ? "Client" : "Freelancer"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-muted">Dispute Against:</span>
                <Badge 
                  variant="outline" 
                  className={
                    dispute.dispute.against.equals(dispute.client.fullAddress)
                      ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30"
                      : "bg-neon-purple/10 text-neon-purple border-neon-purple/30"
                  }
                >
                  {dispute.dispute.against.equals(dispute.client.fullAddress) ? "Client" : "Freelancer"}
                </Badge>
              </div>

              <Separator className="bg-glass-border" />

              <div>
                <div className="text-sm font-semibold text-foreground-muted mb-2">Primary Issue:</div>
                <div className="text-sm text-foreground p-3 rounded-lg bg-glass-secondary">
                  {dispute.dispute.reason || "Payment and delivery dispute regarding work quality and completion."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-foreground-muted mb-1">Amount in Dispute:</div>
                  <div className="font-semibold text-neon-gold">{dispute.budget.toFixed(2)} SOL</div>
                </div>
                <div>
                  <div className="text-foreground-muted mb-1">Days Since Created:</div>
                  <div className="font-semibold text-foreground">
                    {Math.floor((Date.now() - new Date(dispute.createdDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TimelineStepProps {
  label: string;
  date?: string;
  active: boolean;
  completed: boolean;
}

const TimelineStep = ({ label, date, active, completed }: TimelineStepProps) => {
  return (
    <div className="flex flex-col items-center relative z-10">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
          completed
            ? "bg-gradient-primary border-neon-cyan shadow-glow"
            : active
            ? "bg-glass-primary border-neon-cyan animate-pulse"
            : "bg-glass-primary border-glass-border"
        }`}
      >
        {completed && <CheckCircle2 className="h-4 w-4 text-white" />}
        {active && !completed && <Clock className="h-4 w-4 text-neon-cyan" />}
      </motion.div>
      <div className="mt-2 text-center">
        <div className={`text-sm font-semibold ${completed || active ? "text-foreground" : "text-foreground-muted"}`}>
          {label}
        </div>
        {date && (
          <div className="text-xs text-foreground-muted mt-1">{new Date(date).toLocaleDateString()}</div>
        )}
      </div>
    </div>
  );
};

export default DisputeDetailPage;