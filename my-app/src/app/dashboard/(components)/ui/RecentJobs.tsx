import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Clock, 
  DollarSign, 
  User, 
  Eye, 
  MessageCircle,
  Calendar,
  ExternalLink,
  Briefcase,
  CheckCircle,
  AlertTriangle,
  Hourglass
} from "lucide-react";
import { Badge } from "@/app/(module)/ui/badge";
import { Button } from "@/app/(module)/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

import { BN } from "@coral-xyz/anchor";
import { fetchJobs, fetchMyJobs } from "@/(anchor)/actions/fetchjob";

interface RecentJobsProps {
  limit?: number;
  userRole: "freelancer" | "client"; // Keep the prop
}

// Helper function to safely convert BN to number
const bnToNumber = (bn: BN): number => {
  try {
    return bn.toNumber();
  } catch (error) {
    return parseFloat(bn.toString());
  }
};

export const RecentJobs = ({ limit = 4, userRole }: RecentJobsProps) => {
  const [hoveredJob, setHoveredJob] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { wallet, publicKey } = useWallet();
  const router = useRouter();

  const isFreelancer = userRole === "freelancer";
  const isClient = userRole === "client";

  useEffect(() => {
    const loadJobs = async () => {
      if (!wallet || !publicKey) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let jobData: Job[] = [];

        if (isFreelancer) {
          jobData = await fetchJobs(wallet.adapter, {
            statusFilter: 'open',
            limit
          });
        } else if (isClient) {
          jobData = await fetchMyJobs(wallet.adapter, 'all');
          if (limit) {
            jobData = jobData.slice(0, limit);
          }
        }

        setJobs(jobData);
      } catch (err) {
        console.error("Error loading jobs:", err);
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [wallet, publicKey, isFreelancer, isClient, limit]);

  const getStatusColor = (status: any) => {
    const statusKey = Object.keys(status)[0] as string;
    
    switch (statusKey) {
      case "completed":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "inProgress":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "open":
        return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      case "disputed":
        return "bg-red-500/20 text-red-500 border-red-500/30";
      case "cancelled":
        return "bg-gray-500/20 text-gray-500 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/30";
    }
  };

  const getStatusText = (status: any) => {
    const statusKey = Object.keys(status)[0];
    
    switch (statusKey) {
      case "inProgress":
        return "In Progress";
      case "open":
        return "Open";
      case "disputed":
        return "Disputed";
      default:
        return statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
    }
  };

  const getStatusIcon = (status: any) => {
    const statusKey = Object.keys(status)[0];
    
    switch (statusKey) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "inProgress":
        return <Briefcase className="w-4 h-4" />;
      case "open":
        return <Hourglass className="w-4 h-4" />;
      case "disputed":
        return <AlertTriangle className="w-4 h-4" />;
      case "cancelled":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const formatDeadline = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  const handleViewAll = () => {
    if (isFreelancer) {
      router.push('/jobs');
    } else if (isClient) {
      router.push('/manage-jobs');
    }
  };

  const handleViewJob = (jobPublicKey: PublicKey) => {
    if (isFreelancer) {
      router.push(`/jobs/${jobPublicKey.toString()}?role=${userRole}`);
    } else if (isClient) {
      router.push(`/manage-jobs/${jobPublicKey.toString()}`);
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {isFreelancer ? "Available Jobs" : "Your Jobs"}
          </h2>
          <Button variant="outline" size="sm" className="border-glass-border" disabled>
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="glass-panel p-5 rounded-xl animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="h-6 bg-gray-300/20 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-300/20 rounded mb-3 w-1/2"></div>
                  <div className="h-4 bg-gray-300/20 rounded mb-4 w-full"></div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 3 }).map((_, skillIndex) => (
                      <div key={skillIndex} className="w-16 h-6 bg-gray-300/20 rounded"></div>
                    ))}
                  </div>
                </div>
                <div className="w-20 h-6 bg-gray-300/20 rounded ml-4"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Unable to load jobs</h3>
          <p className="text-foreground-muted mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </motion.div>
    );
  }

  if (jobs.length === 0) {
    return (
      <motion.div 
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {isFreelancer ? "Available Jobs" : "Your Jobs"}
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-glass-border hover:bg-gradient-primary hover:text-white"
            onClick={handleViewAll}
          >
            View All
          </Button>
        </div>
        <div className="text-center py-8">
          <Briefcase className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isFreelancer ? "No jobs available" : "No jobs posted yet"}
          </h3>
          <p className="text-foreground-muted mb-4">
            {isFreelancer 
              ? "Check back later for new job opportunities" 
              : "Start by posting your first job"
            }
          </p>
          <Button 
            variant="neon" 
            onClick={handleViewAll}
          >
            {isFreelancer ? "Browse All Jobs" : "Post a Job"}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">
          {isFreelancer ? "Available Jobs" : "Your Jobs"}
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          className="hover:bg-gradient-primary hover:text-white border-glass-border"
          onClick={handleViewAll}
        >
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {jobs.map((job, index) => {
          // Convert BN values to numbers for rendering
          const budget = bnToNumber(job.account.budget) /1000000000;
          const createdAt = bnToNumber(job.account.createdAt);
          const deadline = bnToNumber(job.account.deadline);

          return (
            <motion.div
              key={job.publicKey.toString()}
              className="glass-panel p-5 rounded-xl hover-lift cursor-pointer relative overflow-hidden group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              onMouseEnter={() => setHoveredJob(job.publicKey.toString())}
              onMouseLeave={() => setHoveredJob(null)}
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-neon-cyan transition-colors duration-300">
                      {job.account.title}
                    </h3>
                    
                    <div className="flex items-center space-x-4 text-sm text-foreground-muted mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span className="font-mono text-xs">
                          {job.account.client.toString().slice(0, 4)}...{job.account.client.toString().slice(-4)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(createdAt)}</span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {formatDeadline(deadline)}</span>
                      </div>
                    </div>

                    <p className="text-foreground-muted text-sm mb-4 line-clamp-2">
                      {job.account.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-3 ml-4">
                    <Badge className={`flex items-center gap-1 ${getStatusColor(job.account.status)}`}>
                      {getStatusIcon(job.account.status)}
                      {getStatusText(job.account.status)}
                    </Badge>
                    
                    <div className="text-right">
                      <div className="flex items-center text-neon-gold font-bold text-lg">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {budget} SOL
                      </div>
                      <div className="text-xs text-foreground-muted mt-1">
                        {job.account.freelancer ? "Assigned" : "Open for bids"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-glass-border">
                  <div className="flex items-center space-x-4 text-sm text-foreground-muted">
                    {isClient && (
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>0 bids</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>Messages</span>
                    </div>
                  </div>

                  <motion.div
                    className="flex space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredJob === job.publicKey.toString() ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="hover:bg-gradient-primary hover:text-white"
                      onClick={() => handleViewJob(job.publicKey)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};