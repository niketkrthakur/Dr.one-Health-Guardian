import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRefillRequests } from "@/hooks/useRefillRequests";

interface RefillRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RefillRequestDialog = ({ open, onOpenChange }: RefillRequestDialogProps) => {
  const { createRequest } = useRefillRequests();
  
  const [medicationName, setMedicationName] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setMedicationName("");
    setNotes("");
  };

  const handleSubmit = async () => {
    if (!medicationName) return;

    setIsSubmitting(true);
    const { error } = await createRequest({
      medication_name: medicationName,
      request_notes: notes || undefined,
    });

    setIsSubmitting(false);
    if (!error) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Prescription Refill</DialogTitle>
          <DialogDescription>
            Submit a refill request to your healthcare provider
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medication">Medication Name *</Label>
            <Input
              id="medication"
              placeholder="e.g., Metformin 500mg"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information for your doctor..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">
              📋 Your doctor will review this request and respond within 24-48 hours. 
              You'll receive a notification when your request is processed.
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!medicationName || isSubmitting}
            className="w-full gradient-primary"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RefillRequestDialog;
