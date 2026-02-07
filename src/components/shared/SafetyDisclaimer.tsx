import { Shield, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type DisclaimerVariant = "emergency" | "advisory" | "navigation" | "wearable" | "ai";

interface SafetyDisclaimerProps {
  variant: DisclaimerVariant;
  className?: string;
}

const disclaimerConfig: Record<DisclaimerVariant, {
  icon: typeof Shield;
  title: string;
  message: string;
  style: string;
}> = {
  emergency: {
    icon: AlertTriangle,
    title: "Emergency Information – For Clinical Reference Only",
    message: "This data is patient-reported and advisory only. Dr.One does not perform diagnosis, triage, or treatment recommendations. All clinical decisions must be made by qualified medical personnel.",
    style: "border-destructive/30 bg-destructive/5",
  },
  advisory: {
    icon: Shield,
    title: "Advisory Only",
    message: "AI-generated insights are assistive only. No autonomous medical decisions are performed. Final decisions always remain with the treating clinician.",
    style: "border-primary/20 bg-primary/5",
  },
  navigation: {
    icon: Info,
    title: "Healthcare Navigation Disclaimer",
    message: "This functionality supports healthcare access and does not provide medical diagnosis or advice. Doctor listings are for navigation purposes only.",
    style: "border-muted bg-muted/50",
  },
  wearable: {
    icon: Shield,
    title: "Wearable-Derived Data Disclaimer",
    message: "Wearable data is provided for contextual reference only and does not constitute medical diagnosis or treatment advice. It must not be used for disease prediction or autonomous alerts. All insights are advisory and human-verifiable.",
    style: "border-warning/30 bg-warning/5",
  },
  ai: {
    icon: Shield,
    title: "AI Disclaimer",
    message: "AI outputs are advisory only. No autonomous medical decisions are performed. Human clinicians retain full decision authority. Patient data access follows consent and role-based controls.",
    style: "border-primary/20 bg-primary/5",
  },
};

const SafetyDisclaimer = ({ variant, className }: SafetyDisclaimerProps) => {
  const config = disclaimerConfig[variant];
  const Icon = config.icon;

  return (
    <div className={cn(
      "rounded-xl p-4 border",
      config.style,
      className
    )}>
      <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
        <div>
          <h4 className="font-semibold text-xs text-foreground">{config.title}</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {config.message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SafetyDisclaimer;
