"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Edit,
  Eye,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  XOctagon,
  Star,
} from "lucide-react";
import { Badge } from "@/app/(module)/ui/badge";
import { Button } from "@/app/(module)/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/(providers)/userProvider";

const ManageJobsPage = () => {
  const navigate = useRouter();
  const user = useUser();
  const role = user?.isFreelancer === true ? "freelancer" : "client";
  console.log(role)
  const searchParams = useSearchParams();
  const userRole = searchParams.get("role") || "client";
  
  // Mock jobs data
  const jobs = [
    {
      id: "1",
      title: "Senior Smart Contract Developer",
      postedDate: "2 days ago",
      budget: 5000,
      status: "Open",
      proposals: 12,
      shortlisted: 3,
      avgBid: 4800,
    },
    {
      id: "2",
      title: "NFT Marketplace UI/UX Design",
      postedDate: "1 day ago",
      budget: 3000,
      status: "In Progress",
      proposals: 8,
      shortlisted: 1,
      hired: "Alex Designer",
    },
    {
      id: "3",
      title: "Full-Stack dApp Development",
      postedDate: "5 days ago",
      budget: 8000,
      status: "Closed",
      proposals: 15,
      completed: true,
    },
  ];

  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  // Mock proposals for selected job
  const proposals = [
    {
      id: "1",
      freelancer: {
        name: "Sarah Johnson",
        rating: 4.9,
        completedJobs: 127,
        avatar: "SJ",
      },
      bid: 4500,
      duration: "2 weeks",
      coverLetter:
        "I have 5+ years of experience in Solidity development and have audited over 50 smart contracts...",
      status: "shortlisted",
    },
    {
      id: "2",
      freelancer: {
        name: "Michael Chen",
        rating: 4.8,
        completedJobs: 89,
        avatar: "MC",
      },
      bid: 5200,
      duration: "10 days",
      coverLetter:
        "As a certified blockchain security expert, I specialize in DeFi protocol audits...",
      status: "shortlisted",
    },
    {
      id: "3",
      freelancer: {
        name: "Emma Williams",
        rating: 5.0,
        completedJobs: 203,
        avatar: "EW",
      },
      bid: 4800,
      duration: "2 weeks",
      coverLetter:
        "With extensive experience in gas optimization and security audits, I can deliver...",
      status: "pending",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-success/20 text-success border-success/30";
      case "In Progress":
        return "bg-warning/20 text-warning border-warning/30";
      case "Closed":
        return "bg-foreground-muted/20 text-foreground-muted border-foreground-muted/30";
      default:
        return "bg-glass-secondary text-foreground-muted";
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-neon-gold/5 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">
            <span className="text-neon bg-gradient-gold bg-clip-text text-transparent">
              Manage Jobs
            </span>
          </h1>
          <p className="text-foreground-muted text-lg">
            Track your posted jobs and manage proposals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Jobs List */}
          <div className="lg:col-span-1 space-y-4">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`glass-card p-6 cursor-pointer hover-lift transition-all ${
                  selectedJob === job.id ? "border-primary shadow-neon" : ""
                }`}
                onClick={() => setSelectedJob(job.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground line-clamp-2">
                    {job.title}
                  </h3>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted">Budget</span>
                    <span className="font-semibold text-neon-gold">
                      ${job.budget}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted">Proposals</span>
                    <span className="font-semibold text-foreground">
                      {job.proposals}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted">Posted</span>
                    <span className="text-foreground-muted">
                      {job.postedDate}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="glass"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate.push(`/jobs/${job.id}?role=${userRole}`);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}

            <Button
              variant="neon"
              className="w-full"
              onClick={() => navigate.push(`/jobs/post?role=${userRole}`)}
            >
              Post New Job
            </Button>
          </div>

          {/* Proposals Panel */}
          <div className="lg:col-span-2">
            {selectedJob ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="glass-card p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Proposals Received
                  </h2>
                  <p className="text-foreground-muted">
                    Review and manage applications for your job
                  </p>
                </div>

                {proposals.map((proposal, index) => (
                  <motion.div
                    key={proposal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="glass-card p-6"
                  >
                    {/* Freelancer Info */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl">
                        {proposal.freelancer.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-foreground">
                            {proposal.freelancer.name}
                          </h3>
                          {proposal.status === "shortlisted" && (
                            <Badge className="bg-neon-gold/20 text-neon-gold border-neon-gold/30">
                              ⭐ Shortlisted
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-neon-gold">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-semibold">
                              {proposal.freelancer.rating}
                            </span>
                          </div>
                          <span className="text-foreground-muted">
                            {proposal.freelancer.completedJobs} jobs completed
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bid Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="glass-panel p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-neon-gold mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-sm text-foreground-muted">
                            Bid Amount
                          </span>
                        </div>
                        <p className="text-xl font-bold text-foreground">
                          ${proposal.bid}
                        </p>
                      </div>
                      <div className="glass-panel p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-neon-cyan mb-1">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm text-foreground-muted">
                            Duration
                          </span>
                        </div>
                        <p className="text-xl font-bold text-foreground">
                          {proposal.duration}
                        </p>
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-foreground mb-2">
                        Cover Letter
                      </h4>
                      <p className="text-foreground-muted line-clamp-3">
                        {proposal.coverLetter}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button variant="neon" className="flex-1 gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Hire Now
                      </Button>
                      {proposal.status !== "shortlisted" && (
                        <Button variant="glass" className="gap-2">
                          <Star className="h-4 w-4" />
                          Shortlist
                        </Button>
                      )}
                      <Button
                        variant="glass"
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <XOctagon className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Users className="h-16 w-16 text-foreground-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Select a job to view proposals
                </h3>
                <p className="text-foreground-muted">
                  Choose a job from the list to manage its proposals
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageJobsPage;
