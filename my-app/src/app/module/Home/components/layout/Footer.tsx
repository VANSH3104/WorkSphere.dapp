import Link from "next/link";
import { Globe, Zap, Twitter, Github, MessageCircle, Send } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    Trading: [
      { name: "Markets", href: "/markets" },
      { name: "Trading Fees", href: "/fees" },
      { name: "API Documentation", href: "/api" },
      { name: "Trading Guide", href: "/guide" }
    ],
    Resources: [
      { name: "Training Guide", href: "/training" },
      { name: "Market Analysis", href: "/analysis" },
      { name: "Security", href: "/security" },
      { name: "Support", href: "/support" }
    ],
    Legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Risk Disclosure", href: "/risk" },
      { name: "Compliance", href: "/compliance" }
    ],
    Company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
      { name: "Blog", href: "/blog" }
    ]
  };

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
    { name: "Discord", icon: MessageCircle, href: "https://discord.com" },
    { name: "Github", icon: Github, href: "https://github.com" },
    { name: "Telegram", icon: Send, href: "https://telegram.org" }
  ];

  return (
    <>
    <footer className="relative border-t border-glass-border">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-3 mb-6 hover-glow">
                <div className="relative">
                  <Globe className="h-8 w-8 text-neon-cyan animate-spin-slow" />
                  <Zap className="absolute inset-0 h-4 w-4 m-2 text-neon-gold animate-pulse" />
                </div>
                <span className="text-xl font-bold text-neon bg-gradient-primary bg-clip-text text-transparent">
                  WorkSphere
                </span>
              </Link>

              <p className="text-foreground-muted mb-6 max-w-md leading-relaxed">
                Empowering traders with advanced crypto trading solutions.
                Experience the future of decentralized finance with institutional-grade security.
              </p>

              {/* Social Links */}
              <div className="flex gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center rounded-full border border-glass-border bg-background/40 backdrop-blur-sm hover:bg-primary/20 transition-colors"
                      aria-label={social.name}
                    >
                      <Icon className="h-5 w-5 text-white hover:text-primary transition-colors" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Link Sections */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-foreground font-semibold mb-4">{category}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-foreground-muted hover:text-primary transition-colors duration-300"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-glass-border py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-foreground-muted text-sm">
              © 2024 WorkSphere A/S. All rights reserved.
            </p>

            <div className="flex items-center gap-6 text-sm text-foreground-muted">
              <span>Built on Solana</span>
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span>Secure & Decentralized</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};

export default Footer;
