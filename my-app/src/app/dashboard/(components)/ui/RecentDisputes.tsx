import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  AlertTriangle, 
  User, 
  Clock, 
  ThumbsUp, 
  ThumbsDown,
  Eye,
  ChevronDown,
  ChevronUp,
  Scale,
  MessageCircle,
  DollarSign
} from "lucide-react";
import { Button } from "@/app/(module)/ui/button";
import { Badge } from "@/app/(module)/ui/badge";
import { Progress } from "@/app/(module)/ui/progress";


interface Dispute {
  id: string;
  title: string;
  raiser: string;
  respondent: string;
  reason: string;
  status: "open" | "voting" | "resolved" | "escalated";
  amount: string;
  createdAt: string;
  votingProgress: {
    favor: number;
    against: number;
    total: number;
  };
  description: string;
  evidence?: string[];
  timeRemaining?: string;
}

interface RecentDisputesProps {
  userRole: "freelancer" | "client";
}

export const RecentDisputes = ({ userRole }: RecentDisputesProps) => {
  const [expandedDispute, setExpandedDispute] = useState<string | null>(null);

  const disputes: Dispute[] = [
    {
      id: "1",
      title: "Incomplete Smart Contract Delivery",
      raiser: "TechCorp DAO",
      respondent: "BlockDev Pro",
      reason: "Quality Issues",
      status: "voting",
      amount: "150 SOL",
      createdAt: "2 days ago",
      votingProgress: {
        favor: 12,
        against: 3,
        total: 25
      },
      description: "The delivered smart contract does not meet the specified requirements and contains several bugs that prevent proper functionality.",
      evidence: ["Contract Code", "Test Results", "Communication Logs"],
      timeRemaining: "3 days"
    },
    {
      id: "2",
      title: "Payment Delay Dispute",
      raiser: "Web3Builder",
      respondent: "CryptoStartup Inc",
      reason: "Payment Delay",
      status: "open",
      amount: "75 SOL",
      createdAt: "5 hours ago",
      votingProgress: {
        favor: 0,
        against: 0,
        total: 25
      },
      description: "Client has failed to release milestone payment despite project completion and approval.",
      evidence: ["Completion Screenshots", "Client Approval", "Communication"],
      timeRemaining: "6 days"
    },
    {
      id: "3",
      title: "Scope Change Without Agreement",
      raiser: "DesignStudio DAO",
      respondent: "UI/UX Master",
      reason: "Scope Creep",
      status: "resolved",
      amount: "200 SOL",
      createdAt: "1 week ago",
      votingProgress: {
        favor: 18,
        against: 7,
        total: 25
      },
      description: "Freelancer demanding additional payment for work that was part of original scope.",
      evidence: ["Original Contract", "Scope Documentation", "Additional Work"],
      timeRemaining: "Resolved"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-neon-cyan/20 text-neon-cyan border-neon-cyan";
      case "voting":
        return "bg-neon-purple/20 text-neon-purple border-neon-purple";
      case "resolved":
        return "bg-success/20 text-success border-success";
      case "escalated":
        return "bg-destructive/20 text-destructive border-destructive";
      default:
        return "bg-glass-secondary text-foreground-muted border-glass-border";
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case "quality issues":
        return "bg-warning/20 text-warning";
      case "payment delay":
        return "bg-destructive/20 text-destructive";
      case "scope creep":
        return "bg-neon-gold/20 text-neon-gold";
      default:
        return "bg-glass-secondary text-foreground-muted";
    }
  };

  const calculateProgress = (favor: number, total: number) => {
    return total > 0 ? (favor / total) * 100 : 0;
  };

  return (
    <motion.div 
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div 
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-destructive to-neon-purple flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Scale className="w-4 h-4 text-white" />
          </motion.div>
          <h2 className="text-xl font-bold text-foreground">Recent Disputes</h2>
        </div>
        <Button variant="outline" size="sm" className="hover:bg-gradient-primary hover:text-white border-glass-border">
          View All
        </Button>
      </div>

      {disputes.length === 0 ? (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Scale className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
          <p className="text-foreground-muted">No disputes found. Great work maintaining positive relationships!</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {disputes.map((dispute, index) => (
            <motion.div
              key={dispute.id}
              className="glass-panel rounded-xl overflow-hidden hover-lift"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <div 
                className="p-5 cursor-pointer hover:bg-glass-secondary/30 transition-colors duration-300"
                onClick={() => setExpandedDispute(
                  expandedDispute === dispute.id ? null : dispute.id
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {dispute.title}
                      </h3>
                      <Badge className={getStatusColor(dispute.status)}>
                        {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-foreground-muted mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{dispute.raiser} vs {dispute.respondent}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{dispute.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <Badge className={getReasonColor(dispute.reason)}>
                        {dispute.reason}
                      </Badge>
                      <div className="flex items-center text-neon-gold font-semibold">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {dispute.amount}
                      </div>
                    </div>
                  </div>

                  <motion.div
                    animate={{ rotate: expandedDispute === dispute.id ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5 text-foreground-muted" />
                  </motion.div>
                </div>

                {/* Voting Progress Bar */}
                {dispute.status === "voting" && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-foreground-muted">Community Voting Progress</span>
                      <span className="text-foreground">
                        {dispute.votingProgress.favor + dispute.votingProgress.against} / {dispute.votingProgress.total} votes
                      </span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={calculateProgress(dispute.votingProgress.favor, dispute.votingProgress.total)} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-success flex items-center">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          {dispute.votingProgress.favor} favor
                        </span>
                        <span className="text-destructive flex items-center">
                          <ThumbsDown className="w-3 h-3 mr-1" />
                          {dispute.votingProgress.against} against
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {expandedDispute === dispute.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="border-t border-glass-border"
                  >
                    <div className="p-5 space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Description</h4>
                        <p className="text-foreground-muted text-sm">{dispute.description}</p>
                      </div>

                      {dispute.evidence && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Evidence Provided</h4>
                          <div className="flex flex-wrap gap-2">
                            {dispute.evidence.map((evidence, evidenceIndex) => (
                              <Badge key={evidenceIndex} variant="outline" className="text-xs">
                                {evidence}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {dispute.status === "voting" && dispute.timeRemaining && (
                        <div className="flex items-center justify-between p-3 glass-panel rounded-lg">
                          <span className="text-foreground-muted text-sm">Time remaining to vote:</span>
                          <span className="font-semibold text-neon-gold">{dispute.timeRemaining}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-glass-border">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="hover:bg-glass-secondary">
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline" className="hover:bg-glass-secondary">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Messages
                          </Button>
                        </div>

                        {dispute.status === "voting" && (
                          <div className="flex space-x-2">
                            <Button 
                              size="sm" 
                              className="bg-success/20 text-success hover:bg-success hover:text-white border-success"
                            >
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              Vote Favor
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-destructive/20 text-destructive hover:bg-destructive hover:text-white border-destructive"
                            >
                              <ThumbsDown className="w-3 h-3 mr-1" />
                              Vote Against
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};