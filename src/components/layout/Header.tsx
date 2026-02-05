import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
}

const Header = ({ title, showLogo = true }: HeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border/50 z-40">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          {showLogo && (
            <img src={logo} alt="Dr.One" className="h-10 w-10 object-contain" />
          )}
          <div>
            <h1 className="text-lg font-semibold gradient-text">
              {title || "Dr.One"}
            </h1>
            {!title && (
              <p className="text-xs text-muted-foreground">AI-Powered Health Records & Safety</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationDropdown />
          <button 
            onClick={() => navigate("/profile")}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
