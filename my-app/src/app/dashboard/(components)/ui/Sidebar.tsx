import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Upload, 
  Scale, 
  Users, 
  Palette,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Wallet,
  Sun,
  Moon,
  Bell
} from "lucide-react";
import { Button } from "@/app/(module)/ui/button";
import { Badge } from "@/app/(module)/ui/badge";
import { Switch } from "@/app/(module)/ui/switch";
import { useNavigate } from "react-router-dom";
import { useRouter } from "next/navigation";


interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: "freelancer" | "client" | string;
  userName: string;
  walletAddress: string | undefined;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar = ({
  activeTab,
  onTabChange,
  userRole,
  userName,
  walletAddress,
  isCollapsed,
  onToggleCollapse
}: SidebarProps) => {
  const navigate = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const sidebarItems = [
    { 
      id: "dashboard", 
      label: "Dashboard", 
      icon: LayoutDashboard,
      badge: null,
      route: `/dashboard`
    },
    { 
      id: "jobs", 
      label: userRole === "client" ? "Manage Jobs" : "Browse Jobs", 
      icon: Briefcase,
      badge: userRole === "client" ? "5" : "12",
      route: userRole === "client" ? `/manage-jobs?role=${userRole}` : `/jobs`
    },
    { 
      id: "proposals", 
      label: "Proposals", 
      icon: FileText,   
      badge: "3",
      route: `/proposals`
    },
    { 
      id: "submissions", 
      label: "Work Submissions", 
      icon: Upload,
      badge: null,
      route: `/submissions`
    },
    { 
      id: "disputes", 
      label: "Disputes", 
      icon: Scale,
      badge: "2",
      route: `/disputes`
    },
    { 
      id: "dao", 
      label: "DAO Governance", 
      icon: Users,
      badge: "1",
      route: `/dao`
    },
    { 
      id: "nfts", 
      label: "NFT Gallery", 
      icon: Palette,
      badge: null,
      route: `/nfts`
    }
  ];

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <motion.div 
      className={`fixed left-0 top-0 h-full glass-panel border-r border-glass-border z-50 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      initial={{ x: isCollapsed ? -200 : 0 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-glass-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-primary-foreground font-bold text-sm">WS</span>
              </motion.div>
              <span className="text-lg font-bold text-foreground">WorkSphere</span>
            </motion.div>
          )}
          
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="hover:bg-glass-secondary"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <motion.div 
          className="p-4 border-b border-glass-border"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div 
            className="flex items-center space-x-3 p-3 glass-panel rounded-lg hover-lift cursor-pointer"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div 
              className="w-12 h-12 rounded-full bg-gradient-secondary flex items-center justify-center relative"
              whileHover={{ rotate: 5 }}
            >
              <span className="text-white font-bold">{userName.slice(0, 2).toUpperCase()}</span>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{userName}</h3>
              <p className="text-sm text-foreground-muted capitalize">{userRole}</p>
              <Badge variant="outline" className="text-xs mt-1">
                4.9★ Rating
              </Badge>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="p-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {sidebarItems.map((item, index) => (
            <motion.li 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <motion.button
                onClick={() => {
                  onTabChange(item.id);
                  if (item.route) navigate.push(item.route);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 group ${
                  activeTab === item.id
                    ? 'bg-gradient-primary text-white shadow-neon'
                    : 'text-foreground-muted hover:text-foreground hover:bg-glass-secondary'
                }`}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : ''}`} />
                  </motion.div>
                  {!isCollapsed && (
                    <span className="font-medium group-hover:translate-x-1 transition-transform duration-300">
                      {item.label}
                    </span>
                  )}
                </div>
                
                {!isCollapsed && item.badge && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <Badge 
                      className={`${
                        activeTab === item.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-neon-gold/20 text-neon-gold'
                      } text-xs`}
                    >
                      {item.badge}
                    </Badge>
                  </motion.div>
                )}
              </motion.button>
            </motion.li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-glass-border space-y-4">
        {/* Wallet Info */}
        {!isCollapsed && (
          <motion.div 
            className="glass-panel p-3 rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <Wallet className="w-4 h-4 text-neon-gold" />
              <span className="text-xs text-foreground-muted">Wallet</span>
            </div>
            <div className="font-mono text-xs text-foreground">
              {truncateAddress(walletAddress)}
            </div>
            <div className="text-neon-gold font-semibold text-sm">
              3.4K SOL
            </div>
          </motion.div>
        )}

        {/* Theme Toggle */}
        {!isCollapsed && (
          <motion.div 
            className="flex items-center justify-between p-3 glass-panel rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center space-x-2">
              {isDarkMode ? (
                <Moon className="w-4 h-4 text-neon-purple" />
              ) : (
                <Sun className="w-4 h-4 text-neon-gold" />
              )}
              <span className="text-sm text-foreground-muted">Dark Mode</span>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
              className="data-[state=checked]:bg-gradient-primary"
            />
          </motion.div>
        )}

        {/* Settings Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="glass" 
            className={`w-full gap-2 hover:bg-gradient-secondary hover:text-white ${
              isCollapsed ? 'p-2' : 'px-4 py-2'
            }`}
          >
            <Settings className="h-4 w-4" />
            {!isCollapsed && "Settings"}
          </Button>
        </motion.div>

        {/* Notifications */}
        {isCollapsed && (
          <motion.div 
            className="flex justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-neon-gold rounded-full text-xs flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                3
              </motion.div>
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};