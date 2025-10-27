import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Code, 
  ExternalLink,
  Calendar,
  MapPin
} from "lucide-react";
import { Badge } from "@/app/(module)/ui/badge";
import { Button } from "@/app/(module)/ui/button";


interface ResumePortfolioProps {
  userRole: "freelancer" | "client";
}

export const ResumePortfolio = ({ userRole }: ResumePortfolioProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (userRole === "client") {
    return null; // Clients don't have resume/portfolio
  }

  const education = [
    {
      degree: "Master of Computer Science",
      institution: "Stanford University",
      year: "2020-2022",
      location: "California, USA",
      gpa: "3.9/4.0"
    },
    {
      degree: "Bachelor of Software Engineering",
      institution: "MIT",
      year: "2016-2020",
      location: "Massachusetts, USA",
      gpa: "3.8/4.0"
    }
  ];

  const experience = [
    {
      title: "Senior Blockchain Developer",
      company: "CryptoTech Solutions",
      period: "2022 - Present",
      location: "Remote",
      description: "Lead development of DeFi protocols and smart contracts on Solana and Ethereum."
    },
    {
      title: "Full Stack Developer",
      company: "Web3 Innovations",
      period: "2020 - 2022",
      location: "San Francisco, CA",
      description: "Built scalable web applications and integrated blockchain technologies."
    }
  ];

  const skills = [
    { name: "Solana", level: 95, category: "Blockchain" },
    { name: "Rust", level: 90, category: "Programming" },
    { name: "React", level: 88, category: "Frontend" },
    { name: "Node.js", level: 85, category: "Backend" },
    { name: "Smart Contracts", level: 92, category: "Blockchain" },
    { name: "TypeScript", level: 87, category: "Programming" }
  ];

  const certifications = [
    {
      name: "Certified Solana Developer",
      issuer: "Solana Foundation",
      date: "2023",
      verified: true
    },
    {
      name: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2022",
      verified: true
    }
  ];

  const projects = [
    {
      title: "DeFi Lending Protocol",
      description: "Built a decentralized lending platform on Solana with $2M+ TVL",
      tech: ["Rust", "Anchor", "React", "TypeScript"],
      link: "https://github.com/project1",
      status: "Live"
    },
    {
      title: "NFT Marketplace",
      description: "Created a full-featured NFT marketplace with royalty distribution",
      tech: ["Solana", "Metaplex", "Next.js", "Web3.js"],
      link: "https://github.com/project2",
      status: "Live"
    }
  ];

  return (
    <motion.div 
      className="glass-card mb-8 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div 
        className="p-6 cursor-pointer hover:bg-glass-secondary/50 transition-colors duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <Briefcase className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Resume & Portfolio</h2>
              <p className="text-foreground-muted text-sm">View professional experience and projects</p>
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-5 h-5 text-foreground-muted" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="border-t border-glass-border"
          >
            <div className="p-6 space-y-8">
              {/* Education Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h3 className="flex items-center text-lg font-semibold text-foreground mb-4">
                  <GraduationCap className="w-5 h-5 mr-2 text-neon-cyan" />
                  Education
                </h3>
                <div className="space-y-4">
                  {education.map((edu, index) => (
                    <motion.div
                      key={index}
                      className="glass-panel p-4 hover-lift"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                        <Badge variant="outline" className="text-neon-cyan border-neon-cyan">
                          {edu.gpa}
                        </Badge>
                      </div>
                      <p className="text-neon-cyan font-medium">{edu.institution}</p>
                      <div className="flex items-center text-foreground-muted text-sm mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {edu.year}
                        <MapPin className="w-3 h-3 ml-3 mr-1" />
                        {edu.location}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Experience Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="flex items-center text-lg font-semibold text-foreground mb-4">
                  <Briefcase className="w-5 h-5 mr-2 text-neon-purple" />
                  Experience
                </h3>
                <div className="space-y-4">
                  {experience.map((exp, index) => (
                    <motion.div
                      key={index}
                      className="glass-panel p-4 hover-lift"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-foreground">{exp.title}</h4>
                        <Badge variant="secondary">{exp.period}</Badge>
                      </div>
                      <p className="text-neon-purple font-medium">{exp.company}</p>
                      <div className="flex items-center text-foreground-muted text-sm mt-1 mb-2">
                        <MapPin className="w-3 h-3 mr-1" />
                        {exp.location}
                      </div>
                      <p className="text-foreground-muted text-sm">{exp.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Skills Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="flex items-center text-lg font-semibold text-foreground mb-4">
                  <Code className="w-5 h-5 mr-2 text-neon-gold" />
                  Skills
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((skill, index) => (
                    <motion.div
                      key={index}
                      className="glass-panel p-3"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.05 }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-foreground">{skill.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {skill.category}
                        </Badge>
                      </div>
                      <div className="relative h-2 bg-glass-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="absolute left-0 top-0 h-full bg-gradient-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{ delay: 0.8 + index * 0.1, duration: 1 }}
                        />
                      </div>
                      <div className="text-right text-xs text-foreground-muted mt-1">
                        {skill.level}%
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Certifications Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="flex items-center text-lg font-semibold text-foreground mb-4">
                  <Award className="w-5 h-5 mr-2 text-neon-gold" />
                  Certifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {certifications.map((cert, index) => (
                    <motion.div
                      key={index}
                      className="glass-panel p-4 hover-lift"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-foreground">{cert.name}</h4>
                        {cert.verified && (
                          <Badge className="bg-success/20 text-success border-success">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-neon-gold">{cert.issuer}</p>
                      <p className="text-foreground-muted text-sm">{cert.date}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Projects Section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <h3 className="flex items-center text-lg font-semibold text-foreground mb-4">
                  <Code className="w-5 h-5 mr-2 text-neon-cyan" />
                  Featured Projects
                </h3>
                <div className="space-y-4">
                  {projects.map((project, index) => (
                    <motion.div
                      key={index}
                      className="glass-panel p-4 hover-lift"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 + index * 0.1 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-foreground">{project.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={project.status === "Live" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}
                          >
                            {project.status}
                          </Badge>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-foreground-muted text-sm mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};