import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const UserProfilePage = () => {
  const [searchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [userRole, setUserRole] = useState<"freelancer" | "client">("freelancer");
  const [userData, setUserData] = useState({
    authority: "9sR5S...8Hd3k",
    name: "John Doe",
    is_client: true,
    is_freelancer: true,
    reputation: 92,
    completed_jobs: 47,
    created_at: 1672531200,
    resume: {
      education: [
        {
          institution: "Stanford University",
          degree: "Master of Science",
          field_of_study: "Computer Science",
          start_date: 1577836800,
          end_date: 1640995200,
          grade: "4.0 GPA",
          description: "Specialized in blockchain technology and distributed systems"
        }
      ],
      experience: [
        {
          company: "Web3 Innovations",
          position: "Senior Blockchain Developer",
          start_date: 1643673600,
          end_date: null,
          responsibilities: "Developed smart contracts for DeFi protocols, conducted security audits, and designed tokenomics"
        }
      ],
      skills: ["Solidity", "Rust", "TypeScript", "React", "Anchor Framework", "Smart Contract Security"],
      certifications: [
        {
          name: "Certified Blockchain Developer",
          issuing_organization: "Blockchain Council",
          issue_date: 1633046400,
          expiration_date: 1664582400,
          credential_id: "CBD-0821-4736",
          credential_url: "https://blockchain-council.org/certify/08214736"
        }
      ],
      portfolio: [
        {
          title: "DeFi Lending Protocol",
          description: "A fully decentralized lending platform with automated interest rates",
          url: "https://github.com/johndoe/lending-protocol",
          image_url: "https://example.com/portfolio/defi-lending.png"
        }
      ],
      last_update: 1672531200
    },
    disputes_raised: 2,
    disputes_resolved: 1,
    total_earnings: 1247000000,
    total_spent: 567000000,
    active_jobs: 3,
    pending_jobs: 2,
    cancelled_jobs: 5
  });

  // State for editable resume data
  const [editableResume, setEditableResume] = useState(userData.resume);
  const [editableUserData, setEditableUserData] = useState(userData);

  useEffect(() => {
    const role = searchParams.get("role");
    if (role === "freelancer" || role === "client") {
      setUserRole(role);
    }
  }, [searchParams]);

  // Update editable data when user data changes
  useEffect(() => {
    setEditableUserData(userData);
    setEditableResume(userData.resume || {
      education: [],
      experience: [],
      skills: [],
      certifications: [],
      portfolio: [],
      last_update: Date.now() / 1000
    });
  }, [userData]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Present";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatSol = (lamports) => {
    return (lamports / 1000000000).toFixed(2) + " SOL";
  };

  const handleSaveChanges = () => {
    // Update the main user data with edited values
    setUserData({
      ...editableUserData,
      resume: editableResume
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Reset editable data to original user data
    setEditableUserData(userData);
    setEditableResume(userData.resume || {
      education: [],
      experience: [],
      skills: [],
      certifications: [],
      portfolio: [],
      last_update: Date.now() / 1000
    });
    setIsEditing(false);
  };

  const handleAddEducation = () => {
    setEditableResume({
      ...editableResume,
      education: [
        ...editableResume.education,
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

  const handleRemoveEducation = (index) => {
    const newEducation = [...editableResume.education];
    newEducation.splice(index, 1);
    setEditableResume({
      ...editableResume,
      education: newEducation
    });
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...editableResume.education];
    newEducation[index] = {
      ...newEducation[index],
      [field]: value
    };
    setEditableResume({
      ...editableResume,
      education: newEducation
    });
  };

  const handleAddSkill = () => {
    setEditableResume({
      ...editableResume,
      skills: [...editableResume.skills, ""]
    });
  };

  const handleRemoveSkill = (index) => {
    const newSkills = [...editableResume.skills];
    newSkills.splice(index, 1);
    setEditableResume({
      ...editableResume,
      skills: newSkills
    });
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...editableResume.skills];
    newSkills[index] = value;
    setEditableResume({
      ...editableResume,
      skills: newSkills
    });
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
    if (!editableResume) {
      return (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume
            </CardTitle>
            <CardDescription>No resume information available</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload Resume
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Education */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education
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
              <div key={index} className="p-4 glass-panel rounded-lg">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Institution</label>
                        <Input 
                          value={edu.institution || ""} 
                          onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Degree</label>
                        <Input 
                          value={edu.degree || ""} 
                          onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Field of Study</label>
                      <Input 
                        value={edu.field_of_study || ""} 
                        onChange={(e) => handleEducationChange(index, 'field_of_study', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <Input 
                          type="date"
                          value={edu.start_date ? new Date(edu.start_date * 1000).toISOString().split('T')[0] : ""} 
                          onChange={(e) => handleEducationChange(index, 'start_date', new Date(e.target.value).getTime() / 1000)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <Input 
                          type="date"
                          value={edu.end_date ? new Date(edu.end_date * 1000).toISOString().split('T')[0] : ""} 
                          onChange={(e) => handleEducationChange(index, 'end_date', e.target.value ? new Date(e.target.value).getTime() / 1000 : null)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Grade</label>
                      <Input 
                        value={edu.grade || ""} 
                        onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea 
                        value={edu.description || ""} 
                        onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
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
                        <h3 className="font-semibold">{edu.institution}</h3>
                        <p className="text-foreground-muted">{edu.degree} in {edu.field_of_study}</p>
                        {edu.grade && <p className="text-sm text-foreground-muted">Grade: {edu.grade}</p>}
                      </div>
                      <div className="text-right text-sm text-foreground-muted">
                        <p>{formatDate(edu.start_date)} - {formatDate(edu.end_date)}</p>
                      </div>
                    </div>
                    {edu.description && (
                      <p className="mt-2 text-sm">{edu.description}</p>
                    )}
                  </>
                )}
              </div>
            ))}
            {editableResume.education.length === 0 && !isEditing && (
              <p className="text-foreground-muted text-center py-4">No education information added yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Skills
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
                      placeholder="Enter a skill"
                    />
                    <Button variant="destructive" size="icon" onClick={() => handleRemoveSkill(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {editableResume.skills.length === 0 && (
                  <p className="text-foreground-muted text-center py-4">No skills added yet.</p>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {editableResume.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
                {editableResume.skills.length === 0 && (
                  <p className="text-foreground-muted">No skills added yet.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Other resume sections would follow similar patterns */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editableResume.experience.length > 0 ? (
              <div className="space-y-4">
                {editableResume.experience.map((exp, index) => (
                  <div key={index} className="p-4 glass-panel rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{exp.company}</h3>
                        <p className="text-foreground-muted">{exp.position}</p>
                      </div>
                      <div className="text-right text-sm text-foreground-muted">
                        <p>{formatDate(exp.start_date)} - {formatDate(exp.end_date)}</p>
                      </div>
                    </div>
                    {exp.responsibilities && (
                      <p className="mt-2 text-sm">{exp.responsibilities}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-foreground-muted text-center py-4">No experience information added yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Certifications and Portfolio sections would follow similar patterns */}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSaveChanges} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} className="gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="gap-2">
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-panel p-1 w-full flex flex-wrap">
            <TabsTrigger value="overview" className="flex-1 min-w-[120px]">Overview</TabsTrigger>
            <TabsTrigger value="resume" className="flex-1 min-w-[120px]">Resume</TabsTrigger>
            <TabsTrigger value="activity" className="flex-1 min-w-[120px]">Activity</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 min-w-[120px]">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* User Card */}
            <Card className="glass-card overflow-hidden">
              <div className="bg-gradient-primary h-32"></div>
              <CardContent className="relative -mt-16">
                <div className="flex flex-col md:flex-row md:items-end gap-6">
                  <div className="w-24 h-24 rounded-full bg-background border-4 border-background flex items-center justify-center">
                    <User className="h-12 w-12 text-foreground-muted" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold">{editableUserData.name}</h2>
                        <div className="flex items-center gap-2 mt-5">
                          {editableUserData.is_freelancer && (
                            <Badge variant="outline" className="bg-neon-cyan/20 text-neon-cyan">
                              Freelancer
                            </Badge>
                          )}
                          {editableUserData.is_client && (
                            <Badge variant="outline" className="bg-neon-purple/20 text-neon-purple">
                              Client
                            </Badge>
                          )}
                          <span className="text-foreground-muted">
                            Member since {formatDate(editableUserData.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-12">
                        <Star className="h-5 w-5 text-neon-gold fill-neon-gold" />
                        <span className="font-semibold">
                          {(editableUserData.reputation / 20).toFixed(1)}/5.0
                        </span>
                        <span className="text-foreground-muted">({editableUserData.completed_jobs} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="glass-card p-6 hover-lift">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-opacity-20 ${stat.color.replace('text-', 'bg-')} flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  {typeof stat.value === 'number' && stat.max ? (
                    <>
                      <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}/{stat.max}</h3>
                      <Progress value={stat.value} className="h-2 mt-2" />
                    </>
                  ) : (
                    <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
                  )}
                  <p className="text-foreground-muted text-sm">{stat.title}</p>
                </Card>
              ))}
            </div>

            {/* Job Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Job Statistics</h3>
                  <Briefcase className="h-5 w-5 text-foreground-muted" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Active Jobs</span>
                    <span className="font-semibold">{editableUserData.active_jobs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Pending Jobs</span>
                    <span className="font-semibold">{editableUserData.pending_jobs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Completed Jobs</span>
                    <span className="font-semibold text-success">{editableUserData.completed_jobs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Cancelled Jobs</span>
                    <span className="font-semibold text-destructive">{editableUserData.cancelled_jobs}</span>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Financial Summary</h3>
                  <DollarSign className="h-5 w-5 text-foreground-muted" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Total Earnings</span>
                    <span className="font-semibold text-success">{formatSol(editableUserData.total_earnings)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Total Spent</span>
                    <span className="font-semibold">{formatSol(editableUserData.total_spent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Net Balance</span>
                    <span className="font-semibold text-neon-gold">
                      {formatSol(editableUserData.total_earnings - editableUserData.total_spent)}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Dispute History</h3>
                  <Shield className="h-5 w-5 text-foreground-muted" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Disputes Raised</span>
                    <span className="font-semibold">{editableUserData.disputes_raised}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Disputes Resolved</span>
                    <span className="font-semibold text-success">{editableUserData.disputes_resolved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-muted">Resolution Rate</span>
                    <span className="font-semibold">
                      {editableUserData.disputes_raised > 0 
                        ? ((editableUserData.disputes_resolved / editableUserData.disputes_raised) * 100).toFixed(0) + '%'
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Resume Tab */}
          <TabsContent value="resume">
            {renderResumeSection()}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent jobs and transactions on WorkSphere</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 glass-panel rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Smart Contract Development</h3>
                        <p className="text-foreground-muted text-sm">Completed • 12.5 SOL earned</p>
                      </div>
                    </div>
                    <span className="text-foreground-muted text-sm">2 days ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 glass-panel rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-neon-cyan" />
                      </div>
                      <div>
                        <h3 className="font-semibold">NFT Marketplace Design</h3>
                        <p className="text-foreground-muted text-sm">In progress • 8.2 SOL pending</p>
                      </div>
                    </div>
                    <span className="text-foreground-muted text-sm">1 week ago</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 glass-panel rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-destructive/20 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Dispute: DeFi Protocol Audit</h3>
                        <p className="text-foreground-muted text-sm">Resolved in your favor</p>
                      </div>
                    </div>
                    <span className="text-foreground-muted text-sm">2 weeks ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Display Name</label>
                      <Input 
                        value={editableUserData.name} 
                        onChange={(e) => setEditableUserData({...editableUserData, name: e.target.value})}
                        disabled={!isEditing} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Wallet Address</label>
                      <Input value={editableUserData.authority} disabled />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Role Settings</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="is_freelancer" 
                        checked={editableUserData.is_freelancer} 
                        onChange={(e) => setEditableUserData({...editableUserData, is_freelancer: e.target.checked})}
                        disabled={!isEditing}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <label htmlFor="is_freelancer" className="text-sm font-medium">
                        Freelancer Account
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="is_client" 
                        checked={editableUserData.is_client} 
                        onChange={(e) => setEditableUserData({...editableUserData, is_client: e.target.checked})}
                        disabled={!isEditing}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <label htmlFor="is_client" className="text-sm font-medium">
                        Client Account
                      </label>
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveChanges}>
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfilePage;