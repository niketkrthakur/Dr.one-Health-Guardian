import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickAccessCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  variant?: "default" | "primary" | "warning" | "emergency";
}

const QuickAccessCard = ({
  icon: Icon,
  title,
  description,
  path,
  variant = "default",
}: QuickAccessCardProps) => {
  const navigate = useNavigate();

  const variantStyles = {
    default: "bg-card hover:bg-muted/50",
    primary: "gradient-primary text-white",
    warning: "bg-warning/10 border-warning/30 hover:bg-warning/20",
    emergency: "bg-destructive/10 border-destructive/30 hover:bg-destructive/20",
  };

  const iconStyles = {
    default: "bg-primary/10 text-primary",
    primary: "bg-white/20 text-white",
    warning: "bg-warning/20 text-warning",
    emergency: "bg-destructive/20 text-destructive",
  };

  return (
    <button
      onClick={() => navigate(path)}
      className={cn(
        "healthcare-card w-full text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("p-3 rounded-xl", iconStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold text-base",
            variant === "primary" ? "text-white" : "text-foreground"
          )}>
            {title}
          </h3>
          <p className={cn(
            "text-sm mt-0.5",
            variant === "primary" ? "text-white/80" : "text-muted-foreground"
          )}>
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};

export default QuickAccessCard;
