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
import { AlertTriangle, ShieldAlert } from "lucide-react";

interface ConflictResult {
  medication: string;
  allergy: string;
  severity: "high" | "medium";
}

interface DrugAllergyWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: ConflictResult[];
  onAcknowledge: () => void;
  onCancel: () => void;
}

const DrugAllergyWarningDialog = ({
  open,
  onOpenChange,
  conflicts,
  onAcknowledge,
  onCancel
}: DrugAllergyWarningDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-destructive/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-6 w-6" />
            Drug-Allergy Conflict Detected
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-foreground font-medium">
                The following medication conflicts with patient allergies:
              </p>
              
              <div className="space-y-2">
                {conflicts.map((conflict, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/30 rounded-xl"
                  >
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-destructive">
                        {conflict.medication}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Conflicts with allergy: <strong>{conflict.allergy}</strong>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-warning/10 border border-warning/30 rounded-xl p-3">
                <p className="text-sm text-warning font-medium">
                  ⚠️ Proceeding requires medical judgment. This action will be logged for audit purposes.
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                As a qualified healthcare professional, you may proceed if you determine 
                the benefits outweigh the risks. This decision and the conflict will be 
                recorded in the patient's medical history.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancel Prescription
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onAcknowledge}
            className="bg-warning hover:bg-warning/90 text-warning-foreground"
          >
            Acknowledge & Proceed
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DrugAllergyWarningDialog;
