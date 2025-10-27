"use client";
import { useState } from "react";
import { motion } from "framer-motion";


import { 
  Search, 
  SlidersHorizontal, 
  Grid3x3, 
  List, 
  Clock, 
  DollarSign,
  Briefcase,
  TrendingUp
} from "lucide-react";
import { Button } from "../(module)/ui/button";
import { Input } from "../(module)/ui/input";
import { Badge } from "../(module)/ui/badge";
import { useRouter } from "next/navigation";

const JobListingPage = () => {
  const navigate = useRouter();
  
  const userRole =  "freelancer";
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock job data
  const jobs = [
    {
      id: "1",
      title: "Senior Smart Contract Developer",
      description: "Looking for experienced Solidity developer to audit and optimize DeFi protocol smart contracts",
      skills: ["Solidity", "Web3.js", "Rust", "Security Audit"],
      budget: { type: "fixed", amount: 5000 },
      deadline: "2 weeks",
      status: "Open",
      proposals: 12,
      postedDate: "2 days ago",
      client: { name: "DeFi Labs", rating: 4.8, verified: true }
    },
    {
      id: "2",
      title: "NFT Marketplace UI/UX Design",
      description: "Design a modern, luxury NFT marketplace with 3D elements and glassmorphism effects",
      skills: ["Figma", "3D Design", "UI/UX", "Web3"],
      budget: { type: "hourly", rate: 75 },
      deadline: "1 month",
      status: "Open",
      proposals: 8,
      postedDate: "1 day ago",
      client: { name: "NFT Studio", rating: 4.9, verified: true }
    },
    {
      id: "3",
      title: "Full-Stack dApp Development",
      description: "Build a decentralized application with React, Solana Web3.js, and Rust backend",
      skills: ["React", "TypeScript", "Solana", "Anchor"],
      budget: { type: "fixed", amount: 8000 },
      deadline: "6 weeks",
      status: "Open",
      proposals: 15,
      postedDate: "3 days ago",
      client: { name: "Crypto Ventures", rating: 4.7, verified: true }
    },
    {
      id: "4",
      title: "DAO Governance Platform",
      description: "Create a comprehensive DAO governance system with voting, proposals, and treasury management",
      skills: ["Solana", "React", "Node.js", "PostgreSQL"],
      budget: { type: "fixed", amount: 12000 },
      deadline: "2 months",
      status: "Open",
      proposals: 20,
      postedDate: "5 days ago",
      client: { name: "DAO Builders", rating: 5.0, verified: true }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-success/20 text-success border-success/30";
      case "In Progress": return "bg-warning/20 text-warning border-warning/30";
      case "Closed": return "bg-foreground-muted/20 text-foreground-muted border-foreground-muted/30";
      default: return "bg-glass-secondary text-foreground-muted";
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-neon-cyan/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-3">
            <span className="text-neon bg-gradient-primary bg-clip-text text-transparent">
              {userRole === "client" ? "My Projects" : "Explore Jobs"}
            </span>
          </h1>
          <p className="text-foreground-muted text-lg">
            {userRole === "client" 
              ? "Manage your posted projects and review proposals" 
              : "Find the perfect project or freelancer opportunity"}
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground-muted" />
              <Input
                placeholder="Search by skills, job titles, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-background-elevated border-glass-border focus:border-primary h-12"
              />
            </div>

            {/* Filter Button */}
            <Button variant="glass" className="gap-2 h-12">
              <SlidersHorizontal className="h-5 w-5" />
              Filters
            </Button>

            {/* View Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "neon" : "glass"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="h-12 w-12"
              >
                <Grid3x3 className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "neon" : "glass"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-12 w-12"
              >
                <List className="h-5 w-5" />
              </Button>
            </div>

            {userRole === "client" && (
              <Button
                variant="neon"
                onClick={() => navigate.push(`/jobs/post?role=${userRole}`)}
                className="h-12"
              >
                Post New Job
              </Button>
            )}
          </div>
        </motion.div>

        {/* Job Grid/List */}
        <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "space-y-6"}>
          {jobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -8 }}
              className="glass-card p-6 hover-lift cursor-pointer group"
              onClick={() => navigate.push(`/jobs/${job.id}?role=${userRole}`)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-neon-cyan transition-colors">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-foreground-muted">
                    <span>{job.client.name}</span>
                    {job.client.verified && (
                      <Badge variant="outline" className="text-xs border-success/30 text-success">
                        ✓ Verified
                      </Badge>
                    )}
                    <span>★ {job.client.rating}</span>
                  </div>
                </div>
                <Badge className={getStatusColor(job.status)}>
                  {job.status}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-foreground-muted mb-4 line-clamp-2">
                {job.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="bg-glass-secondary border-glass-border hover:border-primary hover:text-primary transition-colors"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between pt-4 border-t border-glass-border">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-neon-gold">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-semibold">
                      {job.budget.type === "fixed" 
                        ? `$${job.budget.amount.toLocaleString()}` 
                        : `$${job.budget.rate}/hr`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-foreground-muted">
                    <Clock className="h-4 w-4" />
                    <span>{job.deadline}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-foreground-muted text-sm">
                  <Briefcase className="h-4 w-4" />
                  <span>{job.proposals} proposals</span>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity rounded-xl pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobListingPage;