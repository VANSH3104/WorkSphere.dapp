"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Link as LinkIcon, 
  Upload,
  ExternalLink,
  User,
  DollarSign,
  Calendar,
  Award,
  CheckCircle2
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Button } from "@/app/(module)/ui/button";
import { Textarea } from "@/app/(module)/ui/textarea";
import { Input } from "@/app/(module)/ui/input";
import { toast } from "@/app/(module)/ui/sonner";
import { fetchJobByPublicKey } from "@/(anchor)/actions/fetchjob";
import { findUserPDA, getProgram } from "@/(anchor)/setup";

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
  };
}

const SubmitWorkPage = () => {
  const { jobId } = useParams();
  const navigate = useRouter();
  const { wallet , publicKey } = useWallet();
  
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionDescription, setSubmissionDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobData, setJobData] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

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

  const formatDeadline = (deadline: any): string => {
    if (!deadline) return "Not specified";
    const deadlineNum = bnToNumber(deadline);
    return new Date(deadlineNum * 1000).toLocaleDateString();
  };

  useEffect(() => {
    const loadJobData = async () => {
      if (!wallet?.adapter || !jobId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const job = await fetchJobByPublicKey(wallet.adapter, new PublicKey(jobId as string));
        setJobData(job);
      } catch (error) {
        console.error("Failed to load job data:", error);
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    loadJobData();
  }, [wallet, jobId]);

  const handleSubmit = async () => {
      if (!submissionUrl.trim()) {
        toast.error("Please provide a submission URL");
        return;
      }
    
      if (!submissionDescription.trim()) {
        toast.error("Please provide a submission description");
        return;
      }
    
      // Validate URL format
      try {
        new URL(submissionUrl);
      } catch {
        toast.error("Please enter a valid URL");
        return;
      }
    
      if (!jobData) {
        toast.error("Job data not found");
        return;
      }
    
      if (!wallet?.adapter?.publicKey || !publicKey) {
        toast.error("Wallet not connected");
        return;
      }
    
      setIsSubmitting(true);
    
      try {
        const jobAccount = new PublicKey(jobId);
        const program = getProgram(wallet.adapter);
        
        const jobData = await program.account.job.fetch(jobAccount);
        const numericJobId = jobData.jobId;
        
        // Find freelancer's user PDA (this is the key fix)
        const [freelancerUserPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("user"), publicKey.toBuffer()],
          program.programId
        );
    
        // Verify the freelancer user account exists and matches
        try {
          const freelancerUserData = await program.account.user.fetch(freelancerUserPDA);
          console.log("Freelancer user data:", freelancerUserData);
        } catch (error) {
          toast.error("Freelancer profile not found. Please complete your profile first.");
          setIsSubmitting(false);
          return;
        }
    
        // Call submit_work
        const tx = await program.methods
          .submitWork(
            numericJobId,
            submissionUrl,
            submissionDescription
          )
          .accounts({
            job: jobAccount,
            freelancerUser: freelancerUserPDA,  // Use the properly derived PDA
            freelancer: publicKey,
          })
          .rpc();
    
        console.log("Work submission transaction signature:", tx);
        
        toast.success("Work submitted successfully – awaiting client review", {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
        });
        
        // Navigate back to proposals
        setTimeout(() => {
          navigate.push("/proposals");
        }, 1500);
        
      } catch (error: any) {
        console.error("Failed to submit work:", error);
        
        // More specific error handling
        if (error.message?.includes("JobNotInProgress")) {
          toast.error("Job is not in progress");
        } else if (error.message?.includes("NotAssignedFreelancer")) {
          toast.error("You are not the assigned freelancer for this job");
        } else if (error.message?.includes("UrlTooLong")) {
          toast.error("Submission URL is too long (max 500 characters)");
        } else if (error.message?.includes("DescriptionTooLong")) {
          toast.error("Description is too long (max 1000 characters)");
        } else if (error.message?.includes("constraint")) {
          toast.error("Account validation failed - please ensure your profile is set up correctly");
        } else {
          toast.error("Failed to submit work: " + error.message);
        }
      } finally {
        setIsSubmitting(false);
      }
    };

  const maxChars = 2000;
  const remainingChars = maxChars - submissionDescription.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-cyan"></div>
          <div className="text-lg text-foreground">Loading job details...</div>
        </div>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Job Not Found</h2>
          <p className="text-foreground-muted mb-4">The requested job could not be found.</p>
          <Button onClick={() => navigate.push("/proposals")}>
            Back to Proposals
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Submit Work
            </span>
          </h1>
          <p className="text-foreground-muted text-lg">
            Deliver your completed work for client review
          </p>
        </motion.div>

        {/* Job Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {jobData.account.title}
              </h2>
              <p className="text-foreground-muted mb-4 line-clamp-2">
                {jobData.account.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-neon-cyan mb-1">
                    <User className="h-4 w-4" />
                    <span className="text-xs text-foreground-muted">Client</span>
                  </div>
                  <p className="text-sm font-bold text-foreground truncate">
                    {jobData.account.client.toString().slice(0, 8)}...
                  </p>
                </div>

                <div className="glass-panel p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-neon-gold mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-xs text-foreground-muted">Budget</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {lamportsToSOL(bnToNumber(jobData.account.budget))} SOL
                  </p>
                </div>

                <div className="glass-panel p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-neon-purple mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs text-foreground-muted">Deadline</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {formatDeadline(jobData.account.deadline)}
                  </p>
                </div>

                <div className="glass-panel p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-green-500 mb-1">
                    <Award className="h-4 w-4" />
                    <span className="text-xs text-foreground-muted">Job ID</span>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    #{bnToNumber(jobData.account.jobId)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Submission Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mb-6"
        >
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-neon-cyan" />
              Work Submission
            </h3>
            <p className="text-foreground-muted">
              Provide the details of your completed work
            </p>
          </div>

          {/* Submission URL */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-neon-cyan" />
              Work URL
              <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Input
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                placeholder="https://your-work-demo.com or GitHub repository URL"
                className="glass-panel pl-10 border-0 focus:ring-2 focus:ring-neon-cyan/50"
              />
              <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            </div>
            <p className="text-xs text-foreground-muted">
              Provide a live demo URL, GitHub repository, or deployment link
            </p>
          </div>

          {/* Submission Description */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-medium text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-neon-cyan" />
                Work Description
                <span className="text-destructive">*</span>
              </span>
              <span className={`text-xs ${remainingChars < 100 ? 'text-destructive' : 'text-foreground-muted'}`}>
                {remainingChars} characters remaining
              </span>
            </label>
            <Textarea
              value={submissionDescription}
              onChange={(e) => setSubmissionDescription(e.target.value.slice(0, maxChars))}
              placeholder="Describe what you've built, key features, technologies used, deployment instructions, and any important notes for the client..."
              className="glass-panel min-h-[150px] border-0 focus:ring-2 focus:ring-neon-cyan/50 resize-none"
            />
            <p className="text-xs text-foreground-muted">
              Provide a comprehensive description of your completed work and how to access/use it
            </p>
          </div>

          {/* Submission Guidelines */}
          <div className="glass-panel p-4 rounded-lg border-l-4 border-neon-cyan">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-neon-cyan mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground mb-2">Before submitting:</p>
                <ul className="text-sm text-foreground-muted space-y-1">
                  <li>• Ensure your work is fully functional and meets requirements</li>
                  <li>• Test all features thoroughly</li>
                  <li>• Include clear instructions for the client</li>
                  <li>• Double-check your submission URL</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            variant="glass"
            onClick={() => navigate.push("/proposals")}
            className="gap-2 px-8 py-3"
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !submissionUrl.trim() || !submissionDescription.trim()}
            variant="neon"
            className="gap-2 px-12 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Upload className="h-5 w-5" />
                </motion.div>
                Submitting...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Submit Work
              </>
            )}
          </Button>
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-sm text-foreground-muted"
        >
          <p className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Your work will be reviewed by the client. Payment will be released upon approval.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SubmitWorkPage;