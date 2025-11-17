"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import { 
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Clock
} from "lucide-react";
import { useToast } from "@/app/hooks/use-toast";
import { Button } from "@/app/(module)/ui/button";
import { Label } from "@/app/(module)/ui/label";
import { Input } from "@/app/(module)/ui/input";
import { useParams, useRouter } from "next/navigation";
import { getProgram } from "@/(anchor)/setup";

// Import your IDL
// import idl from "@/idl/your_program.json";

const JobProposalPage = () => {
  const { jobId } = useParams();
  const navigate = useRouter();
  const { toast } = useToast();
  const { publicKey, signTransaction, signAllTransactions , wallet  } = useWallet();
  const { connection } = useConnection();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bidAmount: "",
    coverLetter: "",
    skills: [] as string[],
    experience: "",
  });


  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const program = getProgram(wallet.adapter);
      
      // Validation
      if (!publicKey) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to submit a proposal.",
          variant: "destructive",
        });
        return;
      }
  
      if (!formData.bidAmount || parseFloat(formData.bidAmount) <= 0) {
        toast({
          title: "Invalid Bid Amount",
          description: "Please enter a valid bid amount greater than 0.",
          variant: "destructive",
        });
        return;
      }
  
      setIsSubmitting(true);
  
      try {
        const bidAmountLamports = new BN(parseFloat(formData.bidAmount) * 1e9);
  
        // ✅ Use the job account address directly from URL
        const jobAccount = new PublicKey(jobId);
  
        // ✅ Derive user PDA (this is correct)
        const [userPDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("user"), publicKey.toBuffer()],
          program.programId
        );
  
        const jobData = await program.account.job.fetch(jobAccount);
        const numericJobId = jobData.jobId;
        const tx = await program.methods
          .submitProposal(
            new BN(numericJobId),
            bidAmountLamports
          )
          .accounts({
            job: jobAccount,
            user: userPDA,
            freelancer: publicKey,
          })
          .rpc();
  
        console.log("Transaction signature:", tx);
  
        toast({
          title: "Proposal Submitted Successfully! 🎉",
          description: "The client will review your proposal and get back to you soon.",
        });
  
        setTimeout(() => {
          navigate.push(`/jobs/${jobId}?role=freelancer`);
        }, 1500);
  
      }  catch (error: any) {
        console.error("Full error:", error);
        alert(error)
        let errorMessage = "Failed to submit proposal. Please try again.";
      
        // Direct check for the specific error you're seeing
        if (
          error.code === 6020 ||
          error.message?.includes("AlreadySubmittedBid") ||
          error.message?.includes("6020") ||
          (error.logs && error.logs.some((log: string) => log.includes("AlreadySubmittedBid")))
        ) {
          errorMessage = "You have already submitted a proposal for this job.";
        }
      
        toast({
          title: "Submission Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-neon-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate.push(`/jobs`)}
            className="gap-2 hover:text-neon-cyan"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job Details
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-neon bg-gradient-primary bg-clip-text text-transparent">
              Submit Your Proposal
            </span>
          </h1>
          <p className="text-foreground-muted text-lg">
            Craft a compelling proposal to stand out from other applicants
          </p>
        </motion.div>

        {/* Wallet Connection Warning */}
        {!publicKey && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-6 border-2 border-yellow-500/20"
          >
            <p className="text-yellow-500 text-center">
              ⚠️ Please connect your wallet to submit a proposal
            </p>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >

          {/* Bid Amount */}
          <div className="glass-card p-8">
            <Label htmlFor="bidAmount" className="text-lg font-semibold text-foreground mb-3 block">
              Your Bid Amount (SOL) *
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neon-gold ">Sol</div>
              <Input
                id="bidAmount"
                type="number"
                step="0.01"
                required
                placeholder="5.00"
                value={formData.bidAmount}
                onChange={(e) => setFormData({ ...formData, bidAmount: e.target.value })}
                className="pl-12 h-14 text-lg bg-background-elevated border-glass-border focus:border-neon-gold focus:ring-2 focus:ring-neon-gold/20"
                disabled={!publicKey}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <p className="text-foreground-muted">
                Enter your proposed amount in SOL
              </p>
              <p className="text-neon-gold font-semibold">
                ≈ ${formData.bidAmount ? (parseFloat(formData.bidAmount) * 141.78).toFixed(2) : '0.00'} USD
              </p>
            </div>
          </div>


          {/* Timeline Preview */}
          <div className="glass-card p-8 bg-gradient-to-br from-neon-purple/5 to-neon-cyan/5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-neon-cyan/10 rounded-lg">
                <Clock className="h-6 w-6 text-neon-cyan" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Project Timeline</h3>
                <p className="text-sm text-foreground-muted mb-3">
                  Once your proposal is accepted, the client will deposit funds into escrow and you can begin work immediately.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                    <span className="text-foreground-muted">Proposal Review</span>
                  </div>
                  <span className="text-foreground-muted">→</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neon-purple" />
                    <span className="text-foreground-muted">Escrow Deposit</span>
                  </div>
                  <span className="text-foreground-muted">→</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neon-gold" />
                    <span className="text-foreground-muted">Start Work</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="glass-card p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Ready to submit?</h3>
                <p className="text-sm text-foreground-muted">
                  Make sure all information is accurate before submitting
                </p>
              </div>
              <Button
                type="submit"
                variant="neon"
                size="lg"
                disabled={isSubmitting || !publicKey}
                className="gap-2 min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Submit Proposal
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.form>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 mt-6"
        >
          <h3 className="font-semibold text-foreground mb-3">📝 Important Notes:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li>• Your proposal will be stored on the Solana blockchain</li>
            <li>• You can only submit one proposal per job</li>
            <li>• Make sure you&apos;re registered as a freelancer before submitting</li>
            <li>• Transaction fees will apply for submitting your proposal</li>
            <li>• You cannot bid on jobs you created</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default JobProposalPage;