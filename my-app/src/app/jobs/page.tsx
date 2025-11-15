"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  SlidersHorizontal, 
  Grid3x3, 
  List, 
  Clock, 
  DollarSign,
  Briefcase,
  TrendingUp,
  Star,
  CheckCircle,
  Calendar,
  ArrowUpDown,
  Tag,
  X
} from "lucide-react";
import { Button } from "../(module)/ui/button";
import { Input } from "../(module)/ui/input";
import { Badge } from "../(module)/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchJobs, Job } from "@/(anchor)/actions/fetchjob";

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Blockchain & Web3",
  "Design & Creative",
  "Writing & Content",
  "Marketing & Sales",
  "Data & Analytics",
  "AI & Machine Learning",
  "other"
];

const SKILLS_OPTIONS = [
  "React", "TypeScript", "Solana", "Rust", "Python", "Node.js",
  "Smart Contracts", "Web3", "UI/UX Design", "Figma", "Photoshop",
  "Content Writing", "SEO", "Marketing", "Data Analysis", "Machine Learning", "other"
];

type TimeFilter = "all" | "latest" | "24h" | "7d" | "30d";
type SortOption = "newest" | "oldest" | "budget-high" | "budget-low";

const JobListingPage = () => {
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const { wallet } = useWallet();
  
  const userRole = searchParams.get("role") || "freelancer";
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillsSearch, setSkillsSearch] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      if (!wallet?.adapter?.publicKey) {
        setJobs([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchJobs(wallet.adapter, {
          statusFilter: "open"
        });
        setJobs(data);
      } catch (err) {
        console.error('Failed to load jobs:', err);
        setError('Failed to load jobs');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [wallet?.adapter?.publicKey, statusFilter]);

  // Format job status for display
  const formatJobStatus = (status: any) => {
    if (!status) return "Unknown";
    const statusKey = Object.keys(status)[0];
    return statusKey.charAt(0).toUpperCase() + statusKey.slice(1);
  };

  // Format budget display
  const formatBudget = (budget: number) => {
    const budgetlamp = budget/1000000000
    return `${budgetlamp} SOL`;
  };

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return `${Math.floor(diff / 604800)} weeks ago`;
  };

  // Get status color 
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

  // Filter jobs based on time
  const filterJobsByTime = (jobs: Job[], filter: TimeFilter) => {
    const now = Math.floor(Date.now() / 1000);
    
    switch (filter) {
      case "latest":
        return jobs.sort((a, b) => b.account.createdAt - a.account.createdAt).slice(0, 10);
      case "24h":
        return jobs.filter(job => (now - job.account.createdAt) <= 86400);
      case "7d":
        return jobs.filter(job => (now - job.account.createdAt) <= 604800);
      case "30d":
        return jobs.filter(job => (now - job.account.createdAt) <= 2592000);
      default:
        return jobs;
    }
  };

  // Sort jobs based on selected option
  const sortJobs = (jobs: Job[], sortBy: SortOption) => {
    switch (sortBy) {
      case "newest":
        return [...jobs].sort((a, b) => b.account.createdAt - a.account.createdAt);
      case "oldest":
        return [...jobs].sort((a, b) => a.account.createdAt - b.account.createdAt);
      case "budget-high":
        return [...jobs].sort((a, b) => b.account.budget - a.account.budget);
      case "budget-low":
        return [...jobs].sort((a, b) => a.account.budget - b.account.budget);
      default:
        return jobs;
    }
  };

  // Extract skills from job account data
  const extractSkillsFromJob = (job: Job): string[] => {
    // Use actual skills data from the job account
    if (job.account.skills && Array.isArray(job.account.skills) && job.account.skills.length > 0) {
      return job.account.skills;
    }
    
    // Fallback: extract from description if skills array is empty
    const description = job.account.description.toLowerCase();
    const commonSkills = ["React", "TypeScript", "Solana", "Rust", "Python", "Node.js"];
    return commonSkills.filter(skill => 
      description.includes(skill.toLowerCase())
    ).slice(0, 3);
  };

  // Extract category from job account data
  const extractCategoryFromJob = (job: Job): string => {
    // Use actual category data from the job account
    if (job.account.category && job.account.category !== "other") {
      return job.account.category;
    }
    
    // Fallback: extract from description if category is not set
    const description = job.account.description.toLowerCase();
    const title = job.account.title.toLowerCase();
    const text = `${title} ${description}`;

    // Blockchain & Web3
    if (
      text.includes("web3") || 
      text.includes("blockchain") || 
      text.includes("solana") ||
      text.includes("smart contract") ||
      text.includes("defi") ||
      text.includes("nft") ||
      text.includes("dao") ||
      text.includes("crypto") ||
      text.includes("ethereum") ||
      text.includes("solidity")
    ) {
      return "Blockchain & Web3";
    }

    // Web Development
    if (
      text.includes("react") || 
      text.includes("typescript") || 
      text.includes("web") && text.includes("develop") ||
      text.includes("frontend") ||
      text.includes("backend") ||
      text.includes("fullstack") ||
      text.includes("javascript") ||
      text.includes("node.js") ||
      text.includes("website") ||
      text.includes("web application")
    ) {
      return "Web Development";
    }

    // Mobile Development
    if (
      text.includes("mobile") || 
      text.includes("ios") || 
      text.includes("android") ||
      text.includes("react native") ||
      text.includes("flutter") ||
      text.includes("mobile app")
    ) {
      return "Mobile Development";
    }

    // Design & Creative
    if (
      text.includes("design") || 
      text.includes("figma") || 
      text.includes("ui") ||
      text.includes("ux") ||
      text.includes("user interface") ||
      text.includes("user experience") ||
      text.includes("graphic design") ||
      text.includes("photoshop") ||
      text.includes("creative") ||
      text.includes("visual design")
    ) {
      return "Design & Creative";
    }

    // Writing & Content
    if (
      text.includes("writing") || 
      text.includes("content") || 
      text.includes("copy") ||
      text.includes("article") ||
      text.includes("blog") ||
      text.includes("technical writing") ||
      text.includes("content creation") ||
      text.includes("copywriting")
    ) {
      return "Writing & Content";
    }

    // Marketing & Sales
    if (
      text.includes("marketing") || 
      text.includes("sales") || 
      text.includes("seo") ||
      text.includes("social media") ||
      text.includes("digital marketing") ||
      text.includes("content marketing") ||
      text.includes("email marketing") ||
      text.includes("campaign") ||
      text.includes("brand awareness")
    ) {
      return "Marketing & Sales";
    }

    // Data & Analytics
    if (
      text.includes("data") || 
      text.includes("analytics") || 
      text.includes("sql") ||
      text.includes("database") ||
      text.includes("data analysis") ||
      text.includes("data visualization") ||
      text.includes("statistics") ||
      text.includes("metrics")
    ) {
      return "Data & Analytics";
    }

    // AI & Machine Learning
    if (
      text.includes("ai") || 
      text.includes("machine learning") || 
      text.includes("artificial intelligence") ||
      text.includes("neural network") ||
      text.includes("deep learning") ||
      text.includes("nlp") ||
      text.includes("computer vision") ||
      text.includes("ml model")
    ) {
      return "AI & Machine Learning";
    }

    // Default category
    return "other";
  };

  // Filter jobs based on search query, categories, and skills
  const filteredJobs = jobs.filter(job => {
    // Text search
    const matchesSearch = 
      job.account.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.account.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter - use actual category from account with fallback
    const jobCategory = job.account.category && job.account.category !== "other" 
      ? job.account.category 
      : extractCategoryFromJob(job);
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(jobCategory);

    // Skills filter - use actual skills from account with fallback
    const jobSkills = job.account.skills && job.account.skills.length > 0 
      ? job.account.skills 
      : extractSkillsFromJob(job);
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.some(skill => jobSkills.includes(skill));

    return matchesSearch && matchesCategory && matchesSkills;
  });

  // Apply time filter and sorting
  const timeFilteredJobs = filterJobsByTime(filteredJobs, timeFilter);
  const sortedJobs = sortJobs(timeFilteredJobs, sortOption);

  // Get time filter label
  const getTimeFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case "latest": return "Latest";
      case "24h": return "24 Hours";
      case "7d": return "7 Days";
      case "30d": return "30 Days";
      default: return "All Time";
    }
  };

  // Get sort option label
  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case "newest": return "Newest First";
      case "oldest": return "Oldest First";
      case "budget-high": return "Budget: High to Low";
      case "budget-low": return "Budget: Low to High";
      default: return "Newest First";
    }
  };

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTimeFilter("all");
    setSortOption("newest");
    setSelectedCategories([]);
    setSelectedSkills([]);
    setSkillsSearch("");
  };

  // Filter skills based on search
  const filteredSkills = SKILLS_OPTIONS.filter(skill =>
    skill.toLowerCase().includes(skillsSearch.toLowerCase())
  );


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
                placeholder="Search by job titles, descriptions, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-background-elevated border-glass-border focus:border-primary h-12"
              />
            </div>

            {/* Advanced Filters Toggle */}
            <Button 
              variant="glass" 
              className="gap-2 h-12"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-5 w-5" />
              Filters
              {(timeFilter !== "all" || statusFilter !== "all" || sortOption !== "newest" || selectedCategories.length > 0 || selectedSkills.length > 0) && (
                <Badge variant="outline" className="ml-1 bg-primary/20 text-primary">
                  Active
                </Badge>
              )}
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
                onClick={() => navigate.push(`/manage-jobs/new`)}
                className="h-12"
              >
                Post New Job
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {(selectedCategories.length > 0 || selectedSkills.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedCategories.map(category => (
                <Badge key={category} variant="outline" className="bg-primary/20 text-primary border-primary/30">
                  {category}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => toggleCategory(category)}
                  />
                </Badge>
              ))}
              {selectedSkills.map(skill => (
                <Badge key={skill} variant="outline" className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">
                  {skill}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => toggleSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 pt-6 border-t border-glass-border space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Time Filter */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    <Clock className="h-4 w-4 inline mr-2" />
                    Time Posted
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["all", "latest", "24h", "7d", "30d"].map((time) => (
                      <Button
                        key={time}
                        variant={timeFilter === time ? "neon" : "glass"}
                        size="sm"
                        onClick={() => setTimeFilter(time as TimeFilter)}
                      >
                        {getTimeFilterLabel(time as TimeFilter)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    <ArrowUpDown className="h-4 w-4 inline mr-2" />
                    Sort By
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="bg-background-elevated border border-glass-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="budget-high">Budget: High to Low</option>
                      <option value="budget-low">Budget: Low to High</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-destructive hover:text-destructive"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>

              {/* Categories Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  <Tag className="h-4 w-4 inline mr-2" />
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategories.includes(category) ? "neon" : "glass"}
                      size="sm"
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Skills Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  <Tag className="h-4 w-4 inline mr-2" />
                  Skills
                </label>
                <div className="mb-3">
                  <Input
                    placeholder="Search skills..."
                    value={skillsSearch}
                    onChange={(e) => setSkillsSearch(e.target.value)}
                    className="bg-background-elevated border-glass-border"
                  />
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {filteredSkills.map((skill) => (
                    <Button
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "neon" : "glass"}
                      size="sm"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
        >
          <p className="text-foreground-muted">
            Showing {sortedJobs.length} {sortedJobs.length === 1 ? 'job' : 'jobs'}
            {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
            {timeFilter !== 'all' && ` • Time: ${getTimeFilterLabel(timeFilter)}`}
            {selectedCategories.length > 0 && ` • Categories: ${selectedCategories.length}`}
            {selectedSkills.length > 0 && ` • Skills: ${selectedSkills.length}`}
            {searchQuery && ` • Search: "${searchQuery}"`}
          </p>
          
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <ArrowUpDown className="h-4 w-4" />
            <span>Sorted by: {getSortLabel(sortOption)}</span>
          </div>
        </motion.div>

        {/* Job Grid/List */}
        {sortedJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center"
          >
            <Briefcase className="h-16 w-16 text-foreground-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No jobs found
            </h3>
            <p className="text-foreground-muted mb-6">
              {searchQuery 
                ? `No jobs match your search for "${searchQuery}"`
                : selectedCategories.length > 0 || selectedSkills.length > 0
                ? "No jobs match your selected filters"
                : statusFilter !== 'all'
                ? `No ${statusFilter} jobs available`
                : timeFilter !== 'all'
                ? `No jobs posted in the ${getTimeFilterLabel(timeFilter).toLowerCase()}`
                : "No jobs available at the moment"}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="ghost"
                onClick={clearAllFilters}
              >
                Clear Filters
              </Button>
              {userRole === "client" && (
                <Button
                  variant="neon"
                  onClick={() => navigate.push(`/manage-jobs/new`)}
                >
                  Post Your First Job
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : "space-y-6"}>
            {sortedJobs.map((job, index) => {
              const jobStatus = formatJobStatus(job.account.status);
              const postedDate = formatRelativeTime(job.account.createdAt);
              const mockProposals = job.account.bidders?.length || 0;
              const jobSkills = job.account.skills && job.account.skills.length > 0 
                ? job.account.skills 
                : extractSkillsFromJob(job);
              const jobCategory = job.account.category && job.account.category !== "other"
                ? job.account.category
                : extractCategoryFromJob(job);

              return (
                <motion.div
                  key={job.publicKey.toString()}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -8 }}
                  className="glass-card p-6 hover-lift cursor-pointer group"
                  onClick={() => navigate.push(`/jobs/${job.publicKey.toString()}?role=${userRole}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-neon-cyan transition-colors">
                        {job.account.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-foreground-muted">
                        
                          <Badge variant="outline" className="text-xs border-green-500/30 text-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        <div className="flex items-center gap-1 text-neon-gold">
                        </div>
                        <div className="flex items-center gap-1 text-foreground-muted">
                          <Calendar className="h-3 w-3" />
                          <span>{postedDate}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(jobStatus)}>
                      {jobStatus}
                    </Badge>
                  </div>

                  {/* Category */}
                  <div className="mb-3">
                    <Badge variant="outline" className="bg-neon-purple/20 text-neon-purple border-neon-purple/30 text-xs">
                      {jobCategory}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-foreground-muted mb-4 line-clamp-2">
                    {job.account.description}
                  </p>

                  {/* Skills */}
                  {jobSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {jobSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Job Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-neon-gold">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold">{formatBudget(job.account.budget)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground-muted">
                      <Briefcase className="h-4 w-4" />
                      <span>{mockProposals} proposals</span>
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-glass-border">
                    <div className="text-xs text-foreground-muted">
                      Job ID: {job.account.jobId.toString()}
                    </div>
                    
                    <div className="text-xs text-foreground-muted">
                      {job.account.client.toString().slice(0, 8)}...
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity rounded-xl pointer-events-none" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListingPage;