"use client";
import { motion } from "framer-motion";

import { 
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  Star,
  Eye,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "../(module)/ui/badge";
import { Button } from "../(module)/ui/button";

const ProposalManagementPage = () => {
  const navigate = useRouter();
  const userRole = "freelancer";

  // Mock proposals data
  const proposals = [
    {
      id: "1",
      job: {
        id: "1",
        title: "Senior Smart Contract Developer",
        client: "DeFi Labs"
      },
      bid: 4500,
      duration: "2 weeks",
      submittedDate: "2 days ago",
      status: "shortlisted",
      clientResponse: "We're impressed with your profile. Can you start next week?"
    },
    {
      id: "2",
      job: {
        id: "2",
        title: "NFT Marketplace UI/UX Design",
        client: "NFT Studio"
      },
      bid: 2800,
      duration: "3 weeks",
      submittedDate: "1 day ago",
      status: "pending",
      views: 3
    },
    {
      id: "3",
      job: {
        id: "3",
        title: "Full-Stack dApp Development",
        client: "Crypto Ventures"
      },
      bid: 7500,
      duration: "6 weeks",
      submittedDate: "5 days ago",
      status: "hired",
      clientResponse: "Congratulations! You've been selected for this project."
    },
    {
      id: "4",
      job: {
        id: "4",
        title: "DAO Governance Platform",
        client: "DAO Builders"
      },
      bid: 11000,
      duration: "8 weeks",
      submittedDate: "1 week ago",
      status: "rejected",
      clientResponse: "We decided to go with another candidate. Thank you for your interest."
    }
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-warning/20 text-warning border-warning/30",
          icon: Clock,
          label: "Under Review"
        };
      case "shortlisted":
        return {
          color: "bg-neon-gold/20 text-neon-gold border-neon-gold/30",
          icon: Star,
          label: "Shortlisted"
        };
      case "hired":
        return {
          color: "bg-success/20 text-success border-success/30",
          icon: CheckCircle2,
          label: "Hired"
        };
      case "rejected":
        return {
          color: "bg-destructive/20 text-destructive border-destructive/30",
          icon: XCircle,
          label: "Not Selected"
        };
      default:
        return {
          color: "bg-foreground-muted/20 text-foreground-muted",
          icon: AlertCircle,
          label: status
        };
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">
            <span className="text-neon bg-gradient-primary bg-clip-text text-transparent">
              My Proposals
            </span>
          </h1>
          <p className="text-foreground-muted text-lg">
            Track the status of all your job applications
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 text-warning mb-2">
              <Clock className="h-5 w-5" />
              <span className="text-sm text-foreground-muted">Pending</span>
            </div>
            <p className="text-3xl font-bold text-foreground">1</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-2 text-neon-gold mb-2">
              <Star className="h-5 w-5" />
              <span className="text-sm text-foreground-muted">Shortlisted</span>
            </div>
            <p className="text-3xl font-bold text-foreground">1</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-2 text-success mb-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm text-foreground-muted">Hired</span>
            </div>
            <p className="text-3xl font-bold text-foreground">1</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <XCircle className="h-5 w-5" />
              <span className="text-sm text-foreground-muted">Not Selected</span>
            </div>
            <p className="text-3xl font-bold text-foreground">1</p>
          </div>
        </motion.div>

        {/* Proposals List */}
        <div className="space-y-4">
          {proposals.map((proposal, index) => {
            const statusConfig = getStatusConfig(proposal.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="glass-card p-6 hover-lift"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {proposal.job.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-foreground-muted">
                      <span>{proposal.job.client}</span>
                      <span>•</span>
                      <span>Submitted {proposal.submittedDate}</span>
                    </div>
                  </div>
                  <Badge className={statusConfig.color + " gap-2"}>
                    <StatusIcon className="h-4 w-4" />
                    {statusConfig.label}
                  </Badge>
                </div>

                {/* Bid Details */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="glass-panel p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-neon-gold mb-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs text-foreground-muted">Your Bid</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">${proposal.bid}</p>
                  </div>

                  <div className="glass-panel p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-neon-cyan mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs text-foreground-muted">Duration</span>
                    </div>
                    <p className="text-lg font-bold text-foreground">{proposal.duration}</p>
                  </div>

                  {proposal.views !== undefined && (
                    <div className="glass-panel p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-neon-purple mb-1">
                        <Eye className="h-4 w-4" />
                        <span className="text-xs text-foreground-muted">Views</span>
                      </div>
                      <p className="text-lg font-bold text-foreground">{proposal.views}</p>
                    </div>
                  )}
                </div>

                {/* Client Response */}
                {proposal.clientResponse && (
                  <div className="glass-panel p-4 rounded-lg mb-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      Client Message:
                    </h4>
                    <p className="text-sm text-foreground-muted">
                      {proposal.clientResponse}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="glass"
                    className="gap-2"
                    onClick={() => navigate.push(`/jobs/${proposal.job.id}?role=${userRole}`)}
                  >
                    <Eye className="h-4 w-4" />
                    View Job
                  </Button>

                  {proposal.status === "hired" && (
                    <Button variant="neon" className="gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Start Work
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State (if no proposals) */}
        {proposals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center"
          >
            <AlertCircle className="h-16 w-16 text-foreground-muted mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              No Proposals Yet
            </h3>
            <p className="text-foreground-muted mb-6">
              Start applying to jobs to see your proposals here
            </p>
            <Button
              variant="neon"
              onClick={() => navigate.push(`/jobs`)}
            >
              Browse Jobs
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProposalManagementPage;