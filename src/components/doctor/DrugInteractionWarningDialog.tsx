import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, PillBottle } from "lucide-react";

interface InteractionResult {
  drug1: string;
  drug2: string;
  severity: "high" | "moderate" | "low";
  description: string;
}

interface DrugInteractionWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interactions: InteractionResult[];
  onAcknowledge: () => void;
  onCancel: () => void;
}

const DrugInteractionWarningDialog = ({
  open,
  onOpenChange,
  interactions,
  onAcknowledge,
  onCancel,
}: DrugInteractionWarningDialogProps) => {
  const highSeverityCount = interactions.filter(i => i.severity === "high").length;
  const moderateCount = interactions.filter(i => i.severity === "moderate").length;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-warning">
            <PillBottle className="h-5 w-5" />
            Drug-Drug Interaction Warning
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 text-left">
              <p className="text-sm text-muted-foreground">
                Potential interactions detected between the following medications:
              </p>

              <div className="space-y-3">
                {interactions.map((interaction, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl border ${
                      interaction.severity === "high"
                        ? "bg-destructive/5 border-destructive/30"
                        : interaction.severity === "moderate"
                        ? "bg-warning/5 border-warning/30"
                        : "bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 text-xs rounded font-medium ${
                          interaction.severity === "high"
                            ? "bg-destructive/10 text-destructive"
                            : interaction.severity === "moderate"
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {interaction.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-medium text-sm">
                      {interaction.drug1} + {interaction.drug2}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {interaction.description}
                    </p>
                  </div>
                ))}
              </div>

              {highSeverityCount > 0 && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-xs text-destructive">
                    <strong>{highSeverityCount} high-severity interaction(s) detected.</strong>{" "}
                    Consider alternative medications or close monitoring if proceeding.
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                By acknowledging, you confirm you have reviewed these interactions and 
                determined the prescription is clinically appropriate.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Review Prescription
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onAcknowledge}
            className="bg-warning text-warning-foreground hover:bg-warning/90"
          >
            Acknowledge & Proceed
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DrugInteractionWarningDialog;
