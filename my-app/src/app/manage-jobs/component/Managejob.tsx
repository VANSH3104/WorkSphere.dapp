"use client";
import { useEffect, useState } from "react";
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
  Filter,
  Plus,
} from "lucide-react";
import { Badge } from "@/app/(module)/ui/badge";
import { Button } from "@/app/(module)/ui/button";
import { Card } from "@/app/(module)/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/(providers)/userProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchJobs } from "@/(anchor)/actions/fetchjob";

const ManageJobsPage = () => {
  const navigate = useRouter();
  const user = useUser();
  const role = user?.isFreelancer === true ? "freelancer" : "client";
  const searchParams = useSearchParams();
  const userRole = searchParams.get("role") || "client";
  const { wallet } = useWallet();
  const [jobs, setJobs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const loadJobs = async () => {
      if (!wallet?.adapter?.publicKey) {
        setJobs([]);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log(wallet.adapter, "adapter");
        
        const data = await fetchJobs(wallet.adapter, {
          clientFilter: wallet.adapter.publicKey,
          statusFilter: statusFilter === 'all' ? 'all' : statusFilter
        });
        
        setJobs(data);
      } catch (err) {
        console.error('Failed to load jobs:', err);
        setError('Failed to load jobs. Please try again.');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadJobs();
  }, [wallet?.adapter?.publicKey, statusFilter]);

  // Mock proposals data (you can replace this with real data)
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
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "inprogress":
      case "in_progress":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "completed":
        return "bg-gray-500/20 text-gray-500 border-gray-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      case "disputed":
        return "bg-orange-500/20 text-orange-500 border-orange-500/30";
      default:
        return "bg-glass-secondary text-foreground-muted";
    }
  };

  const formatJobStatus = (status: string) => {
    const statusKey = Object.keys(status)[0];
    return statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
  };

  const formatBudget = (budget: number) => {
    return `${budget} SOL`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading jobs...</div>
      </div>
    );
  }

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
        {/* Header with Post New Job Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-3">
              <span className="text-neon bg-gradient-gold bg-clip-text text-transparent">
                Manage Jobs
              </span>
            </h1>
            <p className="text-foreground-muted text-lg">
              Track your posted jobs and manage proposals
            </p>
          </div>
          
          <Button
            variant="neon"
            className="flex items-center gap-2"
            onClick={() => navigate.push(`/manage-jobs/new`)}
          >
            <Plus className="h-4 w-4" />
            Post New Job
          </Button>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="glass-panel p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-foreground-muted" />
                <span className="text-sm font-medium text-foreground">Filter by Status:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["all", "open", "inProgress", "completed", "cancelled", "disputed"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "neon" : "glass"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === "all" ? "All Jobs" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Jobs List */}
          <div className="lg:col-span-1 space-y-4">
            {jobs.length === 0 ? (
              
              <div></div>
            ) : (
              jobs.map((job, index) => (
                <motion.div
                  key={job.publicKey.toString()}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`glass-card p-6 cursor-pointer hover-lift transition-all ${
                    selectedJob === job.publicKey.toString() 
                      ? "border-primary shadow-neon" 
                      : ""
                  }`}
                  onClick={() => setSelectedJob(job.publicKey.toString())}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-foreground line-clamp-2">
                      {job.account.title}
                    </h3>
                    <Badge className={getStatusColor(formatJobStatus(job.account.status))}>
                      {formatJobStatus(job.account.status)}
                    </Badge>
                  </div>

                  <p className="text-sm text-foreground-muted mb-3 line-clamp-2">
                    {job.account.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground-muted">Budget</span>
                      <span className="font-semibold text-neon-gold">
                        {formatBudget(job.account.budget)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground-muted">Proposals</span>
                      <span className="font-semibold text-foreground">
                        {proposals.length} {/* Replace with actual proposals count */}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-foreground-muted">Client</span>
                      <span className="text-foreground-muted text-xs">
                        {job.account.client.toString().slice(0, 8)}...
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
                        navigate.push(`/jobs/${job.publicKey.toString()}?role=${userRole}`);
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
                        // Add edit functionality here
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
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
                  {jobs.length > 0 ? "Select a job to view proposals" : "No jobs available"}
                </h3>
                <p className="text-foreground-muted">
                  {jobs.length > 0 
                    ? "Choose a job from the list to manage its proposals" 
                    : "Start by posting your first job to receive proposals"}
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