import { AlertTriangle, AlertCircle, CheckCircle, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertBannerProps {
  type: "critical" | "warning" | "success";
  title: string;
  message: string;
}

const alertConfig: Record<string, { icon: LucideIcon; styles: string }> = {
  critical: {
    icon: AlertCircle,
    styles: "alert-critical border",
  },
  warning: {
    icon: AlertTriangle,
    styles: "alert-warning border",
  },
  success: {
    icon: CheckCircle,
    styles: "alert-success border",
  },
};

const AlertBanner = ({ type, title, message }: AlertBannerProps) => {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn("rounded-xl p-4 animate-slide-up", config.styles)}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-sm mt-0.5 opacity-90">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;
