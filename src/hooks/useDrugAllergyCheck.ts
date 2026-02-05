import { useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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

// Common drug-allergy mappings (expandable)
const DRUG_ALLERGY_MAP: Record<string, string[]> = {
  // Penicillin class
  penicillin: ["amoxicillin", "ampicillin", "penicillin", "augmentin", "piperacillin"],
  amoxicillin: ["amoxicillin", "augmentin", "amoxyclav"],
  
  // Sulfa drugs
  sulfa: ["sulfamethoxazole", "bactrim", "septra", "sulfasalazine"],
  sulfamethoxazole: ["bactrim", "septra", "sulfamethoxazole"],
  
  // NSAIDs
  aspirin: ["aspirin", "acetylsalicylic acid", "disprin", "ecosprin"],
  ibuprofen: ["ibuprofen", "advil", "motrin", "brufen"],
  nsaid: ["ibuprofen", "aspirin", "naproxen", "diclofenac", "indomethacin", "piroxicam"],
  
  // Opioids
  codeine: ["codeine", "co-codamol"],
  morphine: ["morphine", "oxycodone", "hydrocodone"],
  
  // Antibiotics
  cephalosporin: ["cefixime", "ceftriaxone", "cephalexin", "cefuroxime"],
  fluoroquinolone: ["ciprofloxacin", "levofloxacin", "moxifloxacin", "ofloxacin"],
  macrolide: ["azithromycin", "erythromycin", "clarithromycin"],
  
  // Others
  latex: ["latex"],
  contrast: ["contrast", "iodine", "gadolinium"],
};

export const useDrugAllergyCheck = () => {
  // Normalize text for comparison
  const normalizeText = useCallback((text: string): string => {
    return text.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  }, []);

  // Check if a medication conflicts with an allergy
  const checkConflict = useCallback((medication: string, allergy: string): boolean => {
    const normMed = normalizeText(medication);
    const normAllergy = normalizeText(allergy);

    // Direct match
    if (normMed.includes(normAllergy) || normAllergy.includes(normMed)) {
      return true;
    }

    // Check drug class mappings
    for (const [allergyKey, drugs] of Object.entries(DRUG_ALLERGY_MAP)) {
      const normKey = normalizeText(allergyKey);
      if (normAllergy.includes(normKey) || normKey.includes(normAllergy)) {
        for (const drug of drugs) {
          if (normMed.includes(normalizeText(drug))) {
            return true;
          }
        }
      }
    }

    return false;
  }, [normalizeText]);

  // Check medications against allergies
  const checkMedications = useCallback((
    medications: Medication[],
    allergies: string[]
  ): ConflictResult[] => {
    const conflicts: ConflictResult[] = [];

    for (const med of medications) {
      if (!med.name.trim()) continue;

      for (const allergy of allergies) {
        if (!allergy.trim()) continue;

        if (checkConflict(med.name, allergy)) {
          conflicts.push({
            medication: med.name,
            allergy: allergy,
            severity: "high"
          });
        }
      }
    }

    return conflicts;
  }, [checkConflict]);

  // Log conflict for audit
  const logConflict = useCallback(async (
    patientId: string,
    doctorId: string,
    conflicts: ConflictResult[],
    acknowledged: boolean
  ) => {
    try {
      // Log to medical_history as an audit record
      await supabase.from("medical_history").insert({
        patient_id: patientId,
        record_type: "drug_allergy_conflict",
        title: "Drug-Allergy Conflict Detected",
        description: JSON.stringify({
          conflicts,
          acknowledged,
          timestamp: new Date().toISOString(),
          acknowledged_by: doctorId
        }),
        recorded_by: doctorId
      });
    } catch (error) {
      console.error("Failed to log conflict:", error);
    }
  }, []);

  return {
    checkMedications,
    checkConflict,
    logConflict,
    normalizeText
  };
};
