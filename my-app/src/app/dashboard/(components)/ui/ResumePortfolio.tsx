import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  ChevronDown, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Code, 
  ExternalLink,
  Calendar,
  MapPin,
  Edit
} from "lucide-react";
import { Badge } from "@/app/(module)/ui/badge";
import { Button } from "@/app/(module)/ui/button";
import UserProfilePage from "../Register/components/ProfilePage";

interface ResumePortfolioProps {
  userRole: "freelancer" | "client";
  user: any;
  onUserUpdate?: (updatedUser: any) => void; // Callback when user data is updated
}

export const ResumePortfolio = ({ userRole, user, onUserUpdate }: ResumePortfolioProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  // Return null for clients
  if (userRole === "client") {
    return null;
  }

  // Sanitize user data to ensure it's a plain object without circular references
  const sanitizeUserData = (userData) => {
    if (!userData) return null;
    
    try {
      // Create a clean copy of the user data
      return {
        authority: userData.authority || "",
        name: userData.name || "User",
        is_client: Boolean(userData.is_client),
        is_freelancer: Boolean(userData.is_freelancer),
        reputation: Number(userData.reputation) || 0,
        completed_jobs: Number(userData.completed_jobs) || 0,
        created_at: Number(userData.created_at) || Math.floor(Date.now() / 1000),
        resume: userData.resume ? {
          education: Array.isArray(userData.resume.education) ? userData.resume.education : [],
          experience: Array.isArray(userData.resume.experience) ? userData.resume.experience : [],
          skills: Array.isArray(userData.resume.skills) ? userData.resume.skills : [],
          certifications: Array.isArray(userData.resume.certifications) ? userData.resume.certifications : [],
          portfolio: Array.isArray(userData.resume.portfolio) ? userData.resume.portfolio : [],
          last_update: Number(userData.resume.last_update) || Math.floor(Date.now() / 1000)
        } : null,
        disputes_raised: Number(userData.disputes_raised) || 0,
        disputes_resolved: Number(userData.disputes_resolved) || 0,
        total_earnings: Number(userData.total_earnings) || 0,
        total_spent: Number(userData.total_spent) || 0,
        active_jobs: Number(userData.active_jobs) || 0,
        pending_jobs: Number(userData.pending_jobs) || 0,
        cancelled_jobs: Number(userData.cancelled_jobs) || 0
      };
    } catch (error) {
      console.error("Error sanitizing user data:", error);
      return null;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Present";
    return new Date(timestamp * 1000).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Handle user profile update
  const handleProfileUpdate = (updatedData) => {
    setShowSetup(false);
    if (onUserUpdate) {
      onUserUpdate(updatedData);
    }
  };

  // Sanitize user data before using it
  const sanitizedUser = sanitizeUserData(user);

  // If showing profile setup, render it
  if (showSetup) {
    return (
      <UserProfilePage 
        role={userRole} 
        userData={sanitizedUser}
        onComplete={() => setShowSetup(false)}
        onSave={handleProfileUpdate}
      />
    );
  }

  // If no resume exists, show create prompt
  if (!sanitizedUser?.resume || !sanitizedUser.resume.education || sanitizedUser.resume.education.length === 0) {
    return (
      <motion.div
        className="glass-card p-6 flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Briefcase className="w-10 h-10 text-foreground-muted mb-3" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          No Resume Found
        </h2>
        <p className="text-foreground-muted mb-4">
          You haven't created your resume yet. Let's build your professional profile!
        </p>
        <Button
          variant="default"
          className="bg-gradient-primary text-white"
          onClick={() => setShowSetup(true)}
        >
          Create Resume
        </Button>
      </motion.div>
    );
  }

  // Get resume data from sanitized user
  const resume = sanitizedUser.resume;
  const education = resume.education || [];
  const experience = resume.experience || [];
  const skills = resume.skills || [];
  const certifications = resume.certifications || [];
  const portfolio = resume.portfolio || [];

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
          
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setShowSetup(true);
              }}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-foreground-muted" />
            </motion.div>
          </div>
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
              {education.length > 0 && (
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
                          {edu.grade && (
                            <Badge variant="outline" className="text-neon-cyan border-neon-cyan">
                              {edu.grade}
                            </Badge>
                          )}
                        </div>
                        <p className="text-neon-cyan font-medium">{edu.institution}</p>
                        {edu.field_of_study && (
                          <p className="text-foreground-muted text-sm">{edu.field_of_study}</p>
                        )}
                        <div className="flex items-center text-foreground-muted text-sm mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(edu.start_date)} - {formatDate(edu.end_date)}
                        </div>
                        {edu.description && (
                          <p className="text-foreground-muted text-sm mt-2">{edu.description}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Experience Section */}
              {experience.length > 0 && (
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
                          <h4 className="font-semibold text-foreground">{exp.position}</h4>
                          <Badge variant="secondary">
                            {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                          </Badge>
                        </div>
                        <p className="text-neon-purple font-medium">{exp.company}</p>
                        {exp.responsibilities && (
                          <p className="text-foreground-muted text-sm mt-2">{exp.responsibilities}</p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Skills Section */}
              {skills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="flex items-center text-lg font-semibold text-foreground mb-4">
                    <Code className="w-5 h-5 mr-2 text-neon-gold" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                      >
                        <Badge variant="secondary" className="text-sm">
                          {skill}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Certifications Section */}
              {certifications.length > 0 && (
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
                          {cert.credential_id && (
                            <Badge className="bg-success/20 text-success border-success">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-neon-gold">{cert.issuing_organization}</p>
                        <p className="text-foreground-muted text-sm">
                          {formatDate(cert.issue_date)}
                        </p>
                        {cert.credential_url && (
                          <a 
                            href={cert.credential_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neon-cyan text-sm flex items-center gap-1 mt-2 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Certificate <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Portfolio/Projects Section */}
              {portfolio.length > 0 && (
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
                    {portfolio.map((project, index) => (
                      <motion.div
                        key={index}
                        className="glass-panel p-4 hover-lift"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.0 + index * 0.1 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-foreground">{project.title}</h4>
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </a>
                          )}
                        </div>
                        <p className="text-foreground-muted text-sm mb-3">{project.description}</p>
                        {project.image_url && (
                          <img 
                            src={project.image_url} 
                            alt={project.title}
                            className="w-full h-48 object-cover rounded-lg mb-3"
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Empty state if no data */}
              {education.length === 0 && 
               experience.length === 0 && 
               skills.length === 0 && 
               certifications.length === 0 && 
               portfolio.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-foreground-muted">
                    No resume information available. Click "Edit" to add your professional details.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};