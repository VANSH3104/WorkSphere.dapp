import { motion } from "framer-motion";
import { useState } from "react";
import { 
  Clock, 
  DollarSign, 
  User, 
  Eye, 
  MessageCircle, 
  Star,
  Calendar,
  MapPin,
  ExternalLink
} from "lucide-react";
import { Badge } from "@/app/(module)/ui/badge";
import { Button } from "@/app/(module)/ui/button";


interface Job {
  id: string;
  title: string;
  client: string;
  clientRating: number;
  amount: string;
  status: "active" | "completed" | "pending" | "cancelled" | "in_progress" | "under_review";
  date: string;
  description: string;
  skills: string[];
  proposals?: number;
  deadline?: string;
  location: string;
}

interface RecentJobsProps {
  userRole: "freelancer" | "client";
}

export const RecentJobs = ({ userRole }: RecentJobsProps) => {
  const [hoveredJob, setHoveredJob] = useState<string | null>(null);

  const freelancerJobs: Job[] = [
    {
      id: "1",
      title: "DeFi Protocol Development",
      client: "CryptoVentures DAO",
      clientRating: 4.9,
      amount: "250 SOL",
      status: "in_progress",
      date: "2 hours ago",
      description: "Building a comprehensive DeFi lending protocol with advanced features including flash loans, yield farming, and governance tokens.",
      skills: ["Rust", "Anchor", "Solana", "TypeScript"],
      deadline: "Dec 15, 2024",
      location: "Remote"
    },
    {
      id: "2",
      title: "NFT Marketplace Smart Contracts",
      client: "ArtBlock Studios",
      clientRating: 4.8,
      amount: "180 SOL",
      status: "under_review",
      date: "1 day ago",
      description: "Develop smart contracts for a next-generation NFT marketplace with royalty distribution and advanced auction mechanisms.",
      skills: ["Solana", "Metaplex", "Rust", "Web3.js"],
      deadline: "Nov 30, 2024",
      location: "Remote"
    },
    {
      id: "3",
      title: "Web3 Gaming Platform",
      client: "GameFi Innovations",
      clientRating: 4.7,
      amount: "420 SOL",
      status: "completed",
      date: "3 days ago",
      description: "Full-stack development of a blockchain-based gaming platform with in-game asset trading and tournament systems.",
      skills: ["React", "Node.js", "Solana", "MongoDB"],
      deadline: "Completed",
      location: "Remote"
    },
    {
      id: "4",
      title: "DAO Governance Dashboard",
      client: "DecentralHub",
      clientRating: 4.6,
      amount: "95 SOL",
      status: "pending",
      date: "5 days ago",
      description: "Create a comprehensive dashboard for DAO governance including proposal creation, voting mechanisms, and treasury management.",
      skills: ["React", "TypeScript", "Solana", "Chart.js"],
      deadline: "Jan 10, 2025",
      location: "Remote"
    }
  ];

  const clientJobs: Job[] = [
    {
      id: "1",
      title: "E-commerce Platform Redesign",
      client: "Alex Chen (You)",
      clientRating: 4.9,
      amount: "150 SOL",
      status: "active",
      date: "1 hour ago",
      description: "Looking for a skilled developer to redesign our e-commerce platform with modern UI/UX and blockchain integration.",
      skills: ["React", "Node.js", "PostgreSQL", "Stripe"],
      proposals: 12,
      deadline: "Dec 20, 2024",
      location: "Remote"
    },
    {
      id: "2",
      title: "Smart Contract Audit",
      client: "Alex Chen (You)",
      clientRating: 4.9,
      amount: "75 SOL",
      status: "in_progress",
      date: "2 days ago",
      description: "Need comprehensive security audit for our DeFi smart contracts before mainnet deployment.",
      skills: ["Solana", "Security", "Rust", "Audit"],
      proposals: 8,
      deadline: "Nov 25, 2024",
      location: "Remote"
    },
    {
      id: "3",
      title: "Mobile App Development",
      client: "Alex Chen (You)",
      clientRating: 4.9,
      amount: "300 SOL",
      status: "completed",
      date: "1 week ago",
      description: "Cross-platform mobile application for crypto portfolio management with real-time price tracking.",
      skills: ["React Native", "TypeScript", "Redux", "Firebase"],
      proposals: 15,
      deadline: "Completed",
      location: "Remote"
    }
  ];

  const jobs = userRole === "freelancer" ? freelancerJobs : clientJobs;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success/20 text-success border-success";
      case "in_progress":
        return "bg-neon-cyan/20 text-neon-cyan border-neon-cyan";
      case "under_review":
        return "bg-neon-gold/20 text-neon-gold border-neon-gold";
      case "active":
        return "bg-neon-purple/20 text-neon-purple border-neon-purple";
      case "pending":
        return "bg-warning/20 text-warning border-warning";
      case "cancelled":
        return "bg-destructive/20 text-destructive border-destructive";
      default:
        return "bg-glass-secondary text-foreground-muted border-glass-border";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in_progress":
        return "In Progress";
      case "under_review":
        return "Under Review";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <motion.div 
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">
          {userRole === "freelancer" ? "Recent Jobs" : "Your Posted Jobs"}
        </h2>
        <Button variant="outline" size="sm" className="hover:bg-gradient-primary hover:text-white border-glass-border">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {jobs.map((job, index) => (
          <motion.div
            key={job.id}
            className="glass-panel p-5 rounded-xl hover-lift cursor-pointer relative overflow-hidden group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            onMouseEnter={() => setHoveredJob(job.id)}
            onMouseLeave={() => setHoveredJob(null)}
            whileHover={{ 
              scale: 1.02,
              rotateY: 2,
              rotateX: 1
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Animated Background Gradient */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
              style={{
                background: `linear-gradient(135deg, 
                  hsl(var(--neon-primary)) 0%, 
                  hsl(var(--neon-secondary)) 50%, 
                  hsl(var(--neon-accent)) 100%)`
              }}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-neon-cyan transition-colors duration-300">
                    {job.title}
                  </h3>
                  
                  <div className="flex items-center space-x-4 text-sm text-foreground-muted mb-3">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{job.client}</span>
                      {job.clientRating && (
                        <div className="flex items-center space-x-1 ml-2">
                          <Star className="w-3 h-3 text-neon-gold fill-neon-gold" />
                          <span className="text-neon-gold">{job.clientRating}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{job.date}</span>
                    </div>

                    {job.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-foreground-muted text-sm mb-4 line-clamp-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill, skillIndex) => (
                      <motion.div
                        key={skillIndex}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (index * 0.1) + (skillIndex * 0.05) + 0.3 }}
                      >
                        <Badge variant="outline" className="text-xs hover:bg-glass-secondary transition-colors">
                          {skill}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-3 ml-4">
                  <Badge className={getStatusColor(job.status)}>
                    {getStatusText(job.status)}
                  </Badge>
                  
                  <div className="text-right">
                    <div className="flex items-center text-neon-gold font-bold text-lg">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {job.amount}
                    </div>
                    {job.deadline && (
                      <div className="flex items-center text-xs text-foreground-muted mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {job.deadline}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-glass-border">
                <div className="flex items-center space-x-4 text-sm text-foreground-muted">
                  {userRole === "client" && job.proposals && (
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{job.proposals} proposals</span>
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
                  animate={{ opacity: hoveredJob === job.id ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button size="sm" variant="outline" className="hover:bg-gradient-primary hover:text-white">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" className="hover:bg-gradient-secondary hover:text-white">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Hover Border Effect */}
            <motion.div
              className="absolute inset-0 border border-transparent rounded-xl"
              animate={{
                borderColor: hoveredJob === job.id 
                  ? "hsl(var(--neon-primary))" 
                  : "transparent"
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};