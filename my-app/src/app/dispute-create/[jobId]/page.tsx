"use client"
import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Scale,
  Clock,
  Users,
  CheckCircle,
  Info,
  ArrowRight,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { Label } from "@/app/(module)/ui/label";
import { Textarea } from "@/app/(module)/ui/textarea";
import { Button } from "@/app/(module)/ui/button";
import { Badge } from "@/app/(module)/ui/badge";
import { getProgram } from "@/(anchor)/setup";
import BN from "bn.js";

const RaiseDisputePage = () => {
  const router = useRouter();
  const params = useParams();
  const { wallet, publicKey } = useWallet();
  const searchParams = useSearchParams();
  
  // Correct way to get jobId from the route /dispute-create/[jobId]
  const jobId = params.jobId as string;
  const userRole = searchParams.get("role") || "client";
  
  console.log("Job ID:", jobId);
  console.log("User Role:", userRole);

  const [reason, setReason] = useState("");
  const [votingPeriod, setVotingPeriod] = useState(5); // Default 5 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxReasonChars = 1200;
  const reasonCharsRemaining = maxReasonChars - reason.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit");
    
    if (!wallet?.adapter?.publicKey || !publicKey) {
      toast.error("Wallet not connected");
      return;
    }
    
    console.log("Job ID:", jobId);
    
    if (!jobId) {
      toast.error("Job ID not found");
      return;
    }
    
    if (reason.trim().length < 50) {
      toast.error("Dispute reason must be at least 50 characters");
      return;
    }
    
    if (reason.trim().length > maxReasonChars) {
      toast.error(`Dispute reason must be less than ${maxReasonChars} characters`);
      return;
    }
  
    try {
      setIsSubmitting(true);
      
      // Validate and convert jobId to PublicKey
      let jobAccount: PublicKey;
      try {
        jobAccount = new PublicKey(jobId);
      } catch (error) {
        toast.error("Invalid job ID format");
        return;
      }
      
      const program = getProgram(wallet.adapter);
      
      // Fetch job data to get numeric jobId
      // Fetch job data to get numeric jobId
            const jobData = await program.account.job.fetch(jobAccount);
            const numericJobId = jobData.jobId; // Convert BN to number
            
            // Derive the raiser's user PDA
            const [raiserUserPda] = PublicKey.findProgramAddressSync(
              [Buffer.from("user"), publicKey.toBuffer()],
              program.programId
            );
            
            // Convert voting period from minutes to seconds and wrap in BN
            const votingPeriodSeconds = new BN(votingPeriod * 60);
            
            console.log("Raising dispute with:", {
              numericJobId,
              reason,
              votingPeriodSeconds: votingPeriodSeconds.toString(),
              jobAccount: jobAccount.toString(),
              authority: publicKey.toString(),
              raiserUser: raiserUserPda.toString()
            });
            
            const tx = await program.methods
              .raiseDispute(numericJobId, reason, votingPeriodSeconds)
              .accounts({
                job: jobAccount,
                authority: publicKey,
                raiserUser: raiserUserPda,
              })
              .rpc();
      
  
      console.log("Dispute raised successfully:", tx);
      
      toast.success("Dispute raised successfully! The community will now vote on the resolution.");
      router.push(`/jobs/${jobId}?role=${userRole}`);
    } catch (error: any) {
      console.error("Failed to raise dispute:", error);
      
      // Handle specific error cases
      if (error.message?.includes("DisputeAlreadyExists")) {
        toast.error("A dispute already exists for this job");
      } else if (error.message?.includes("JobNotInProgress")) {
        toast.error("Can only raise disputes for jobs in progress");
      } else if (error.message?.includes("UnauthorizedUser")) {
        toast.error("Only the client or assigned freelancer can raise a dispute");
      } else {
        toast.error("Failed to raise dispute. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const disputeSteps = [
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      title: "Dispute Created",
      description: "Submit your dispute with detailed reasoning",
      color: "text-yellow-500",
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Community Voting",
      description: "DAO members vote on the dispute outcome",
      color: "text-blue-500",
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Resolution",
      description: "Funds are distributed based on voting results",
      color: "text-green-500",
    },
  ];

  // Add a check to see if jobId is available
  if (!jobId) {
    return (
      <div className="min-h-screen p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Job ID Missing</h1>
          <p className="text-foreground-muted mb-4">Unable to find the job information.</p>
          <Button onClick={() => router.push("/jobs")}>
            Back to Jobs
          </Button>
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

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => router.push(`/jobs/${jobId}?role=${userRole}`)}
            className="gap-2 hover:text-neon-cyan mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job
          </Button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-yellow-500/20 border border-yellow-500/30 mb-4">
              <Scale className="h-6 w-6 text-yellow-500" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Raise a Dispute
            </h1>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              Submit a dispute to resolve disagreements through community governance. 
              Once raised, the dispute will be voted on by the DAO.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-foreground">Dispute Information</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Job Information */}
                {jobId && (
                  <div className="glass-panel p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">Job ID</h3>
                        <p className="text-sm text-foreground-muted font-mono truncate max-w-[300px]">
                          {jobId}
                        </p>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                        {userRole === 'client' ? 'As Client' : 'As Freelancer'}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Dispute Reason */}
                <div className="space-y-3">
                  <Label htmlFor="reason" className="text-base font-semibold text-foreground">
                    Dispute Reason <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="reason"
                    placeholder="Describe the issue in detail. Be specific about what went wrong and why you believe a dispute is necessary. (minimum 50 characters)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="min-h-[200px] resize-none bg-glass-primary border-glass-border focus:border-neon-cyan/50 transition-colors"
                    required
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground-muted">
                      {reason.length < 50 ? `${50 - reason.length} more characters required` : "Minimum requirement met"}
                    </span>
                    <span
                      className={`font-mono ${
                        reasonCharsRemaining < 50
                          ? "text-red-500"
                          : reasonCharsRemaining < 100
                          ? "text-yellow-500"
                          : "text-foreground-muted"
                      }`}
                    >
                      {reasonCharsRemaining}/{maxReasonChars}
                    </span>
                  </div>
                </div>

                  

                {/* Warning Notice */}
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <p className="font-semibold text-yellow-500">Important Notice</p>
                      <div className="text-sm text-foreground-muted space-y-1">
                        <p>• Submitting a dispute will freeze the job funds in escrow until resolution</p>
                        <p>• The DAO community will vote to determine the outcome</p>
                        <p>• False or malicious disputes may impact your reputation</p>
                        <p>• Ensure all information provided is accurate and truthful</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="neon"
                  size="lg"
                  disabled={isSubmitting || reason.length < 50 || !wallet?.adapter?.publicKey}
                  className="w-full gap-3 group relative overflow-hidden"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="flex items-center gap-2"
                      >
                        <Scale className="h-5 w-5" />
                        Raising Dispute...
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <Scale className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                      <div className="group-hover:rotate-1 transition-transform">
                        Raise Dispute
                      </div>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                {!wallet?.adapter?.publicKey && (
                  <div className="text-center p-4 border border-dashed border-glass-border rounded-lg">
                    <p className="text-foreground-muted text-sm">
                      Please connect your wallet to raise a dispute
                    </p>
                  </div>
                )}
              </form>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Dispute Process */}
            <div className="glass-card p-6 sticky top-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Dispute Process</h3>
              <div className="space-y-6">
                {disputeSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="relative"
                  >
                    <div className="flex gap-4">
                      {/* Step Number and Line */}
                      <div className="flex flex-col items-center">
                        <div className={`p-2 rounded-lg border-2 bg-glass-primary ${step.color} border-current`}>
                          {step.icon}
                        </div>
                        {index < disputeSteps.length - 1 && (
                          <div className="w-0.5 h-full bg-gradient-to-b from-glass-border to-transparent my-2" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 pb-4">
                        <h4 className="font-semibold text-foreground mb-2">{step.title}</h4>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Resolution Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-glass-primary">
                  <span className="text-foreground-muted">Avg. Resolution</span>
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                    3-5 days
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-glass-primary">
                  <span className="text-foreground-muted">Fair Outcomes</span>
                  <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30">
                    92%
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-glass-primary">
                  <span className="text-foreground-muted">Community Size</span>
                  <Badge variant="outline">1.2K voters</Badge>
                </div>
              </div>
            </div>

            {/* Job Address */}
            {jobId && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">Job Address</h3>
                <code className="text-xs bg-glass-primary p-3 rounded break-all w-full block text-foreground-muted">
                  {jobId}
                </code>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RaiseDisputePage;