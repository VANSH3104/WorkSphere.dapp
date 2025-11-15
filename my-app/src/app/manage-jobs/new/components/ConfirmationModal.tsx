import { Badge } from "@/app/(module)/ui/badge";
import { Button } from "@/app/(module)/ui/button";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/(module)/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";

import {
  Sparkles,
  DollarSign,
  Calendar,
  CheckCircle2,
  Loader2,
  MapPin,
  Clock,
} from "lucide-react";

interface JobFormData {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  paymentType: "full" | "milestone";
  skills: string[];
  category: string;
  visibility: "public" | "private";
  milestones: any[];
  attachments: any[];
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: JobFormData;
  isLoading: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  formData,
  isLoading,
}: ConfirmationModalProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };
  console.log(formData , "data")
  const budgetInSOL = parseFloat(formData.budget) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-panel border-glass-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-neon-gold" />
            <span className="bg-gradient-gold bg-clip-text text-transparent">
              Review & Publish Job
            </span>
          </DialogTitle>
          <DialogDescription className="text-foreground-muted">
            Please review your job details before publishing to the blockchain
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Job Title & Category */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              {formData.title}
            </h3>
            <Badge className="bg-neon-primary/20 text-neon-primary border-neon-primary/30">
              {formData.category}
            </Badge>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground-muted">
              Description
            </h4>
            <p className="text-sm text-foreground leading-relaxed">
              {formData.description}
            </p>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-background-elevated">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-foreground-muted text-xs">
                <DollarSign className="h-4 w-4" />
                <span>Total Budget</span>
              </div>
              <p className="text-lg font-bold text-neon-gold">
                {budgetInSOL.toFixed(2)} SOL
              </p>
              <p className="text-xs text-foreground-muted">
                ≈ {(budgetInSOL * 1_000_000_000).toLocaleString()} lamports
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-foreground-muted text-xs">
                <Calendar className="h-4 w-4" />
                <span>Deadline</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {formatDate(formData.deadline)}
              </p>
            </div>


            <div className="space-y-1">
              <div className="flex items-center gap-2 text-foreground-muted text-xs">
                <MapPin className="h-4 w-4" />
                <span>Visibility</span>
              </div>
              <p className="text-sm font-semibold text-foreground capitalize">
                {formData.visibility}
              </p>
            </div>
          </div>

          {/* Skills */}
          {formData.skills.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground-muted">
                Required Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-neon-primary/10 border border-neon-primary/30 text-neon-primary rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Milestones */}
         

          {/* Important Notice */}
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-warning">
                  Blockchain Transaction
                </p>
                <p className="text-xs text-foreground-muted">
                  This will create a job on the Solana blockchain. After
                  publishing, you&apos;ll be prompted to fund the escrow with{" "}
                  <span className="text-neon-gold font-semibold">
                    {budgetInSOL.toFixed(2)} SOL
                  </span>
                  . Transaction fees may apply.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-glass-border">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border-glass-border hover:bg-glass-primary"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-gradient-gold hover:shadow-gold"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Publish to Blockchain
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}