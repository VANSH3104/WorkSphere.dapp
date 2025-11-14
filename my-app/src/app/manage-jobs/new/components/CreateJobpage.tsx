  "use client"
  import { useState, useEffect } from "react";
  import { motion } from "framer-motion";
  import { ArrowLeft, Sparkles, Wallet } from "lucide-react";
  import { Button } from "@/app/(module)/ui/button";
  import { Alert, AlertDescription } from "@/app/(module)/ui/alert";
  import { Label } from "@/app/(module)/ui/label";
  import { Input } from "@/app/(module)/ui/input";
  import { Textarea } from "@/app/(module)/ui/textarea";
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/(module)/ui/select";
  import MilestoneBuilder from "./MilestoneBuilder";
  import JobPreviewCard from "./JobPreviewCard";
  import ConfirmationModal from "./ConfirmationModal";
  import { useToast } from "@/app/(module)/ui/use-toast";
  import { useRouter } from "next/navigation";
  import { findJobPDA, getProgram, getUserJobCount, programId } from "@/(anchor)/setup";
  import { useWallet } from "@solana/wallet-adapter-react";
  import { BN } from "@coral-xyz/anchor";
  import * as anchor from "@coral-xyz/anchor";
  import sha256 from 'crypto-js/sha256';
  import { enc } from 'crypto-js';
import { PublicKey, SystemProgram } from "@solana/web3.js";
  
  interface Milestone {
    id: string;
    title: string;
    description: string;
    due_date: string; // Changed to string
    amount: number;
  }
  
  interface JobFormData {
    title: string;
    description: string;
    budget: string;
    deadline: string;
    paymentType: "full" | "milestone";
    skills: string[];
    category: string;
    visibility: "public" | "private";
    invitedWallets: string[];
    biddingWindow: string;
    milestones: Milestone[];
    attachments: Array<{ cid: string; name: string; size: number }>;
  }
  
  const CATEGORIES = [
    "Web Development",
    "Mobile Development",
    "Blockchain & Web3",
    "Design & Creative",
    "Writing & Content",
    "Marketing & Sales",
    "Data & Analytics",
    "AI & Machine Learning",
    "other"
  ];
  
  const SKILLS_OPTIONS = [
    "React", "TypeScript", "Solana", "Rust", "Python", "Node.js",
    "Smart Contracts", "Web3", "UI/UX Design", "Figma", "Photoshop",
    "Content Writing", "SEO", "Marketing", "Data Analysis", "Machine Learning", "other"
  ];
  
  export default function CreateJobPage() {
    const navigate = useRouter();
    const { toast } = useToast();
    const [isWalletConnected, setIsWalletConnected] = useState(true);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
  
    const [formData, setFormData] = useState<JobFormData>({
      title: "",
      description: "",
      budget: "",
      deadline: "",
      paymentType: "full",
      skills: [],
      category: "",
      visibility: "public",
      invitedWallets: [],
      biddingWindow: "",
      milestones: [],
      attachments: [],
    });
    
    const { wallet } = useWallet();
  
    // Auto-save draft to localStorage
    useEffect(() => {
      const draftKey = "job-creation-draft";
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setFormData(draft);
        } catch (e) {
          console.error("Failed to load draft", e);
        }
      }
    }, []);
  
    useEffect(() => {
      const draftKey = "job-creation-draft";
      const interval = setInterval(() => {
        localStorage.setItem(draftKey, JSON.stringify(formData));
      }, 5000);
  
      return () => clearInterval(interval);
    }, [formData]);
  
    const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};
  
      // Title validation
      if (formData.title.length < 10) {
        newErrors.title = "Title must be at least 10 characters";
      } else if (formData.title.length > 100) {
        newErrors.title = "Title must not exceed 100 characters";
      }
  
      // Description validation
      if (formData.description.length < 100) {
        newErrors.description = "Description must be at least 100 characters";
      } else if (formData.description.length > 1000) {
        newErrors.description = "Description must not exceed 1000 characters";
      }
  
      // Budget validation
      const budget = parseFloat(formData.budget);
      if (!formData.budget || isNaN(budget) || budget <= 0) {
        newErrors.budget = "Please enter a valid budget in SOL";
      }
  
      // Deadline validation
      if (!formData.deadline) {
        newErrors.deadline = "Please select a deadline";
      } else {
        const deadlineDate = new Date(formData.deadline);
        if (deadlineDate <= new Date()) {
          newErrors.deadline = "Deadline must be in the future";
        }
      }
  
      // Category validation
      if (!formData.category) {
        newErrors.category = "Please select a category";
      }
  
      // Skills validation
      if (formData.skills.length === 0) {
        newErrors.skills = "Please select at least one skill";
      } else if (formData.skills.length > 10) {
        newErrors.skills = "Maximum 10 skills allowed";
      }
  
      // Milestone validation
      if (formData.paymentType === "milestone") {
        if (formData.milestones.length === 0) {
          newErrors.milestones = "Please add at least one milestone";
        } else if (formData.milestones.length > 10) {
          newErrors.milestones = "Maximum 10 milestones allowed";
        } else {
          const totalMilestoneAmount = formData.milestones.reduce(
            (sum, m) => sum + m.amount,
            0
          );
          if (Math.abs(totalMilestoneAmount - budget) > 0.001) {
            newErrors.milestones = `Milestone amounts (${totalMilestoneAmount.toFixed(2)} SOL) must equal budget (${budget.toFixed(2)} SOL)`;
          }
        }
      }
  
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handlePublish = () => {
      if (!validateForm()) {
        toast({
          title: "Validation Error",
          description: "Please fix the errors before publishing",
          variant: "destructive",
        });
        return;
      }
      setShowConfirmation(true);
    };
  
    const handleConfirmPublish = async () => {
      setIsPublishing(true);
    
      try {
        if (!wallet?.adapter?.publicKey) {
          alert("Please connect your wallet first!");
          return;
        }
    
        const program = getProgram(wallet.adapter);
        const authority = wallet.adapter.publicKey;
    
        // 1️⃣ Generate jobId ONCE and use it consistently
        const jobId = Date.now();
        const jobIdBN = new BN(jobId);
        
        console.log("🆔 jobId:", jobId);
    
        // 2️⃣ Derive PDA using the SAME jobId
        const [jobPda] = findJobPDA(authority, jobIdBN);
        console.log("🔑 Job PDA:", jobPda.toString());
    
        // 🔍 CRITICAL VERIFICATION - Manually verify the seeds
        const jobIdBytes = jobIdBN.toArrayLike(Buffer, 'le', 8);
        const seeds = [
          Buffer.from("job"), 
          authority.toBuffer(), 
          jobIdBytes
        ];
        
        console.log("🔍 MANUAL VERIFICATION:");
        console.log("Seed 0 (string 'job'):", Buffer.from("job").toString('hex'));
        console.log("Seed 1 (authority):", authority.toString());
        console.log("Seed 2 (jobId bytes):", Buffer.from(jobIdBytes).toString('hex'));
        console.log("Expected PDA from seeds:", PublicKey.findProgramAddressSync(seeds, programId)[0].toString());
        console.log("Our PDA:", jobPda.toString());
        console.log("Match?", PublicKey.findProgramAddressSync(seeds, programId)[0].equals(jobPda));
    
        // Rest of your code remains the same...
        const deadlineUnix = new BN(Math.floor(new Date(formData.deadline).getTime() / 1000));
        const budgetLamports = new BN(Math.floor(parseFloat(formData.budget) * 1_000_000_000));
    
        const milestonesWithBN = formData.milestones.map(m => ({
          title: m.title,
          description: m.description,
          amount: new BN(Math.floor(m.amount * 1_000_000_000)),
          due_date: new BN(Math.floor(new Date(m.due_date).getTime() / 1000)),
          completed: false,
        }));
    
        console.log("📦 Transaction data:", {
          title: formData.title,
          jobId: jobIdBN.toString(),
          budget: budgetLamports.toString(),
          deadline: deadlineUnix.toString(),
          milestones: milestonesWithBN.length,
        });
    
        // 4️⃣ Send transaction
        const tx = await program.methods
          .createJob(
            formData.title,
            jobIdBN,
            formData.description,
            budgetLamports,
            deadlineUnix,
            milestonesWithBN,
            formData.skills,
            formData.category || ""
          )
          .accounts({
            job: jobPda,
            authority,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
    
        console.log("✅ Transaction successful:", tx);
    
        localStorage.removeItem("job-creation-draft");
    
        toast({
          title: "Job Created!",
          description: `Transaction: ${tx}`,
        });
    
        setTimeout(() => {
          navigate.push("/dashboard");
        }, 2000);
    
      } catch (error: any) {
        console.error("❌ FULL ERROR:", error);
        console.error("❌ Error logs:", error.logs);
    
        let errorMessage = "Failed to create job";
    
        if (error.message?.includes("0x1")) {
          errorMessage = "Invalid deadline - must be in the future";
        } else if (error.message?.includes("0x1770")) {
          errorMessage = "Milestone amounts don't match total budget";
        } else if (error.message) {
          errorMessage = error.message;
        }
    
        toast({
          title: "Error Creating Job",
          description: errorMessage,
          variant: "destructive",
        });
    
      } finally {
        setIsPublishing(false);
        setShowConfirmation(false);
      }
    };

    const autoSplitMilestones = () => {
      const budget = parseFloat(formData.budget);
      if (isNaN(budget) || budget <= 0 || formData.milestones.length === 0) return;
  
      const amountPerMilestone = budget / formData.milestones.length;
      const updatedMilestones = formData.milestones.map(m => ({
        ...m,
        amount: parseFloat(amountPerMilestone.toFixed(4)),
      }));
  
      setFormData({ ...formData, milestones: updatedMilestones });
      toast({
        title: "Budget Split",
        description: `${amountPerMilestone.toFixed(4)} SOL per milestone`,
      });
    };
  
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0 opacity-30">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-primary rounded-full blur-[120px]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-gold rounded-full blur-[120px]"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />
        </div>
  
        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => navigate.push("/dashboard")}
              className="mb-4 hover:bg-glass-primary"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
  
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-8 w-8 text-neon-gold" />
              <h1 className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                Create New Job
              </h1>
            </div>
            <p className="text-foreground-muted text-lg">
              Post your project and connect with talented freelancers on Web3
            </p>
          </motion.div>
  
          {/* Wallet Warning */}
          {!isWalletConnected && (
            <Alert className="mb-6 border-warning/50 bg-warning/10">
              <Wallet className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning">
                Please connect your wallet to create a job
              </AlertDescription>
            </Alert>
          )}
  
          {/* Form Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Basic Info */}
              <div className="glass-panel p-6 rounded-xl border border-glass-border space-y-4">
                <h2 className="text-2xl font-semibold text-neon-primary flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-neon-primary/20 flex items-center justify-center text-sm">1</div>
                  Basic Information
                </h2>
  
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-foreground">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Build a DeFi Dashboard on Solana"
                      maxLength={100}
                      className="mt-1.5 bg-background-elevated border-input-border focus:border-border-glow focus:ring-2 focus:ring-primary-glow"
                    />
                    <div className="flex justify-between mt-1 text-xs">
                      <span className={errors.title ? "text-destructive" : "text-foreground-muted"}>
                        {errors.title || `${formData.title.length}/100 characters`}
                      </span>
                    </div>
                  </div>
  
                  <div>
                    <Label htmlFor="description" className="text-foreground">Job Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your project in detail, including requirements, deliverables, and expectations..."
                      maxLength={1000}
                      rows={6}
                      className="mt-1.5 bg-background-elevated border-input-border focus:border-border-glow focus:ring-2 focus:ring-primary-glow resize-none"
                    />
                    <div className="flex justify-between mt-1 text-xs">
                      <span className={errors.description ? "text-destructive" : "text-foreground-muted"}>
                        {errors.description || `${formData.description.length}/1000 characters`}
                      </span>
                    </div>
                  </div>
  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category" className="text-foreground">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger className="mt-1.5 bg-background-elevated border-input-border focus:border-border-glow focus:ring-2 focus:ring-primary-glow">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-background-elevated border-glass-border z-50">
                          {CATEGORIES.map((cat) => (
                            <SelectItem 
                              key={cat} 
                              value={cat}
                              className="focus:bg-glass-primary focus:text-foreground"
                            >
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
                    </div>
  
                    <div>
                      <Label htmlFor="skills" className="text-foreground">Skills Required * (Max 10)</Label>
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (value && !formData.skills.includes(value) && formData.skills.length < 10) {
                            setFormData({ ...formData, skills: [...formData.skills, value] });
                          }
                        }}
                      >
                        <SelectTrigger className="mt-1.5 bg-background-elevated border-input-border focus:border-border-glow focus:ring-2 focus:ring-primary-glow">
                          <SelectValue placeholder="Add skills" />
                        </SelectTrigger>
                        <SelectContent className="bg-background-elevated border-glass-border z-50">
                          {SKILLS_OPTIONS.filter(skill => !formData.skills.includes(skill)).map((skill) => (
                            <SelectItem 
                              key={skill} 
                              value={skill}
                              className="focus:bg-glass-primary focus:text-foreground"
                            >
                              {skill}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.skills && <p className="text-xs text-destructive mt-1">{errors.skills}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.skills.map((skill) => (
                          <motion.span
                            key={skill}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="px-3 py-1.5 bg-neon-primary/10 border border-neon-primary/30 text-neon-primary rounded-full text-xs flex items-center gap-2 cursor-pointer hover:bg-neon-primary/20 transition-colors"
                            onClick={() => setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) })}
                          >
                            {skill}
                            <span className="text-neon-primary/70 hover:text-neon-primary">×</span>
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Budget & Timeline */}
              <div className="glass-panel p-6 rounded-xl border border-glass-border space-y-4">
                <h2 className="text-2xl font-semibold text-neon-primary flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-neon-primary/20 flex items-center justify-center text-sm">2</div>
                  Budget & Timeline
                </h2>
  
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget" className="text-foreground">Total Budget (SOL) *</Label>
                    <Input
                      id="budget"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      placeholder="0.00"
                      className="mt-1.5 bg-background-elevated border-input-border focus:border-border-glow focus:ring-2 focus:ring-primary-glow"
                    />
                    {errors.budget && <p className="text-xs text-destructive mt-1">{errors.budget}</p>}
                  </div>
  
                  <div>
                    <Label htmlFor="deadline" className="text-foreground">Deadline *</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1.5 bg-background-elevated border-input-border focus:border-border-glow focus:ring-2 focus:ring-primary-glow"
                    />
                    {errors.deadline && <p className="text-xs text-destructive mt-1">{errors.deadline}</p>}
                  </div>
                </div>
  
                <div>
                  <Label htmlFor="paymentType" className="text-foreground">Payment Type *</Label>
                  <Select value={formData.paymentType} onValueChange={(value: "full" | "milestone") => setFormData({ ...formData, paymentType: value })}>
                    <SelectTrigger className="mt-1.5 bg-background-elevated border-input-border focus:border-border-glow focus:ring-2 focus:ring-primary-glow">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background-elevated border-glass-border z-50">
                      <SelectItem value="full" className="focus:bg-glass-primary focus:text-foreground">
                        Full Payment (Pay on completion)
                      </SelectItem>
                      <SelectItem value="milestone" className="focus:bg-glass-primary focus:text-foreground">
                        Milestone-Based (Pay per milestone)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
  
              {/* Milestones */}
              {formData.paymentType === "milestone" && (
                <MilestoneBuilder
                  milestones={formData.milestones}
                  budget={parseFloat(formData.budget) || 0}
                  onChange={(milestones) => setFormData({ ...formData, milestones })}
                  onAutoSplit={autoSplitMilestones}
                  error={errors.milestones}
                />
              )}
  
              {/* Action Buttons */}
              <div className="flex gap-4 sticky bottom-4 lg:relative lg:bottom-0">
                <Button
                  variant="outline"
                  onClick={() => navigate.push("/dashboard")}
                  className="flex-1 border-glass-border hover:bg-glass-primary"
                >
                  Save Draft
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={!isWalletConnected || isPublishing}
                  className="flex-1 bg-gradient-gold hover:shadow-gold"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Publish Job
                </Button>
              </div>
            </motion.div>
  
            {/* Preview Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-8">
                <JobPreviewCard formData={formData} />
              </div>
            </motion.div>
          </div>
        </div>
  
        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmPublish}
          formData={formData}
          isLoading={isPublishing}
        />
      </div>
    );
  }