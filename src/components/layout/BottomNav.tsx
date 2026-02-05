import { Home, User, FileText, Brain, Clock } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: FileText, label: "Records", path: "/records" },
  { icon: Clock, label: "Reminders", path: "/reminders" },
  { icon: Brain, label: "AI", path: "/ai-summary" },
  { icon: User, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 px-2 pb-safe z-50">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "nav-item flex-1",
                isActive ? "nav-item-active" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className={cn("text-xs font-medium", isActive && "text-primary")}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
