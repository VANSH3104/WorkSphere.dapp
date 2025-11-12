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
  Trash2,
  Play,
  Pause,
  SkipForward,
  Zap,
  Package
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/(module)/ui/card";
import { Button } from "@/app/(module)/ui/button";
import { Input } from "@/app/(module)/ui/input";
import { Textarea } from "@/app/(module)/ui/textarea";
import { Badge } from "@/app/(module)/ui/badge";
import { Progress } from "@/app/(module)/ui/progress";
import { useWallet } from "@solana/wallet-adapter-react";

// Type definitions - PERFECTLY MATCHING YOUR RUST BACKEND (snake_case)
interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: number;
  endDate: number;
  grade: string;
  description: string;
}

interface Experience {
  company: string;
  position: string;
  startDate: number;
  endDate: number;
  responsibilities: string;
}

interface Certification {
  name: string;
  issuing_organization: string;
  issue_date: number;
  expiration_date: number;
  credential_id: string;
  credential_url: string;
}

interface PortfolioItem {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
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
  resume: Resume | null;
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
  const { wallet, publicKey } = useWallet();
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");

  // Default resume structure - MATCHING RUST BACKEND
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
    authority: publicKey?.toString() || "",
    name: "John Doe",
    is_client: role === "client",
    is_freelancer: role === "freelancer",
    reputation: 50,
    completed_jobs: 0,
    created_at: Math.floor(Date.now() / 1000),
    resume: defaultResume,
    disputes_raised: 0,
    disputes_resolved: 0,
    total_earnings: 0,
    total_spent: 0,
    active_jobs: 0,
    pending_jobs: 0,
    cancelled_jobs: 0
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

  // FIXED: Data preparation that EXACTLY matches Rust structure
  const prepareForBlockchain = (resume: Resume) => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    // Use snake_case to match Rust exactly
    const blockchainResume = {
      education: resume.education.map(edu => ({
        institution: edu.institution.substring(0, 50),
        degree: edu.degree.substring(0, 50),
        fieldOfStudy: edu.fieldOfStudy.substring(0, 50), // snake_case
        startDate: new BN(edu.startDate > 0 ? edu.startDate : currentTimestamp),
        endDate: new BN(edu.endDate > 0 ? edu.endDate : 0),
        grade: edu.grade.substring(0, 20),
        description: edu.description.substring(0, 200)
      })),
      experience: resume.experience.map(exp => ({
        company: exp.company.substring(0, 50),
        position: exp.position.substring(0, 50),
        startDate: new BN(exp.startDate > 0 ? exp.startDate : currentTimestamp),
        endDate: new BN(exp.endDate > 0 ? exp.endDate : 0),
        responsibilities: exp.responsibilities.substring(0, 300)
      })),
      skills: resume.skills.map(skill => skill.substring(0, 50)),
      certifications: resume.certifications.map(cert => ({
        name: cert.name.substring(0, 50),
        issuing_organization: cert.issuing_organization.substring(0, 50), // snake_case
        issue_date: new BN(cert.issue_date > 0 ? cert.issue_date : currentTimestamp),
        expiration_date: new BN(cert.expiration_date > 0 ? cert.expiration_date : 0),
        credential_id: cert.credential_id.substring(0, 50), // snake_case
        credential_url: cert.credential_url.substring(0, 100) // snake_case
      })),
      portfolio: resume.portfolio.map(item => ({
        title: item.title.substring(0, 50),
        description: item.description.substring(0, 200),
        url: item.url.substring(0, 100),
        imageUrl: item.imageUrl.substring(0, 100) // snake_case
      })),
      last_update: new BN(currentTimestamp)
    };
  
