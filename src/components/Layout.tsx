import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Gamepad2, Trophy, BarChart3, Eye, GraduationCap } from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: Brain },
  { path: "/explorer", label: "Explorer", icon: Eye },
  { path: "/training", label: "Training", icon: GraduationCap },
  { path: "/games", label: "Games", icon: Gamepad2 },
  { path: "/benchmark", label: "Benchmark", icon: Trophy },
  { path: "/stats", label: "Stats", icon: BarChart3 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background bg-grid relative">
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="font-mono font-bold text-primary-foreground text-sm">π</span>
            </div>
            <span className="font-semibold text-lg">PiMaster</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className="relative px-3 py-2 rounded-lg transition-colors">
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-primary/10 rounded-lg glow-primary"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={`relative flex items-center gap-2 text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Mobile nav */}
          <div className="flex md:hidden items-center gap-2">
            {navItems.slice(0, 4).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className="relative p-2 rounded-lg">
                  {isActive && (
                    <motion.div layoutId="nav-mobile" className="absolute inset-0 bg-primary/10 rounded-lg" />
                  )}
                  <item.icon className={`w-5 h-5 relative ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="pt-16 relative z-10">{children}</main>
    </div>
  );
}
