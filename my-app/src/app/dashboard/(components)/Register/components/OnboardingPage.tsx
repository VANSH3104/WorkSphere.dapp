"use client";
import { useState, useEffect } from "react";
import { User, Building, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/app/(module)/ui/button";
import { Input } from "@/app/(module)/ui/input";

const OnboardingPage = () => {
  const [selectedRole, setSelectedRole] = useState<"freelancer" | "client" | null>(null);
  const [name, setName] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState<"role" | "name">("role");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const roles = [
    {
      id: "freelancer" as const,
      title: "I'm a Freelancer",
      subtitle: "Ready to offer my skills",
      description: "Join our global network of talented freelancers. Showcase your skills and get paid in cryptocurrency.",
      icon: User,
      features: [
        "Create your professional profile",
        "Browse and bid on projects", 
        "Secure escrow payments",
        "Build your reputation"
      ],
      color: "neon-cyan"
    },
    {
      id: "client" as const,
      title: "I'm a Client", 
      subtitle: "Looking to hire talent",
      description: "Find the perfect freelancer for your project. Post jobs and manage projects with blockchain security.",
      icon: Building,
      features: [
        "Post unlimited projects",
        "Review qualified proposals",
        "Milestone-based payments", 
        "DAO dispute resolution"
      ],
      color: "neon-purple"
    }
  ];

  const handleRoleSelect = (role: "freelancer" | "client") => {
    setSelectedRole(role);
    setTimeout(() => {
      setCurrentStep("name");
    }, 800);
  };

  const handleBackToRole = () => {
    setCurrentStep("role");
    setTimeout(() => {
      setSelectedRole(null);
    }, 300);
  };

  const handleNameSubmit = () => {
    // Handle name submission and proceed to next step
    console.log({ name, role: selectedRole });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      {/* Geometric Grid Background Animation */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute inset-0 bg-grid-pattern bg-center bg-8 opacity-15"></div>
        <div className="absolute inset-0 bg-grid-animation"></div>
        
        {/* Animated Wave Effect */}
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-wave-pattern opacity-10 bg-cover bg-bottom wave-animation"></div>
        
        {/* Floating Geometric Shapes */}
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-neon-cyan/10 rounded-lg rotate-45 shape-float animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-neon-purple/10 rounded-full shape-float animation-delay-3000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-14 h-14 bg-neon-gold/10 rotate-12 shape-float animation-delay-4000"></div>
        <div className="absolute bottom-1/3 right-1/3 w-10 h-10 bg-neon-cyan/15 rounded-lg shape-float animation-delay-5000"></div>
      </div>

      <div className="container max-w-4xl mx-auto relative z-10">
        {/* Header with fade-in animation */}
        <div className={`text-center mb-8 transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple flex items-center justify-center logo-pulse">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple opacity-30 blur-md logo-glow"></div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="text-foreground">Welcome to </span>
            <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
              WorkSphere
            </span>
          </h1>
          <p className="text-lg text-foreground-muted max-w-xl mx-auto">
            {currentStep === "role" 
              ? "Choose your path in the future of decentralized freelancing"
              : "Tell us how we should address you"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${currentStep === "role" ? "text-primary" : "text-success"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === "role" ? "border-primary bg-primary/10" : "border-success bg-success/10"
              }`}>
                {currentStep === "name" ? (
                  <CheckCircle className="h-4 w-4 text-success" />
                ) : (
                  <span className="text-sm font-medium">1</span>
                )}
              </div>
              <span className="ml-2 text-sm font-medium">Role</span>
            </div>
            
            <div className={`w-12 h-0.5 ${currentStep === "name" ? "bg-success" : "bg-border"}`}></div>
            
            <div className={`flex items-center ${currentStep === "name" ? "text-primary" : "text-foreground-muted"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep === "name" ? "border-primary bg-primary/10" : "border-border"
              }`}>
                <span className="text-sm font-medium">2</span>
              </div>
              <span className="ml-2 text-sm font-medium">Profile</span>
            </div>
          </div>
        </div>

        {/* Role Selection Step */}
        {currentStep === "role" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {roles.map((role, index) => (
              <div
                key={role.id}
                className={`glass-card p-6 hover-lift cursor-pointer transition-all duration-500 group relative overflow-hidden border-2 ${
                  selectedRole === role.id ? `border-${role.color} shadow-lg` : 'border-transparent'
                } ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onClick={() => handleRoleSelect(role.id)}
              >
                {/* Selection Indicator */}
                {selectedRole === role.id && (
                  <div className="absolute top-4 right-4 animate-scale-in">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                )}

                {/* Subtle hover effect */}
                <div className={`absolute inset-0 bg-${role.color}/5 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300`}></div>

                {/* Role Icon with subtle animation */}
                <div className={`w-16 h-16 rounded-xl bg-${role.color}/20 p-4 mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto relative`}>
                  <role.icon className={`h-8 w-8 text-${role.color}`} />
                  <div className={`absolute inset-0 bg-${role.color}/20 rounded-xl blur-sm group-hover:opacity-50 opacity-0 transition-opacity duration-300`}></div>
                </div>

                {/* Role Content */}
                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-neon-cyan group-hover:to-neon-purple transition-all duration-300">
                    {role.title}
                  </h2>
                  <p className={`text-${role.color} font-medium mb-3 text-sm`}>
                    {role.subtitle}
                  </p>
                  <p className="text-foreground-muted mb-4 text-sm leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    {role.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 mb-5">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-xs group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: `${index * 50}ms` }}>
                        <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                        <span className="text-foreground-muted group-hover:text-foreground transition-colors duration-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button 
                    variant={selectedRole === role.id ? "default" : "neon"} 
                    size="sm" 
                    className="w-full group-hover:scale-105 transition-transform gap-2"
                    disabled={selectedRole === role.id}
                  >
                    {selectedRole === role.id ? (
                      <span>Setting up your workspace...</span>
                    ) : (
                      <>
                        <span>Get Started as {role.id === 'freelancer' ? 'Freelancer' : 'Client'}</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Name Input Step */}
        {currentStep === "name" && (
          <div className="max-w-md mx-auto">
            <div className="glass-card p-8 border-2 border-primary/20 hover-lift transition-all duration-500">
              {/* Selected Role Badge */}
              <div className="flex justify-center mb-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${roles.find(r => r.id === selectedRole)?.color}/20 border border-${roles.find(r => r.id === selectedRole)?.color}/30`}>
                  {selectedRole === "freelancer" ? (
                    <User className="h-4 w-4 text-neon-cyan" />
                  ) : (
                    <Building className="h-4 w-4 text-neon-purple" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {selectedRole === "freelancer" ? "Freelancer" : "Client"}
                  </span>
                  <button
                    onClick={handleBackToRole}
                    className="ml-2 text-xs text-foreground-muted hover:text-foreground transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    What's your name?
                  </h2>
                  <p className="text-foreground-muted">
                    This is how you'll appear on WorkSphere
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full h-12 px-4 text-base border-2 border-border focus:border-primary transition-colors duration-300"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleBackToRole}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNameSubmit}
                    disabled={!name.trim()}
                    className="flex-1 gap-2 bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90 transition-opacity"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Note with fade-in animation */}
        <div className={`text-center mt-8 transition-all duration-700 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <p className="text-sm text-foreground-muted">
            {currentStep === "role" 
              ? "You can always switch roles later in your dashboard settings"
              : "Your privacy is important to us. We'll never share your information without your consent."}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes grid-move {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        
        @keyframes wave-move {
          0% { background-position-x: 0; }
          100% { background-position-x: 1000px; }
        }
        
        @keyframes shape-float {
          0%, 100% { 
            transform: translateY(0) rotate(0deg); 
          }
          33% { 
            transform: translateY(-10px) rotate(3deg); 
          }
          66% { 
            transform: translateY(5px) rotate(-3deg); 
          }
        }
        
        @keyframes logo-pulse {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 0 0 rgba(0, 0, 0, 0);
          }
          50% { 
            transform: scale(1.05); 
            box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
          }
        }
        
        @keyframes logo-glow {
          0%, 100% { 
            opacity: 0.3;
          }
          50% { 
            opacity: 0.5;
          }
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 30px 30px;
        }
        
        .bg-grid-animation {
          background-image: 
            linear-gradient(rgba(34, 211, 238, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: grid-move 20s linear infinite;
        }
        
        .bg-wave-pattern {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z' fill='%23ffffff'%3E%3C/path%3E%3C/svg%3E");
          animation: wave-move 20s linear infinite;
        }
        
        .shape-float {
          animation: shape-float 12s ease-in-out infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-5000 {
          animation-delay: 5s;
        }
        
        .logo-pulse {
          animation: logo-pulse 4s ease-in-out infinite;
        }
        
        .logo-glow {
          animation: logo-glow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default OnboardingPage;