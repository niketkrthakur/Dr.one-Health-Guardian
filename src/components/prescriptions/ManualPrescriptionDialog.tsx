import { useState, useEffect } from "react";
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
import { Plus, X, Pill } from "lucide-react";
import { usePrescriptions, Prescription } from "@/hooks/usePrescriptions";
import { useAuth } from "@/contexts/AuthContext";
import { useDrugAllergyCheck } from "@/hooks/useDrugAllergyCheck";
import { useDrugInteractionCheck } from "@/hooks/useDrugInteractionCheck";
import DrugAllergyWarningDialog from "@/components/doctor/DrugAllergyWarningDialog";
import DrugInteractionWarningDialog from "@/components/doctor/DrugInteractionWarningDialog";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface ConflictResult {
  medication: string;
  allergy: string;
  severity: "high" | "medium";
}

interface InteractionResult {
  drug1: string;
  drug2: string;
  severity: "high" | "moderate" | "low";
  description: string;
}

interface ManualPrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
  patientAllergies?: string[];
  existingPrescriptions?: Prescription[];
}

const ManualPrescriptionDialog = ({
  open,
  onOpenChange,
  patientId,
  patientAllergies = [],
  existingPrescriptions = []
}: ManualPrescriptionDialogProps) => {
  const { user, userRole } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [medications, setMedications] = useState<Medication[]>([
    { name: "", dosage: "", frequency: "", duration: "" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Allergy conflict state
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [detectedConflicts, setDetectedConflicts] = useState<ConflictResult[]>([]);
  
  // Drug interaction state
  const [showInteractionWarning, setShowInteractionWarning] = useState(false);
  const [detectedInteractions, setDetectedInteractions] = useState<InteractionResult[]>([]);
  
  const { addPrescription } = usePrescriptions();
  const { checkMedications: checkAllergies, logConflict } = useDrugAllergyCheck();
  const { checkInteractions, logInteraction } = useDrugInteractionCheck();

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "", duration: "" }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setMedications([{ name: "", dosage: "", frequency: "", duration: "" }]);
    setDetectedConflicts([]);
    setDetectedInteractions([]);
  };

  // Get existing medications from prescriptions
  const getExistingMedications = (): Medication[] => {
    const meds: Medication[] = [];
    for (const prescription of existingPrescriptions) {
      const prescMeds = prescription.medications as Array<{ name?: string; dosage?: string; frequency?: string; duration?: string }> || [];
      for (const med of prescMeds) {
        if (med.name) {
          meds.push({
            name: med.name,
            dosage: med.dosage || "",
            frequency: med.frequency || "",
            duration: med.duration || ""
          });
        }
      }
    }
    return meds;
  };

  const handleSubmit = async () => {
    if (!title) return;

    const validMedications = medications.filter(m => m.name.trim());

    // Only check for doctors
    if (userRole === "doctor" && validMedications.length > 0) {
      // Check for drug-allergy conflicts
      if (patientAllergies.length > 0) {
        const conflicts = checkAllergies(validMedications, patientAllergies);
        if (conflicts.length > 0) {
          setDetectedConflicts(conflicts);
          setShowConflictWarning(true);
          return;
        }
      }

      // Check for drug-drug interactions
      const existingMeds = getExistingMedications();
      const interactions = checkInteractions(validMedications, existingMeds);
      if (interactions.length > 0) {
        setDetectedInteractions(interactions);
        setShowInteractionWarning(true);
        return;
      }
    }

    await savePrescription(validMedications);
  };

  const savePrescription = async (
    validMedications: Medication[], 
    acknowledgedConflicts = false,
    acknowledgedInteractions = false
  ) => {
    setIsLoading(true);

    // Log conflicts if acknowledged
    if (acknowledgedConflicts && detectedConflicts.length > 0 && patientId && user) {
      await logConflict(patientId, user.id, detectedConflicts, true);
    }

    // Log interactions if acknowledged
    if (acknowledgedInteractions && detectedInteractions.length > 0 && patientId && user) {
      await logInteraction(patientId, user.id, detectedInteractions, true);
    }

    await addPrescription({
      title,
      description,
      medications: validMedications,
      patient_id: patientId
    });

    setIsLoading(false);
    resetForm();
    onOpenChange(false);
  };

  const handleConflictAcknowledge = async () => {
    setShowConflictWarning(false);
    const validMedications = medications.filter(m => m.name.trim());
    
    // After acknowledging allergies, check for drug interactions
    if (userRole === "doctor") {
      const existingMeds = getExistingMedications();
      const interactions = checkInteractions(validMedications, existingMeds);
      if (interactions.length > 0) {
        setDetectedInteractions(interactions);
        setShowInteractionWarning(true);
        return;
      }
    }
    
    await savePrescription(validMedications, true);
  };

  const handleConflictCancel = () => {
    setShowConflictWarning(false);
    setDetectedConflicts([]);
  };

  const handleInteractionAcknowledge = async () => {
    setShowInteractionWarning(false);
    const validMedications = medications.filter(m => m.name.trim());
    await savePrescription(validMedications, detectedConflicts.length > 0, true);
  };

  const handleInteractionCancel = () => {
    setShowInteractionWarning(false);
    setDetectedInteractions([]);
  };

  const isDoctor = userRole === "doctor";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isDoctor ? "Add New Prescription" : "Add Medication Entry"}
            </DialogTitle>
            <DialogDescription>
              {isDoctor 
                ? "Create a verified prescription for this patient"
                : "Add a manual medication entry (will be marked as unverified)"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Prescription Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Diabetes Medication"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Notes</Label>
              <Textarea
                id="description"
                placeholder="Additional instructions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Medications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Medications</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMedication}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {medications.map((med, index) => (
                <div key={index} className="border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-primary" />
                      <span className="font-medium text-sm">Medication {index + 1}</span>
                    </div>
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="p-1 text-destructive hover:bg-destructive/10 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Input
                        placeholder="Medication name"
                        value={med.name}
                        onChange={(e) => updateMedication(index, "name", e.target.value)}
                      />
                    </div>
                    <Input
                      placeholder="Dosage (e.g., 500mg)"
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                    />
                    <Input
                      placeholder="Frequency (e.g., 2x daily)"
                      value={med.frequency}
                      onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                    />
                    <div className="col-span-2">
                      <Input
                        placeholder="Duration (e.g., 7 days)"
                        value={med.duration}
                        onChange={(e) => updateMedication(index, "duration", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Patient allergies notice for doctors */}
            {isDoctor && patientAllergies.length > 0 && (
              <div className="bg-destructive/5 border border-destructive/30 rounded-xl p-3">
                <p className="text-xs text-destructive font-medium mb-2">
                  ⚠️ Patient has known allergies:
                </p>
                <div className="flex flex-wrap gap-1">
                  {patientAllergies.map((allergy, index) => (
                    <span 
                      key={index}
                      className="px-2 py-0.5 bg-destructive/10 text-destructive rounded text-xs"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Existing medications notice for doctors */}
            {isDoctor && existingPrescriptions.length > 0 && (
              <div className="bg-warning/5 border border-warning/30 rounded-xl p-3">
                <p className="text-xs text-warning font-medium">
                  ⚠️ Patient has {existingPrescriptions.length} existing prescription(s). 
                  Drug interactions will be checked automatically.
                </p>
              </div>
            )}

            {/* Verification notice */}
            {isDoctor ? (
              <div className="bg-success/10 border border-success/30 rounded-xl p-3">
                <p className="text-xs text-success">
                  ✓ This prescription will be automatically verified as it's added by a doctor.
                </p>
              </div>
            ) : (
              <div className="bg-warning/10 border border-warning/30 rounded-xl p-3">
                <p className="text-xs text-warning">
                  ⚠️ User-added entries will be marked as "Not Verified".
                </p>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!title || isLoading}
              className="w-full gradient-primary"
            >
              {isLoading ? "Saving..." : "Save Prescription"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DrugAllergyWarningDialog
        open={showConflictWarning}
        onOpenChange={setShowConflictWarning}
        conflicts={detectedConflicts}
        onAcknowledge={handleConflictAcknowledge}
        onCancel={handleConflictCancel}
      />

      <DrugInteractionWarningDialog
        open={showInteractionWarning}
        onOpenChange={setShowInteractionWarning}
        interactions={detectedInteractions}
        onAcknowledge={handleInteractionAcknowledge}
        onCancel={handleInteractionCancel}
      />
    </>
  );
};

export default ManualPrescriptionDialog;
