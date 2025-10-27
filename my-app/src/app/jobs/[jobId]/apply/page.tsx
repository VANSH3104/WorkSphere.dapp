"use client";
import { useState } from "react";
import { motion } from "framer-motion";


import { 
  ArrowLeft,
  Upload,
  CheckCircle,
  DollarSign,
  Clock
} from "lucide-react";
import { useToast } from "@/app/hooks/use-toast";
import { Button } from "@/app/(module)/ui/button";
import { Label } from "@/app/(module)/ui/label";
import { Textarea } from "@/app/(module)/ui/textarea";
import { Input } from "@/app/(module)/ui/input";
import { useParams, useRouter } from "next/navigation";


const JobProposalPage = () => {
  const { jobId } = useParams();
  const navigate = useRouter();
  const userRole = "freelancer";
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    coverLetter: "",
    bidAmount: "",
    duration: "2-weeks",
    attachments: [] as File[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Proposal Submitted Successfully! 🎉",
      description: "The client will review your proposal and get back to you soon.",
    });

    setTimeout(() => {
      navigate.push(`/proposals?role=${userRole}`);
    }, 1500);
  };

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
            onClick={() => navigate.push(`/jobs/${jobId}`)}
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

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Cover Letter */}
          <div className="glass-card p-8">
            <Label htmlFor="coverLetter" className="text-lg font-semibold text-foreground mb-3 block">
              Cover Letter *
            </Label>
            <Textarea
              id="coverLetter"
              required
              rows={10}
              placeholder="Introduce yourself and explain why you're the perfect fit for this job..."
              value={formData.coverLetter}
              onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
              className="bg-background-elevated border-glass-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <p className="text-sm text-foreground-muted mt-2">
              Tip: Highlight your relevant experience and explain your approach to the project
            </p>
          </div>

          {/* Bid & Duration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-8">
              <Label htmlFor="bidAmount" className="text-lg font-semibold text-foreground mb-3 block">
                Your Bid Amount *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neon-gold" />
                <Input
                  id="bidAmount"
                  type="number"
                  required
                  placeholder="5000"
                  value={formData.bidAmount}
                  onChange={(e) => setFormData({ ...formData, bidAmount: e.target.value })}
                  className="pl-12 h-12 bg-background-elevated border-glass-border focus:border-neon-gold focus:ring-2 focus:ring-neon-gold/20"
                />
              </div>
              <p className="text-sm text-foreground-muted mt-2">
                Client&apos;s budget: $5,000
              </p>
            </div>

            <div className="glass-card p-8">
              <Label htmlFor="duration" className="text-lg font-semibold text-foreground mb-3 block">
                Estimated Duration *
              </Label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neon-cyan" />
                <select
                  id="duration"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full h-12 pl-12 pr-4 bg-background-elevated border border-glass-border rounded-lg text-foreground focus:border-neon-cyan focus:ring-2 focus:ring-neon-cyan/20 focus:outline-none transition-all"
                >
                  <option value="1-week">1 Week</option>
                  <option value="2-weeks">2 Weeks</option>
                  <option value="3-weeks">3 Weeks</option>
                  <option value="1-month">1 Month</option>
                  <option value="2-months">2 Months</option>
                  <option value="3-months+">3+ Months</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="glass-card p-8">
            <Label className="text-lg font-semibold text-foreground mb-3 block">
              Attachments (Optional)
            </Label>
            <div className="border-2 border-dashed border-glass-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer group">
              <Upload className="h-12 w-12 text-foreground-muted mx-auto mb-3 group-hover:text-primary transition-colors" />
              <p className="text-foreground mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-foreground-muted">
                PDF, DOC, ZIP (Max 10MB)
              </p>
              <input
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.zip"
              />
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
                disabled={isSubmitting}
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
      </div>
    </div>
  );
};

export default JobProposalPage;