    console.log("🔍 Blockchain resume data (snake_case):", blockchainResume);
    return blockchainResume;
  };

  // FIXED: Blockchain upload with proper error handling
  const handleSubmitToBlockchain = async () => {
    try {
      if (!wallet?.adapter?.publicKey) {
        alert("Please connect your wallet first!");
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      setCurrentStep("Preparing data...");

      const program = getProgram(wallet.adapter);
      const [userPDA] = findUserPDA(wallet.adapter.publicKey);
      
      // Check if user account exists first
      try {
        await program.account.user.fetch(userPDA);
        console.log("✅ User account found");
      } catch (e) {
        alert("User account not found. Please register first!");
        setIsUploading(false);
        return;
      }

      setCurrentStep("Validating data...");
      setUploadProgress(20);

      // Validate data against Rust constraints
      const validationErrors = [];
      
      if (editableResume.education.length > 3) {
        validationErrors.push("Maximum 3 education entries allowed");
      }
      if (editableResume.experience.length > 3) {
        validationErrors.push("Maximum 3 experience entries allowed");
      }
      if (editableResume.skills.length > 10) {
        validationErrors.push("Maximum 10 skills allowed");
      }
      if (editableResume.certifications.length > 3) {
        validationErrors.push("Maximum 3 certifications allowed");
      }
      if (editableResume.portfolio.length > 3) {
        validationErrors.push("Maximum 3 portfolio items allowed");
      }

      if (validationErrors.length > 0) {
        alert("Validation errors:\n\n" + validationErrors.join("\n"));
        setIsUploading(false);
        return;
      }

      setCurrentStep("Formatting for blockchain...");
      setUploadProgress(40);

      // Prepare data that EXACTLY matches Rust structure
      const blockchainData = prepareForBlockchain(editableResume);

      console.log("🚀 Sending to blockchain:", blockchainData);

      setCurrentStep("Uploading to blockchain...");
      setUploadProgress(60);

      const txSig = await program.methods
        .updateResume(blockchainData)
        .accounts({
          user: userPDA,
          authority: wallet.adapter.publicKey,
        })
        .rpc();

      setUploadProgress(100);
      setCurrentStep("Upload complete!");

      console.log("✅ Transaction successful:", txSig);

      // Refresh data from blockchain with proper error handling
      setTimeout(async () => {
        try {
          const updatedUser = await program.account.user.fetch(userPDA);
          console.log("🔄 Updated user data from blockchain:", updatedUser);
          
          if (updatedUser.resume) {
            // Safely convert blockchain data back to frontend format
            const blockchainResume = updatedUser.resume;
            
            // Use optional chaining and null checks to prevent "cannot read undefined" errors
            const safeResume: Resume = {
              education: (blockchainResume.education || []).map((edu: any) => ({
                institution: edu?.institution || "",
                degree: edu?.degree || "",
                fieldOfStudy: edu?.fieldOfStudy || "",
                startDate: edu?.startDate?.toNumber?.() || 0,
                endDate: edu?.endDate?.toNumber?.() || 0,
                grade: edu?.grade || "",
                description: edu?.description || ""
              })),
              experience: (blockchainResume.experience || []).map((exp: any) => ({
                company: exp?.company || "",
                position: exp?.position || "",
                startDate: exp?.startDate?.toNumber?.() || 0,
                endDate: exp?.endDate?.toNumber?.() || 0,
                responsibilities: exp?.responsibilities || ""
              })),
              skills: blockchainResume.skills || [],
              certifications: (blockchainResume.certifications || []).map((cert: any) => ({
                name: cert?.name || "",
                issuing_organization: cert?.issuing_organization || "",
                issue_date: cert?.issue_date?.toNumber?.() || 0,
                expiration_date: cert?.expiration_date?.toNumber?.() || 0,
                credential_id: cert?.credential_id || "",
                credential_url: cert?.credential_url || ""
              })),
              portfolio: (blockchainResume.portfolio || []).map((item: any) => ({
                title: item?.title || "",
                description: item?.description || "",
                url: item?.url || "",
                imageUrl: item?.imageUrl || ""
              })),
              last_update: blockchainResume?.last_update?.toNumber?.() || Math.floor(Date.now() / 1000)
            };
            
            setEditableResume(safeResume);
          }
        } catch (error) {
          console.error("Error refreshing data:", error);
        }
        setIsUploading(false);
      }, 2000);

      alert(`✅ Resume successfully updated on blockchain!\n\nTransaction: ${txSig}`);
      
      handleSaveChanges();

    } catch (error: any) {
      console.error("❌ Blockchain error:", error);
      
      let errorMsg = "Failed to submit resume to blockchain.\n\n";
      
      if (error.message?.includes("indeterminate span")) {
        errorMsg += "Data structure issue. Please check field names match backend.";
      } else if (error.message?.includes("Transaction too large")) {
        errorMsg += "Data too large. Please reduce text lengths.";
      } else if (error.message?.includes("Account does not exist")) {
        errorMsg += "User account not found. Please register first!";
      } else {
        errorMsg += "Error: " + (error.message || "Unknown error");
      }
      
      if (error.logs && error.logs.length > 0) {
        console.log("📋 Transaction logs:", error.logs);
        errorMsg += "\n\nCheck browser console for detailed logs.";
      }
      
      alert(errorMsg);
      setIsUploading(false);
    }
  };

  const formatDate = (timestamp: number): string => {
    if (!timestamp || timestamp === 0 || timestamp < 31536000) {
      return "Present";
    }
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  // Education handlers
  const handleAddEducation = (): void => {
    if (editableResume.education.length >= 3) {
      alert("Maximum 3 education entries allowed");
      return;
    }
    const currentTimestamp = Math.floor(Date.now() / 1000);
    setEditableResume(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          institution: "",
          degree: "",
          fieldOfStudy: "",
          startDate: currentTimestamp,
          endDate: 0,
          grade: "",
          description: ""
        }
      ]
    }));
  };

  const handleRemoveEducation = (index: number): void => {
    const newEducation = [...editableResume.education];
    newEducation.splice(index, 1);
    setEditableResume(prev => ({
      ...prev,
      education: newEducation
    }));
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string | number | null): void => {
    const newEducation = [...editableResume.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value
    };
    setEditableResume(prev => ({
      ...prev,
      education: newEducation
    }));
  };

  // Experience handlers
  const handleAddExperience = (): void => {
    if (editableResume.experience.length >= 3) {
      alert("Maximum 3 experience entries allowed");
      return;
    }
    const currentTimestamp = Math.floor(Date.now() / 1000);
    setEditableResume(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: "",
          position: "",
          startDate: currentTimestamp,
          endDate: 0,
          responsibilities: ""
        }
      ]
    }));
  };

  const handleRemoveExperience = (index: number): void => {
    const newExperience = [...editableResume.experience];
    newExperience.splice(index, 1);
    setEditableResume(prev => ({
      ...prev,
      experience: newExperience
    }));
  };

  const handleExperienceChange = (index: number, field: keyof Experience, value: string | number | null): void => {
    const newExperience = [...editableResume.experience];
    newExperience[index] = {
      ...newExperience[index],
      [field]: value
    };
    setEditableResume(prev => ({
      ...prev,
      experience: newExperience
    }));
  };

  // Skills handlers
  const handleAddSkill = (): void => {
    if (editableResume.skills.length >= 10) {
      alert("Maximum 10 skills allowed");
      return;
    }
    setEditableResume(prev => ({
      ...prev,
      skills: [...prev.skills, ""]
    }));
  };

  const handleRemoveSkill = (index: number): void => {
    const newSkills = [...editableResume.skills];
    newSkills.splice(index, 1);
    setEditableResume(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  const handleSkillChange = (index: number, value: string): void => {
    const newSkills = [...editableResume.skills];
    newSkills[index] = value;
    setEditableResume(prev => ({
      ...prev,
      skills: newSkills
    }));
  };

  // Certification handlers
  const handleAddCertification = (): void => {
    if (editableResume.certifications.length >= 3) {
      alert("Maximum 3 certifications allowed");
      return;
    }
    const currentTimestamp = Math.floor(Date.now() / 1000);
    setEditableResume(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          name: "",
          issuing_organization: "",
          issue_date: currentTimestamp,
          expiration_date: 0,
          credential_id: "",
          credential_url: ""
        }
      ]
    }));
  };

  const handleRemoveCertification = (index: number): void => {
    const newCertifications = [...editableResume.certifications];
    newCertifications.splice(index, 1);
    setEditableResume(prev => ({
      ...prev,
      certifications: newCertifications
    }));
  };

  const handleCertificationChange = (index: number, field: keyof Certification, value: string | number | null): void => {
    const newCertifications = [...editableResume.certifications];
    newCertifications[index] = {
      ...newCertifications[index],
      [field]: value
    };
    setEditableResume(prev => ({
      ...prev,
      certifications: newCertifications
    }));
  };

  // Portfolio handlers
  const handleAddPortfolio = (): void => {
    if (editableResume.portfolio.length >= 3) {
      alert("Maximum 3 portfolio items allowed");
      return;
    }
    setEditableResume(prev => ({
      ...prev,
      portfolio: [
        ...prev.portfolio,
        {
          title: "",
          description: "",
          url: "",
          imageUrl: ""
        }
      ]
    }));
  };

  const handleRemovePortfolio = (index: number): void => {
    const newPortfolio = [...editableResume.portfolio];
    newPortfolio.splice(index, 1);
    setEditableResume(prev => ({
      ...prev,
      portfolio: newPortfolio
    }));
  };

  const handlePortfolioChange = (index: number, field: keyof PortfolioItem, value: string): void => {
    const newPortfolio = [...editableResume.portfolio];
    newPortfolio[index] = {
      ...newPortfolio[index],
      [field]: value
    };
    setEditableResume(prev => ({
      ...prev,
      portfolio: newPortfolio
    }));
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              Professional Resume
            </h1>
            <p className="text-foreground-muted mt-1">
              Build your professional profile on the blockchain
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
                  className="gap-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
                  disabled={isUploading}
                >
                  <Shield className="h-4 w-4" />
                  {isUploading ? "Uploading..." : "Save to Blockchain"}
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} className="gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="gap-2 bg-primary hover:bg-primary/90">
                <Edit3 className="h-4 w-4" />
                Edit Resume
              </Button>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <Card className="glass-card border-2 border-neon-cyan/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-neon-cyan" />
                Uploading to Blockchain
              </CardTitle>
              <CardDescription>{currentStep}</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={uploadProgress} className="w-full h-3" />
              <div className="flex justify-between text-sm text-foreground-muted mt-2">
                <span>Progress: {Math.round(uploadProgress)}%</span>
                <span>{currentStep}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Education Section */}
        <Card className="glass-card border-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-neon-cyan" />
              Education {editableResume.education.length}/3
            </CardTitle>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={handleAddEducation} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Education
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {editableResume.education.map((edu, index) => (
              <div key={index} className="p-4 glass-panel rounded-lg border border-border/30">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Institution *</label>
                        <Input 
                          value={edu.institution} 
                          onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                          placeholder="University Name"
                          className="bg-background/50"
                          maxLength={50}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Degree *</label>
                        <Input 
                          value={edu.degree} 
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                          placeholder="Bachelor's Degree"
                          className="bg-background/50"
                          maxLength={50}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Field of Study</label>
                      <Input 
                        value={edu.fieldOfStudy} 
                        onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                        placeholder="Computer Science"
                        className="bg-background/50"
                        maxLength={50}
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
                              {edu.startDate ? format(new Date(edu.startDate * 1000), "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={edu.startDate ? new Date(edu.startDate * 1000) : undefined}
                              onSelect={(date) => handleEducationChange(index, 'startDate', date ? Math.floor(date.getTime() / 1000) : Math.floor(Date.now() / 1000))}
                              initialFocus
                              fromYear={1960}
                              toYear={new Date().getFullYear()}
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
                              {edu.endDate ? format(new Date(edu.endDate * 1000), "PPP") : "Present"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={edu.endDate ? new Date(edu.endDate * 1000) : undefined}
                              onSelect={(date) => handleEducationChange(index, 'endDate', date ? Math.floor(date.getTime() / 1000) : 0)}
                              initialFocus
                              fromYear={1960}
                              toYear={new Date().getFullYear() + 10}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Grade</label>
                      <Input 
                        value={edu.grade} 
                        onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
                        placeholder="GPA or Grade"
                        className="bg-background/50"
                        maxLength={20}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Description</label>
                      <Textarea 
                        value={edu.description} 
                        onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                        placeholder="Description of your education..."
                        className="bg-background/50 min-h-[80px]"
                        maxLength={200}
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
                        <p className="text-foreground-muted">{edu.degree} in {edu.fieldOfStudy}</p>
                        {edu.grade && <p className="text-sm text-foreground-muted mt-1">Grade: {edu.grade}</p>}
                      </div>
                      <div className="text-right text-sm text-foreground-muted">
                        <p>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p>
                      </div>
                    </div>
                    {edu.description && (
                      <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{edu.description}</p>
                    )}
                  </>
                )}
              </div>
            ))}
            {editableResume.education.length === 0 && !isEditing && (
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

        {/* Experience Section */}
        <Card className="glass-card border-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-neon-purple" />
              Experience {editableResume.experience.length}/3
            </CardTitle>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={handleAddExperience} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Experience
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {editableResume.experience.map((exp, index) => (
              <div key={index} className="p-4 glass-panel rounded-lg border border-border/30">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Company *</label>
                        <Input 
                          value={exp.company} 
                          onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                          placeholder="Company Name"
                          className="bg-background/50"
                          maxLength={50}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Position *</label>
                        <Input 
                          value={exp.position} 
                          onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                          placeholder="Job Title"
                          className="bg-background/50"
                          maxLength={50}
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
                              {exp.startDate ? format(new Date(exp.startDate * 1000), "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={exp.startDate ? new Date(exp.startDate * 1000) : undefined}
                              onSelect={(date) => handleExperienceChange(index, 'startDate', date ? Math.floor(date.getTime() / 1000) : Math.floor(Date.now() / 1000))}
                              initialFocus
                              fromYear={1960}
                              toYear={new Date().getFullYear()}
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
                              {exp.endDate ? format(new Date(exp.endDate * 1000), "PPP") : "Present"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={exp.endDate ? new Date(exp.endDate * 1000) : undefined}
                              onSelect={(date) => handleExperienceChange(index, 'endDate', date ? Math.floor(date.getTime() / 1000) : 0)}
                              initialFocus
                              fromYear={1960}
                              toYear={new Date().getFullYear() + 10}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Responsibilities</label>
                      <Textarea 
                        value={exp.responsibilities} 
                        onChange={(e) => handleExperienceChange(index, 'responsibilities', e.target.value)}
                        placeholder="Describe your key responsibilities and achievements..."
                        className="bg-background/50 min-h-[100px]"
                        maxLength={300}
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
                        <p>{formatDate(exp.startDate)} - {formatDate(exp.endDate)}</p>
                      </div>
                    </div>
                    {exp.responsibilities && (
                      <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{exp.responsibilities}</p>
                    )}
                  </>
                )}
              </div>
            ))}
            {editableResume.experience.length === 0 && !isEditing && (
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

        {/* Skills Section */}
        <Card className="glass-card border-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-neon-gold" />
              Skills {editableResume.skills.length}/10
            </CardTitle>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={handleAddSkill} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Skill
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                {editableResume.skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      value={skill} 
                      onChange={(e) => handleSkillChange(index, e.target.value)}
                      placeholder="Enter a skill (e.g., React, Solana, Rust)"
                      className="bg-background/50"
                      maxLength={50}
                    />
                    <Button variant="destructive" size="icon" onClick={() => handleRemoveSkill(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {editableResume.skills.length === 0 && (
                  <div className="text-center py-6">
                    <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-foreground-muted">No skills added yet. Click "Add Skill" to get started.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {editableResume.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-2 bg-primary/10 text-primary border-primary/20">
                    {skill}
                  </Badge>
                ))}
                {editableResume.skills.length === 0 && (
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

        {/* Certifications Section */}
        <Card className="glass-card border-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-neon-cyan" />
              Certifications {editableResume.certifications.length}/3
            </CardTitle>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={handleAddCertification} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Certification
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {editableResume.certifications.map((cert, index) => (
              <div key={index} className="p-4 glass-panel rounded-lg border border-border/30">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Certification Name *</label>
                        <Input 
                          value={cert.name} 
                          onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                          placeholder="e.g., AWS Solutions Architect"
                          className="bg-background/50"
                          maxLength={50}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Issuing Organization *</label>
                        <Input 
                          value={cert.issuing_organization} 
                          onChange={(e) => handleCertificationChange(index, 'issuing_organization', e.target.value)}
                          placeholder="e.g., Amazon Web Services"
                          className="bg-background/50"
                          maxLength={50}
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
                              onSelect={(date) => handleCertificationChange(index, 'issue_date', date ? Math.floor(date.getTime() / 1000) : Math.floor(Date.now() / 1000))}
                              initialFocus
                              fromYear={1960}
                              toYear={new Date().getFullYear()}
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
                              onSelect={(date) => handleCertificationChange(index, 'expiration_date', date ? Math.floor(date.getTime() / 1000) : 0)}
                              initialFocus
                              fromYear={new Date().getFullYear()}
                              toYear={new Date().getFullYear() + 10}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Credential ID (Optional)</label>
                        <Input 
                          value={cert.credential_id} 
                          onChange={(e) => handleCertificationChange(index, 'credential_id', e.target.value)}
                          placeholder="e.g., ABC-123-XYZ"
                          className="bg-background/50"
                          maxLength={50}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Credential URL (Optional)</label>
                        <Input 
                          value={cert.credential_url} 
                          onChange={(e) => handleCertificationChange(index, 'credential_url', e.target.value)}
                          placeholder="https://..."
                          className="bg-background/50"
                          maxLength={100}
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
            {editableResume.certifications.length === 0 && !isEditing && (
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

        {/* Portfolio Section */}
        <Card className="glass-card border-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-neon-purple" />
              Portfolio {editableResume.portfolio.length}/3
            </CardTitle>
            {isEditing && (
              <Button variant="outline" size="sm" onClick={handleAddPortfolio} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Project
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {editableResume.portfolio.map((item, index) => (
              <div key={index} className="p-4 glass-panel rounded-lg border border-border/30">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Project Title *</label>
                      <Input 
                        value={item.title} 
                        onChange={(e) => handlePortfolioChange(index, 'title', e.target.value)}
                        placeholder="e.g., DeFi Lending Protocol"
                        className="bg-background/50"
                        maxLength={50}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Description</label>
                      <Textarea 
                        value={item.description} 
                        onChange={(e) => handlePortfolioChange(index, 'description', e.target.value)}
                        placeholder="Describe your project, technologies used, and your role..."
                        className="bg-background/50 min-h-[100px]"
                        maxLength={200}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Project URL (Optional)</label>
                        <Input 
                          value={item.url} 
                          onChange={(e) => handlePortfolioChange(index, 'url', e.target.value)}
                          placeholder="https://github.com/..."
                          className="bg-background/50"
                          maxLength={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Image URL (Optional)</label>
                        <Input 
                          value={item.imageUrl} 
                          onChange={(e) => handlePortfolioChange(index, 'imageUrl', e.target.value)}
                          placeholder="https://..."
                          className="bg-background/50"
                          maxLength={100}
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
                    {item.imageUrl && (
                      <img 
                        src={item.imageUrl} 
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
            {editableResume.portfolio.length === 0 && !isEditing && (
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

        {/* Mobile Action Buttons */}
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