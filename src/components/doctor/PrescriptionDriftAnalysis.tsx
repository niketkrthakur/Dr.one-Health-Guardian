import { useState, useEffect } from "react";
import { AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { MedicalRecord } from "@/hooks/useMedicalHistory";
import { WearableReading } from "@/hooks/useWearableData";
import SafetyDisclaimer from "@/components/shared/SafetyDisclaimer";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

interface DriftAdvisory {
  id: string;
  type: "history_mismatch" | "wearable_context" | "timing_gap";
  message: string;
  detail: string;
  severity: "info" | "caution";
}

interface PrescriptionDriftAnalysisProps {
  medications: Medication[];
  medicalHistory: MedicalRecord[];
  wearableReadings?: WearableReading[];
  allergies?: string[];
  chronicConditions?: string[];
}

const PrescriptionDriftAnalysis = ({
  medications,
  medicalHistory,
  wearableReadings = [],
  allergies = [],
  chronicConditions = [],
}: PrescriptionDriftAnalysisProps) => {
  const [advisories, setAdvisories] = useState<DriftAdvisory[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const newAdvisories = analyzeDrift();
    setAdvisories(newAdvisories);
  }, [medications, medicalHistory, wearableReadings]);

  const analyzeDrift = (): DriftAdvisory[] => {
    const results: DriftAdvisory[] = [];

    if (medications.length === 0) return results;

    // Check 1: Recent medical history events that may affect prescription context
    const recentRecords = medicalHistory.filter((r) => {
      const recordDate = new Date(r.date_recorded);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return recordDate >= thirtyDaysAgo;
    });

    if (recentRecords.length > 0) {
      // Check for new conditions added recently
      const recentConditionRecords = recentRecords.filter(
        (r) =>
          r.record_type === "diagnosis" ||
          r.record_type === "condition" ||
          r.record_type === "lab_test"
      );

      if (recentConditionRecords.length > 0) {
        results.push({
          id: "recent_conditions",
          type: "history_mismatch",
          message:
            "Prescription context may require clinician review based on recent patient information.",
          detail: `${recentConditionRecords.length} new medical record(s) added in the last 30 days: ${recentConditionRecords.map((r) => r.title).join(", ")}`,
          severity: "caution",
        });
      }
    }

    // Check 2: Wearable data context (if available)
    const elevatedReadings = wearableReadings.filter(
      (r) => r.status === "elevated" || r.status === "low"
    );
    if (elevatedReadings.length > 0) {
      results.push({
        id: "wearable_context",
        type: "wearable_context",
        message:
          "Recent wearable-derived indicators may be relevant to prescription context.",
        detail: `Abnormal readings detected: ${elevatedReadings.map((r) => `${r.label}: ${r.value} ${r.unit} (${r.status})`).join(", ")}`,
        severity: "caution",
      });
    }

    // Check 3: Medication gap analysis (long-standing prescriptions with no recent review)
    const oldRecords = medicalHistory.filter((r) => {
      const recordDate = new Date(r.date_recorded);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return recordDate < sixMonthsAgo && r.record_type === "prescription";
    });

    if (oldRecords.length > 0 && medications.length > 3) {
      results.push({
        id: "timing_gap",
        type: "timing_gap",
        message:
          "Extended medication history detected. Periodic clinician review may be beneficial.",
        detail: `Patient has ${medications.length} active medications with prescription records older than 6 months.`,
        severity: "info",
      });
    }

    // Check 4: Chronic condition + medication alignment
    if (chronicConditions.length > 0 && medications.length > 0) {
      const diabetesMeds = ["metformin", "insulin", "glipizide", "glimepiride", "sitagliptin"];
      const hasDiabetes = chronicConditions.some((c) =>
        c.toLowerCase().includes("diabetes")
      );
      const hasDiabetesMed = medications.some((m) =>
        diabetesMeds.some((dm) =>
          m.name.toLowerCase().includes(dm)
        )
      );

      if (hasDiabetes && !hasDiabetesMed) {
        results.push({
          id: "condition_med_gap",
          type: "history_mismatch",
          message:
            "Chronic condition noted without corresponding active medication. Clinician review recommended.",
          detail: `Patient has diabetes listed in conditions but no diabetes-related medication appears in the current prescription.`,
          severity: "caution",
        });
      }
    }

    return results;
  };

  if (advisories.length === 0) return null;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full healthcare-card border border-warning/30 bg-warning/5 p-3 cursor-pointer hover:bg-warning/10 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="font-semibold text-sm">
              Prescription Context Advisory ({advisories.length})
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="space-y-2 animate-fade-in">
          {advisories.map((advisory) => (
            <div
              key={advisory.id}
              className={`p-3 rounded-xl border ${
                advisory.severity === "caution"
                  ? "border-warning/30 bg-warning/5"
                  : "border-primary/20 bg-primary/5"
              }`}
            >
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{advisory.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {advisory.detail}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <SafetyDisclaimer variant="advisory" />
        </div>
      )}
    </div>
  );
};

export default PrescriptionDriftAnalysis;
