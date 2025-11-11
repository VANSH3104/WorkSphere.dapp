"use client"
import { useState, useEffect } from "react";
import { Calendar } from "@/app/(module)/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/(module)/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { getProgram, findUserPDA } from "@/(anchor)/setup";
import { BN } from "@coral-xyz/anchor";
import { 
  User, 
  Briefcase, 
  FileText, 
  Star, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Award,
  Building,
  GraduationCap,
  Settings,
  Edit3,
  Save,
  X,
  Download,
  Upload,
  Shield,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/(module)/ui/card";
import { Button } from "@/app/(module)/ui/button";
import { Input } from "@/app/(module)/ui/input";
import { Textarea } from "@/app/(module)/ui/textarea";
import { Badge } from "@/app/(module)/ui/badge";
import { useWallet } from "@solana/wallet-adapter-react";


// Type definitions
interface Education {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: number | null;
  end_date: number | null;
  grade: string;
  description: string;
}

interface Experience {
  company: string;
  position: string;
  start_date: number | null;
  end_date: number | null;
  responsibilities: string;
}

interface Certification {
  name: string;
  issuing_organization: string;
  issue_date: number | null;
  expiration_date: number | null;
  credential_id: string;
  credential_url: string;
}

interface PortfolioItem {
  title: string;
  description: string;
  url: string;
  image_url: string;
}

interface Resume {
  education: Education[];
  experience: Experience[];
  skills: string[];
  certifications: Certification[];
  portfolio: PortfolioItem[];
  last_update: number;
}

interface UserData {
  authority: string;
  name: string;
  is_client: boolean;
  is_freelancer: boolean;
  reputation: number;
  completed_jobs: number;
  created_at: number;
  resume: Resume;
  disputes_raised: number;
  disputes_resolved: number;
  total_earnings: number;
  total_spent: number;
  active_jobs: number;
  pending_jobs: number;
  cancelled_jobs: number;
}

interface UserProfilePageProps {
  role: "freelancer" | "client";
  onComplete: () => void;
  userData?: UserData;
  onSave?: (updatedData: UserData) => void;
}

const UserProfilePage = ({ role, onComplete, userData: initialUserData, onSave }: UserProfilePageProps) => {
  const [isEditing, setIsEditing] = useState(!initialUserData?.resume);
  const [activeTab, setActiveTab] = useState("overview");
  const [userRole, setUserRole] = useState<"freelancer" | "client">(role);
  const { wallet , publicKey } = useWallet();
  console.log(publicKey , "user")
  // Default resume structure
  const defaultResume: Resume = {
    education: [],
    experience: [],
    skills: [],
    certifications: [],
    portfolio: [],
    last_update: Math.floor(Date.now() / 1000)
  };

  // Default user data structure
  const defaultUserData: UserData = {
    authority: "9sR5S...8Hd3k",
    name: "John Doe",
    is_client: role === "client",
    is_freelancer: role === "freelancer",
    reputation: 92,
    completed_jobs: 47,
    created_at: Math.floor(Date.now() / 1000),
    resume: defaultResume,
    disputes_raised: 2,
    disputes_resolved: 1,
    total_earnings: 1247000000,
    total_spent: 567000000,
    active_jobs: 3,
    pending_jobs: 2,
    cancelled_jobs: 5
  };

  const [userData, setUserData] = useState<UserData>(initialUserData || defaultUserData);
  const [editableResume, setEditableResume] = useState<Resume>(
    (initialUserData?.resume && Object.keys(initialUserData.resume).length > 0) 
      ? initialUserData.resume 
      : defaultResume
  );
  const [editableUserData, setEditableUserData] = useState<UserData>(userData);

  useEffect(() => {
    if (initialUserData) {
      setUserData(initialUserData);
      setEditableUserData(initialUserData);
      const resume = (initialUserData.resume && Object.keys(initialUserData.resume).length > 0)
        ? initialUserData.resume
        : defaultResume;
      setEditableResume(resume);
    }
  }, [initialUserData]);

  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return "Present";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatSol = (lamports: number): string => {
    return (lamports / 1000000000).toFixed(2) + " SOL";
  };

  const handleSaveChanges = (): void => {
    const updatedData: UserData = {
      ...editableUserData,
      resume: {
        ...editableResume,
        last_update: Math.floor(Date.now() / 1000)
      }
    };
    
    setUserData(updatedData);
    setIsEditing(false);
    
    if (onSave) {
      onSave(updatedData);
    }
    
    if (!initialUserData?.resume) {
      onComplete();
    }
  };

  const handleCancelEdit = (): void => {
    setEditableUserData(userData);
    const resume = (userData.resume && Object.keys(userData.resume).length > 0)
      ? userData.resume
      : defaultResume;
    setEditableResume(resume);
    setIsEditing(false);
    
    if (!initialUserData?.resume) {
      onComplete();
    }
  };

  const handleAddEducation = (): void => {
    setEditableResume({
      ...editableResume,
      education: [
        ...(editableResume?.education || []),
        {
          institution: "",
          degree: "",
          field_of_study: "",
          start_date: null,
          end_date: null,
          grade: "",
          description: ""
        }
      ]
    });
  };

  const handleRemoveEducation = (index: number): void => {
    const newEducation = [...(editableResume?.education || [])];
    newEducation.splice(index, 1);
    setEditableResume({
      ...editableResume,
      education: newEducation
    });
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string | number | null): void => {
    const newEducation = [...(editableResume?.education || [])];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value
    };
    setEditableResume({
      ...editableResume,
      education: newEducation
    });
  };

  const handleAddExperience = (): void => {
    setEditableResume({
      ...editableResume,
      experience: [
        ...(editableResume?.experience || []),
        {
          company: "",
          position: "",
          start_date: null,
          end_date: null,
          responsibilities: ""
        }
      ]
    });
  };

  const handleRemoveExperience = (index: number): void => {
    const newExperience = [...(editableResume?.experience || [])];
    newExperience.splice(index, 1);
    setEditableResume({
      ...editableResume,
      experience: newExperience
    });
  };

  const handleExperienceChange = (index: number, field: keyof Experience, value: string | number | null): void => {
    const newExperience = [...(editableResume?.experience || [])];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value
    };
    setEditableResume({
      ...editableResume,
      experience: newExperience
    });
  };

  const handleAddSkill = (): void => {
    setEditableResume({
      ...editableResume,
      skills: [...(editableResume?.skills || []), ""]
    });
  };

  const handleRemoveSkill = (index: number): void => {
    const newSkills = [...(editableResume?.skills || [])];
    newSkills.splice(index, 1);
    setEditableResume({
      ...editableResume,
      skills: newSkills
    });
  };

  const handleSkillChange = (index: number, value: string): void => {
    const newSkills = [...(editableResume?.skills || [])];
    newSkills[index] = value;
    setEditableResume({
      ...editableResume,
      skills: newSkills
    });
  };

  const handleAddCertification = (): void => {
    setEditableResume({
      ...editableResume,
      certifications: [
        ...(editableResume?.certifications || []),
        {
          name: "",
          issuing_organization: "",
          issue_date: null,
          expiration_date: null,
          credential_id: "",
          credential_url: ""
        }
      ]
    });
  };

  const handleRemoveCertification = (index: number): void => {
    const newCertifications = [...(editableResume?.certifications || [])];
    newCertifications.splice(index, 1);
    setEditableResume({
      ...editableResume,
      certifications: newCertifications
    });
  };

  const handleCertificationChange = (index: number, field: keyof Certification, value: string | number | null): void => {
    const newCertifications = [...(editableResume?.certifications || [])];
    newCertifications[index] = {
      ...newCertifications[index],
      [field]: value
    };
    setEditableResume({
      ...editableResume,
      certifications: newCertifications
    });
  };

  const handleAddPortfolio = (): void => {
    setEditableResume({
      ...editableResume,
      portfolio: [
        ...(editableResume?.portfolio || []),
        {
          title: "",
          description: "",
          url: "",
          image_url: ""
        }
      ]
    });
  };

  const handleRemovePortfolio = (index: number): void => {
    const newPortfolio = [...(editableResume?.portfolio || [])];
    newPortfolio.splice(index, 1);
    setEditableResume({
      ...editableResume,
      portfolio: newPortfolio
    });
  };

  const handlePortfolioChange = (index: number, field: keyof PortfolioItem, value: string): void => {
    const newPortfolio = [...(editableResume?.portfolio || [])];
    newPortfolio[index] = {
      ...newPortfolio[index],
      [field]: value
    };
    setEditableResume({
      ...editableResume,
      portfolio: newPortfolio
    });
  };

  
  const handleSubmitToBlockchain = async () => {
    try {
      const program = getProgram(wallet?.adapter);
      const [userPDA] = findUserPDA(wallet.adapter.publicKey); 
      
      // CORRECT structure with proper types and last_update field
      const resume = {
        education: (editableResume.education || []).map(edu => ({
          institution: edu.institution || "",
          degree: edu.degree || "",
          field_of_study: edu.field_of_study || "",
          start_date: new BN(edu.start_date || 0),  // Use BN for numbers
          end_date: new BN(edu.end_date || 0),      // Use BN for numbers
          grade: edu.grade || "",
          description: edu.description || ""
        })),
        experience: (editableResume.experience || []).map(exp => ({
          company: exp.company || "",
          position: exp.position || "",
          start_date: new BN(exp.start_date || 0),  // Use BN for numbers
          end_date: new BN(exp.end_date || 0),      // Use BN for numbers
          responsibilities: exp.responsibilities || ""
        })),
        skills: editableResume.skills || [],
        certifications: (editableResume.certifications || []).map(cert => ({
          name: cert.name || "",
          issuing_organization: cert.issuing_organization || "",
          issue_date: new BN(cert.issue_date || 0),        // Use BN for numbers
          expiration_date: new BN(cert.expiration_date || 0), // Use BN for numbers
          credential_id: cert.credential_id || "",
          credential_url: cert.credential_url || ""
        })),
        portfolio: (editableResume.portfolio || []).map(item => ({
          title: item.title || "",
          description: item.description || "",
          url: item.url || "",
          image_url: item.image_url || ""
        })),
        last_update: new BN(Math.floor(Date.now() / 1000))  // REQUIRED field!
      };
  
      console.log("📝 Prepared resume:", resume);
  
      const txSig = await program.methods
        .updateResume(resume)
        .accounts({
          user: userPDA,
          authority: wallet.adapter.publicKey,
        })
        .rpc();
  
      console.log("✅ Resume updated successfully:", txSig);
      alert("Resume successfully updated on blockchain!");
  
    } catch (error) {
      console.error("❌ Error submitting to blockchain:", error);
      alert("Failed to submit resume to blockchain.");
    }
  };


  const stats = [
    {
      title: "Reputation Score",
      value: editableUserData.reputation,
      max: 100,
      icon: Star,
      color: "text-neon-gold"
    },
    {
      title: "Completed Jobs",
      value: editableUserData.completed_jobs,
      icon: CheckCircle,
      color: "text-success"
    },
    {
      title: "Total Earnings",
      value: formatSol(editableUserData.total_earnings),
      icon: DollarSign,
      color: "text-neon-purple"
    },
    {
      title: "Active Disputes",
      value: editableUserData.disputes_raised - editableUserData.disputes_resolved,
      icon: Shield,
      color: "text-destructive"
    }
  ];

  const renderResumeSection = () => {
    return (
      <div className="space-y-6">
        {/* Education */}
        <Card className="glass-card border-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/30 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <GraduationCap className="h-5 w-5 text-neon-cyan" />
              Education
            </CardTitle>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={handleAddEducation} className="gap-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10">
                <Plus className="h-4 w-4" />
                Add Education
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {(editableResume?.education || []).map((edu, index) => (
              <div key={index} className="p-4 glass-panel rounded-lg border border-border/30">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Institution</label>
                        <Input 
                          value={edu.institution || ""} 
                          onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Degree</label>
                        <Input 
                          value={edu.degree || ""} 
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Field of Study</label>
                      <Input 
                        value={edu.field_of_study || ""} 
                        onChange={(e) => handleEducationChange(index, 'field_of_study', e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Start Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-background/50"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {edu.start_date ? format(new Date(edu.start_date * 1000), "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={edu.start_date ? new Date(edu.start_date * 1000) : undefined}
                              onSelect={(date) => handleEducationChange(index, 'start_date', date ? Math.floor(date.getTime() / 1000) : null)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">End Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-background/50"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {edu.end_date ? format(new Date(edu.end_date * 1000), "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={edu.end_date ? new Date(edu.end_date * 1000) : undefined}
                              onSelect={(date) => handleEducationChange(index, 'end_date', date ? Math.floor(date.getTime() / 1000) : null)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Grade</label>
                      <Input 
                        value={edu.grade || ""} 
                        onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Description</label>
                      <Textarea 
                        value={edu.description || ""} 
                        onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                        className="bg-background/50 min-h-[80px]"
                      />
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveEducation(index)} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{edu.institution}</h3>
                        <p className="text-foreground-muted">{edu.degree} in {edu.field_of_study}</p>
                        {edu.grade && <p className="text-sm text-foreground-muted mt-1">Grade: {edu.grade}</p>}
                      </div>
                      <div className="text-right text-sm text-foreground-muted">
                        <p>{formatDate(edu.start_date)} - {formatDate(edu.end_date)}</p>
                      </div>
                    </div>
                    {edu.description && (
                      <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{edu.description}</p>
                    )}
                  </>
                )}
              </div>
            ))}
            {(editableResume?.education || []).length === 0 && !isEditing && (
              <div className="text-center py-8 border-2 border-dashed border-border/30 rounded-lg">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground-muted">No education information added yet.</p>
                <Button variant="outline" onClick={() => setIsEditing(true)} className="mt-3 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Education
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Experience */}
        <Card className="glass-card border-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/30 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Building className="h-5 w-5 text-neon-purple" />
              Experience
            </CardTitle>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={handleAddExperience} className="gap-2 border-neon-purple text-neon-purple hover:bg-neon-purple/10">
                <Plus className="h-4 w-4" />
                Add Experience
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {(editableResume?.experience || []).map((exp, index) => (
              <div key={index} className="p-4 glass-panel rounded-lg border border-border/30">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Company</label>
                        <Input 
                          value={exp.company || ""} 
                          onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Position</label>
                        <Input 
                          value={exp.position || ""} 
                          onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Start Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-background/50"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {exp.start_date ? format(new Date(exp.start_date * 1000), "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={exp.start_date ? new Date(exp.start_date * 1000) : undefined}
                              onSelect={(date) => handleExperienceChange(index, 'start_date', date ? Math.floor(date.getTime() / 1000) : null)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">End Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-background/50"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {exp.end_date ? format(new Date(exp.end_date * 1000), "PPP") : "Present"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={exp.end_date ? new Date(exp.end_date * 1000) : undefined}
                              onSelect={(date) => handleExperienceChange(index, 'end_date', date ? Math.floor(date.getTime() / 1000) : null)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Responsibilities</label>
                      <Textarea 
                        value={exp.responsibilities || ""} 
                        onChange={(e) => handleExperienceChange(index, 'responsibilities', e.target.value)}
                        className="bg-background/50 min-h-[100px]"
                        placeholder="Describe your key responsibilities and achievements..."
                      />
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveExperience(index)} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{exp.company}</h3>
                        <p className="text-foreground-muted">{exp.position}</p>
                      </div>
                      <div className="text-right text-sm text-foreground-muted">
                        <p>{formatDate(exp.start_date)} - {formatDate(exp.end_date)}</p>
                      </div>
                    </div>
                    {exp.responsibilities && (
                      <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{exp.responsibilities}</p>
                    )}
                  </>
                )}
              </div>
            ))}
            {(editableResume?.experience || []).length === 0 && !isEditing && (
              <div className="text-center py-8 border-2 border-dashed border-border/30 rounded-lg">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground-muted">No experience information added yet.</p>
                <Button variant="outline" onClick={() => setIsEditing(true)} className="mt-3 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Experience
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="glass-card border-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/30 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-5 w-5 text-neon-gold" />
              Skills
            </CardTitle>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={handleAddSkill} className="gap-2 border-neon-gold text-neon-gold hover:bg-neon-gold/10">
                <Plus className="h-4 w-4" />
                Add Skill
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            {isEditing ? (
              <div className="space-y-4">
                {(editableResume?.skills || []).map((skill, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      value={skill} 
                      onChange={(e) => handleSkillChange(index, e.target.value)}
                      placeholder="Enter a skill (e.g., React, Solana, Rust)"
                      className="bg-background/50"
                    />
                    <Button variant="destructive" size="icon" onClick={() => handleRemoveSkill(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(editableResume?.skills || []).length === 0 && (
                  <div className="text-center py-6">
                    <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-foreground-muted">No skills added yet. Click "Add Skill" to get started.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {(editableResume?.skills || []).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-2 bg-primary/10 text-primary border-primary/20">
                    {skill}
                  </Badge>
                ))}
                {(editableResume?.skills || []).length === 0 && (
                  <div className="text-center w-full py-6">
                    <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-foreground-muted">No skills added yet.</p>
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="mt-3 gap-2">
                      <Plus className="h-4 w-4" />
                      Add Skills
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card className="glass-card border-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/30 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Award className="h-5 w-5 text-neon-cyan" />
              Certifications
            </CardTitle>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={handleAddCertification} className="gap-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10">
                <Plus className="h-4 w-4" />
                Add Certification
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {(editableResume?.certifications || []).map((cert, index) => (
              <div key={index} className="p-4 glass-panel rounded-lg border border-border/30">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Certification Name</label>
                        <Input 
                          value={cert.name || ""} 
                          onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                          placeholder="e.g., AWS Solutions Architect"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Issuing Organization</label>
                        <Input 
                          value={cert.issuing_organization || ""} 
                          onChange={(e) => handleCertificationChange(index, 'issuing_organization', e.target.value)}
                          placeholder="e.g., Amazon Web Services"
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Issue Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-background/50"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {cert.issue_date ? format(new Date(cert.issue_date * 1000), "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={cert.issue_date ? new Date(cert.issue_date * 1000) : undefined}
                              onSelect={(date) => handleCertificationChange(index, 'issue_date', date ? Math.floor(date.getTime() / 1000) : null)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Expiration Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-background/50"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {cert.expiration_date ? format(new Date(cert.expiration_date * 1000), "PPP") : "No expiration"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={cert.expiration_date ? new Date(cert.expiration_date * 1000) : undefined}
                              onSelect={(date) => handleCertificationChange(index, 'expiration_date', date ? Math.floor(date.getTime() / 1000) : null)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Credential ID (Optional)</label>
                        <Input 
                          value={cert.credential_id || ""} 
                          onChange={(e) => handleCertificationChange(index, 'credential_id', e.target.value)}
                          placeholder="e.g., ABC-123-XYZ"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Credential URL (Optional)</label>
                        <Input 
                          value={cert.credential_url || ""} 
                          onChange={(e) => handleCertificationChange(index, 'credential_url', e.target.value)}
                          placeholder="https://..."
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveCertification(index)} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{cert.name}</h3>
                        <p className="text-foreground-muted">{cert.issuing_organization}</p>
                        {cert.credential_id && (
                          <p className="text-sm text-foreground-muted mt-1">ID: {cert.credential_id}</p>
                        )}
                      </div>
                      <div className="text-right text-sm text-foreground-muted">
                        <p>Issued: {formatDate(cert.issue_date)}</p>
                        {cert.expiration_date && (
                          <p>Expires: {formatDate(cert.expiration_date)}</p>
                        )}
                      </div>
                    </div>
                    {cert.credential_url && (
                      <a 
                        href={cert.credential_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-neon-cyan hover:underline mt-3 inline-block font-medium"
                      >
                        View Credential →
                      </a>
                    )}
                  </>
                )}
              </div>
            ))}
            {(editableResume?.certifications || []).length === 0 && !isEditing && (
              <div className="text-center py-8 border-2 border-dashed border-border/30 rounded-lg">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground-muted">No certifications added yet.</p>
                <Button variant="outline" onClick={() => setIsEditing(true)} className="mt-3 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Certification
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card className="glass-card border-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/30 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Briefcase className="h-5 w-5 text-neon-purple" />
              Portfolio
            </CardTitle>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={handleAddPortfolio} className="gap-2 border-neon-purple text-neon-purple hover:bg-neon-purple/10">
                <Plus className="h-4 w-4" />
                Add Project
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {(editableResume?.portfolio || []).map((item, index) => (
              <div key={index} className="p-4 glass-panel rounded-lg border border-border/30">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Project Title</label>
                      <Input 
                        value={item.title || ""} 
                        onChange={(e) => handlePortfolioChange(index, 'title', e.target.value)}
                        placeholder="e.g., DeFi Lending Protocol"
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Description</label>
                      <Textarea 
                        value={item.description || ""} 
                        onChange={(e) => handlePortfolioChange(index, 'description', e.target.value)}
                        placeholder="Describe your project, technologies used, and your role..."
                        className="bg-background/50 min-h-[100px]"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Project URL (Optional)</label>
                        <Input 
                          value={item.url || ""} 
                          onChange={(e) => handlePortfolioChange(index, 'url', e.target.value)}
                          placeholder="https://github.com/..."
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Image URL (Optional)</label>
                        <Input 
                          value={item.image_url || ""} 
                          onChange={(e) => handlePortfolioChange(index, 'image_url', e.target.value)}
                          placeholder="https://..."
                          className="bg-background/50"
                        />
                      </div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleRemovePortfolio(index)} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{item.title}</h3>
                        <p className="text-foreground-muted text-sm mt-2 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-lg mt-3 border border-border/30"
                      />
                    )}
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-neon-cyan hover:underline mt-3 inline-block font-medium"
                      >
                        View Project →
                      </a>
                    )}
                  </>
                )}
              </div>
            ))}
            {(editableResume?.portfolio || []).length === 0 && !isEditing && (
              <div className="text-center py-8 border-2 border-dashed border-border/30 rounded-lg">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground-muted">No portfolio items added yet.</p>
                <Button variant="outline" onClick={() => setIsEditing(true)} className="mt-3 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Project
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              {!initialUserData?.resume ? "Create Your Resume" : "Professional Resume"}
            </h1>
            <p className="text-foreground-muted mt-1">
              {!initialUserData?.resume 
                ? "Build your professional profile to showcase your skills and experience" 
                : "Manage and update your professional information"
              }
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSaveChanges} className="gap-2 bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSubmitToBlockchain} 
                  className="gap-2 bg-gradient-to-r from-neon-cyan to-neon-purple text-white hover:from-neon-cyan/90 hover:to-neon-purple/90 border-0"
                >
                  <Shield className="h-4 w-4" />
                  Submit to Blockchain
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} className="gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} className="gap-2 bg-primary hover:bg-primary/90">
                  <Edit3 className="h-4 w-4" />
                  Edit Resume
                </Button>
                <Button variant="outline" onClick={onComplete} className="gap-2">
                  Back to Dashboard
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="glass-card border border-border/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground-muted">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color.replace('text-', 'bg-')}/10`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Resume Content */}
        {renderResumeSection()}

        {/* Action Buttons for Mobile */}
        <div className="fixed bottom-6 left-6 right-6 sm:hidden">
          <div className="glass-card p-4 rounded-lg border border-border/30">
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveChanges} className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit} className="flex-1 gap-2">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="flex-1 gap-2">
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;