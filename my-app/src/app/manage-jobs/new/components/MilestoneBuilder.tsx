import { Alert, AlertDescription } from "@/app/(module)/ui/alert";
import { Button } from "@/app/(module)/ui/button";
import { Input } from "@/app/(module)/ui/input";
import { Label } from "@/app/(module)/ui/label";
import { Textarea } from "@/app/(module)/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Calendar, DollarSign, AlertCircle } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date | string | null;
  amount: number | string;
}

interface MilestoneBuilderProps {
  milestones: Milestone[];
  budget: number | string;
  onChange: (milestones: Milestone[]) => void;
  onAutoSplit: () => void;
  error?: string;
}

export default function MilestoneBuilder({
  milestones,
  budget,
  onChange,
  onAutoSplit,
  error,
}: MilestoneBuilderProps) {
  const addMilestone = () => {
    if (milestones.length >= 10) return;

    const newMilestone: Milestone = {
      id: `milestone_${Date.now()}`,
      title: "",
      description: "",
      dueDate: null,
      amount: 0,
    };

    onChange([...milestones, newMilestone]);
  };

  const removeMilestone = (id: string) => {
    onChange(milestones.filter((m) => m.id !== id));
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    onChange(milestones.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  // Normalize numbers for calculations
  const totalMilestoneAmount = milestones.reduce((sum, m) => {
    const numeric = typeof m.amount === "number" ? m.amount : parseFloat(String(m.amount)) || 0;
    return sum + numeric;
  }, 0);

  const budgetNumber = typeof budget === "number" ? budget : parseFloat(String(budget)) || 0;
  const remaining = budgetNumber - totalMilestoneAmount;

  return (
    <div className="glass-panel p-6 rounded-xl border border-glass-border space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-neon-primary flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-neon-primary/20 flex items-center justify-center text-sm">
            3
          </div>
          Milestone Builder
        </h2>
        <div className="text-sm">
          <span className="text-foreground-muted">Total: </span>
          <span
            className={`font-semibold ${
              Math.abs(remaining) < 0.001 ? "text-success" : "text-warning"
            }`}
          >
            {totalMilestoneAmount.toFixed(2)} / {budgetNumber.toFixed(2)} SOL
          </span>
        </div>
      </div>

      {error && (
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">{error}</AlertDescription>
        </Alert>
      )}

      {Math.abs(remaining) > 0.001 && milestones.length > 0 && (
        <Alert className="border-warning/50 bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-warning">
              {remaining > 0
                ? `${remaining.toFixed(2)} SOL remaining`
                : `${Math.abs(remaining).toFixed(2)} SOL over budget`}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onAutoSplit}
              className="ml-4 border-warning/50 text-warning hover:bg-warning/20"
            >
              Auto Split Budget
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <AnimatePresence mode="popLayout">
        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.2 }}
            className="p-4 rounded-lg bg-background-elevated border border-input-border space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neon-gold">Milestone {index + 1}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMilestone(milestone.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-foreground text-sm">Title *</Label>
                <Input
                  value={milestone.title}
                  onChange={(e) => updateMilestone(milestone.id, { title: e.target.value })}
                  placeholder="e.g., Design mockups completed"
                  maxLength={100}
                  className="mt-1 bg-background-elevated border-input-border focus:border-border-glow focus:ring-2 focus:ring-primary-glow"
                />
                <span className="text-xs text-foreground-muted">{milestone.title.length}/100</span>
              </div>

              <div>
                <Label className="text-foreground text-sm">Description *</Label>
                <Textarea
                  value={milestone.description}
                  onChange={(e) => updateMilestone(milestone.id, { description: e.target.value })}
                  placeholder="Describe what needs to be delivered for this milestone..."
                  maxLength={1000}
                  rows={3}
                  className="mt-1 bg-background-elevated border-input-border focus:border-border-glow focus:ring-2 focus:ring-primary-glow resize-none"
                />
                <span className="text-xs text-foreground-muted">{milestone.description.length}/1000</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-foreground text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Due Date *
                  </Label>

                  <Input
                    type="date"
                    value={
                      milestone.dueDate
                        ? new Date(milestone.dueDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      updateMilestone(milestone.id, {
                        dueDate: e.target.value ? new Date(e.target.value) : null,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="mt-1 bg-background-elevated border-input-border focus:border-border-glow focus:ring-2 focus:ring-primary-glow"
                  />
                </div>

                <div>
                  <Label className="text-foreground text-sm flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Amount (SOL) *
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    // always pass a string to value to keep input controlled
                    value={milestone.amount !== undefined && milestone.amount !== null ? String(milestone.amount) : ""}
                    onChange={(e) =>
                      updateMilestone(milestone.id, {
                        // convert to number for internal consistency
                        amount: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    className="mt-1 bg-background-elevated border-input-border focus:border-border-glow focus:ring-2 focus:ring-primary-glow"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {milestones.length < 10 && (
        <Button
          variant="outline"
          onClick={addMilestone}
          className="w-full border-dashed border-2 border-neon-primary/30 hover:border-neon-primary hover:bg-neon-primary/10"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Milestone ({milestones.length}/10)
        </Button>
      )}

      {milestones.length === 0 && (
        <p className="text-center text-foreground-muted text-sm py-4">
          Add milestones to break down the project into manageable phases
        </p>
      )}
    </div>
  );
}
