import { Badge } from "@/app/(module)/ui/badge";
import { Card } from "@/app/(module)/ui/card";
import { motion } from "framer-motion";
import { Calendar, DollarSign, MapPin, Clock, Users, Eye } from "lucide-react";


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

interface JobPreviewCardProps {
  formData: JobFormData;
}

export default function JobPreviewCard({ formData }: JobPreviewCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Eye className="h-5 w-5 text-neon-cyan" />
        <h3 className="text-xl font-semibold text-neon-cyan">Live Preview</h3>
      </div>

      <Card className="glass-panel border border-glass-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {formData.title || "Untitled Job"}
              </h2>
              {formData.category && (
                <Badge className="bg-neon-primary/20 text-neon-primary border-neon-primary/30">
                  {formData.category}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-foreground-muted text-sm line-clamp-4">
              {formData.description || "No description provided yet..."}
            </p>
          </div>

          {/* Skills */}
          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.skills.slice(0, 6).map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-neon-gold/10 border border-neon-gold/30 text-neon-gold rounded-full text-xs"
                >
                  {skill}
                </span>
              ))}
              {formData.skills.length > 6 && (
                <span className="px-3 py-1 bg-glass-primary border border-glass-border text-foreground-muted rounded-full text-xs">
                  +{formData.skills.length - 6} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Details Grid */}
        <div className="px-6 pb-6 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-foreground-muted text-xs">
              <DollarSign className="h-4 w-4" />
              <span>Budget</span>
            </div>
            <p className="text-lg font-semibold text-neon-gold">
              {formData.budget ? `${formData.budget} SOL` : "Not set"}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-foreground-muted text-xs">
              <Calendar className="h-4 w-4" />
              <span>Deadline</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              {formatDate(formData.deadline)}
            </p>
          </div>


          <div className="space-y-1">
            <div className="flex items-center gap-2 text-foreground-muted text-xs">
              <MapPin className="h-4 w-4" />
              <span>Visibility</span>
            </div>
            <p className="text-sm font-medium text-foreground capitalize">
              {formData.visibility}
            </p>
          </div>
        </div>


        {/* Attachments */}
        {formData.attachments.length > 0 && (
          <div className="px-6 pb-6">
            <div className="bg-background-elevated rounded-lg p-4">
              <h4 className="text-sm font-semibold text-neon-gold mb-2">
                Attachments ({formData.attachments.length})
              </h4>
              <div className="space-y-1">
                {formData.attachments.slice(0, 3).map((file) => (
                  <div
                    key={file.cid}
                    className="text-xs text-foreground-muted flex justify-between"
                  >
                    <span className="truncate">{file.name}</span>
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                ))}
                {formData.attachments.length > 3 && (
                  <p className="text-xs text-foreground-muted text-center pt-1">
                    +{formData.attachments.length - 3} more files
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Info Box */}
      <div className="glass-panel p-4 rounded-lg border border-glass-border">
        <p className="text-xs text-foreground-muted text-center">
          This is how your job will appear to freelancers
        </p>
      </div>
    </motion.div>
  );
}