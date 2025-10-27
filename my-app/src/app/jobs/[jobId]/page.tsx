"use client";
import { motion } from "framer-motion";


import { 
  ArrowLeft,
  Clock,
  DollarSign,
  Calendar,
  Briefcase,
  Star,
  CheckCircle,
  FileText,
  Users,
  Edit,
  XCircle
} from "lucide-react";
import { Badge } from "@/app/(module)/ui/badge";
import { Button } from "@/app/(module)/ui/button";
import { useParams, useRouter, useSearchParams } from "next/navigation";

const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useRouter();
  const userRole = "freelancer";

  // Mock job data
  const job = {
    id: jobId,
    title: "Senior Smart Contract Developer",
    description: `We are seeking an experienced Solidity developer to audit and optimize our DeFi protocol smart contracts. 
    
    The ideal candidate should have extensive experience in:
    - Smart contract development and security best practices
    - Gas optimization techniques
    - Common vulnerabilities and how to prevent them
    - Working with DeFi protocols (lending, DEX, yield farming)
    
    You will be responsible for:
    1. Reviewing existing smart contracts for security vulnerabilities
    2. Optimizing gas usage across all contracts
    3. Implementing best practices and coding standards
    4. Providing detailed documentation of changes
    5. Working closely with our development team
    
    We value clean code, attention to detail, and strong communication skills.`,
    skills: ["Solidity", "Web3.js", "Rust", "Security Audit", "DeFi", "Gas Optimization"],
    budget: { type: "fixed", amount: 5000 },
    timeline: { start: "ASAP", deadline: "2 weeks" },
    status: "Open",
    postedDate: "2 days ago",
    proposals: 12,
    avgBid: 4800,
    client: {
      name: "DeFi Labs",
      rating: 4.8,
      verified: true,
      jobsPosted: 24,
      hireRate: 85,
      location: "Global"
    },
    attachments: [
      { name: "project-specs.pdf", size: "2.4 MB" },
      { name: "current-contracts.zip", size: "1.8 MB" }
    ]
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-neon-cyan/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate.push(`/jobs`)}
            className="gap-2 hover:text-neon-cyan"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-3 text-foreground-muted">
                    <span>Posted {job.postedDate}</span>
                    <span>•</span>
                    <Badge className="bg-success/20 text-success border-success/30">
                      {job.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="glass-panel p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-neon-gold mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm text-foreground-muted">Budget</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">
                    ${job.budget.amount.toLocaleString()}
                  </p>
                </div>

                <div className="glass-panel p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-neon-cyan mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm text-foreground-muted">Timeline</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{job.timeline.deadline}</p>
                </div>

                <div className="glass-panel p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-neon-purple mb-1">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm text-foreground-muted">Proposals</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{job.proposals}</p>
                </div>

                <div className="glass-panel p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-warning mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm text-foreground-muted">Avg Bid</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">${job.avgBid}</p>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">Job Description</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground-muted whitespace-pre-line leading-relaxed">
                  {job.description}
                </p>
              </div>
            </motion.div>

            {/* Skills Required */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8"
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-3">
                {job.skills.map((skill) => (
                  <Badge
                    key={skill}
                    className="px-4 py-2 text-sm bg-gradient-primary text-white border-0"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </motion.div>

            {/* Attachments */}
            {job.attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-8"
              >
                <h2 className="text-2xl font-bold text-foreground mb-4">Attachments</h2>
                <div className="space-y-3">
                  {job.attachments.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between p-4 glass-panel rounded-lg hover-lift cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-neon-cyan" />
                        <div>
                          <p className="font-medium text-foreground">{file.name}</p>
                          <p className="text-sm text-foreground-muted">{file.size}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 sticky top-6"
            >
              {userRole === "freelancer" ? (
                <>
                  <h3 className="text-xl font-bold text-foreground mb-4">Ready to Apply?</h3>
                  <Button
                    variant="neon"
                    size="lg"
                    className="w-full mb-3"
                    onClick={() => navigate.push(`/jobs/${jobId}/apply`)}
                  >
                    Submit Proposal
                  </Button>
                  <p className="text-sm text-foreground-muted text-center">
                    Avg. response time: 24 hours
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-foreground mb-4">Manage Job</h3>
                  <div className="space-y-3">
                    <Button variant="neon" size="lg" className="w-full gap-2">
                      <Users className="h-4 w-4" />
                      View Proposals ({job.proposals})
                    </Button>
                    <Button variant="glass" size="lg" className="w-full gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Job
                    </Button>
                    <Button variant="glass" size="lg" className="w-full gap-2 text-destructive hover:text-destructive">
                      <XCircle className="h-4 w-4" />
                      Close Job
                    </Button>
                  </div>
                </>
              )}
            </motion.div>

            {/* Client Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold text-foreground mb-4">About the Client</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-foreground">{job.client.name}</p>
                    {job.client.verified && (
                      <Badge variant="outline" className="text-xs border-success/30 text-success">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-neon-gold">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-semibold">{job.client.rating}</span>
                    <span className="text-foreground-muted text-sm ml-1">rating</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-glass-border">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted">Jobs Posted</span>
                    <span className="font-semibold text-foreground">{job.client.jobsPosted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted">Hire Rate</span>
                    <span className="font-semibold text-success">{job.client.hireRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground-muted">Location</span>
                    <span className="font-semibold text-foreground">{job.client.location}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;