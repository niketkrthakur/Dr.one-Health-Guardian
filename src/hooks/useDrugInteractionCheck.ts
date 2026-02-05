import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
}

interface InteractionResult {
  drug1: string;
  drug2: string;
  severity: "high" | "moderate" | "low";
  description: string;
}

// Common drug-drug interaction database (expandable)
const DRUG_INTERACTIONS: {
  drugs: string[];
  severity: "high" | "moderate" | "low";
  description: string;
}[] = [
  // Blood Thinners
  {
    drugs: ["warfarin", "aspirin"],
    severity: "high",
    description: "Increased bleeding risk. Monitor INR closely.",
  },
  {
    drugs: ["warfarin", "ibuprofen"],
    severity: "high",
    description: "NSAIDs increase bleeding risk with anticoagulants.",
  },
  {
    drugs: ["warfarin", "vitamin k"],
    severity: "high",
    description: "Vitamin K reduces warfarin effectiveness.",
  },
  {
    drugs: ["clopidogrel", "omeprazole"],
    severity: "moderate",
    description: "PPIs may reduce clopidogrel effectiveness.",
  },
  
  // Blood Pressure
  {
    drugs: ["lisinopril", "potassium"],
    severity: "high",
    description: "Risk of hyperkalemia. Monitor potassium levels.",
  },
  {
    drugs: ["lisinopril", "spironolactone"],
    severity: "high",
    description: "Dual potassium-sparing effect. Monitor potassium.",
  },
  {
    drugs: ["metoprolol", "verapamil"],
    severity: "high",
    description: "Risk of severe bradycardia and heart block.",
  },
  {
    drugs: ["amlodipine", "simvastatin"],
    severity: "moderate",
    description: "Increased simvastatin levels. Limit dose to 20mg.",
  },
  
  // Antibiotics
  {
    drugs: ["metronidazole", "alcohol"],
    severity: "high",
    description: "Severe nausea, vomiting, flushing. Avoid alcohol.",
  },
  {
    drugs: ["ciprofloxacin", "tizanidine"],
    severity: "high",
    description: "Greatly increased tizanidine levels. Contraindicated.",
  },
  {
    drugs: ["azithromycin", "amiodarone"],
    severity: "high",
    description: "Risk of QT prolongation. ECG monitoring required.",
  },
  {
    drugs: ["erythromycin", "simvastatin"],
    severity: "high",
    description: "Risk of myopathy/rhabdomyolysis. Avoid combination.",
  },
  
  // Diabetes
  {
    drugs: ["metformin", "contrast dye"],
    severity: "high",
    description: "Risk of lactic acidosis. Hold metformin 48hrs post-contrast.",
  },
  {
    drugs: ["insulin", "beta blockers"],
    severity: "moderate",
    description: "May mask hypoglycemia symptoms. Monitor closely.",
  },
  {
    drugs: ["glipizide", "fluconazole"],
    severity: "moderate",
    description: "Increased hypoglycemia risk. Monitor blood glucose.",
  },
  
  // Mental Health
  {
    drugs: ["sertraline", "tramadol"],
    severity: "high",
    description: "Risk of serotonin syndrome. Monitor for symptoms.",
  },
  {
    drugs: ["fluoxetine", "maois"],
    severity: "high",
    description: "Contraindicated. Wait 5 weeks before switching.",
  },
  {
    drugs: ["lithium", "ibuprofen"],
    severity: "high",
    description: "NSAIDs increase lithium levels. Monitor closely.",
  },
  {
    drugs: ["alprazolam", "opioids"],
    severity: "high",
    description: "Risk of respiratory depression. Avoid combination.",
  },
  
  // Pain / Opioids
  {
    drugs: ["tramadol", "ssris"],
    severity: "high",
    description: "Risk of serotonin syndrome and seizures.",
  },
  {
    drugs: ["morphine", "benzodiazepines"],
    severity: "high",
    description: "Risk of profound sedation, respiratory depression.",
  },
  
  // Statins
  {
    drugs: ["simvastatin", "grapefruit"],
    severity: "moderate",
    description: "Grapefruit increases statin levels. Avoid large quantities.",
  },
  {
    drugs: ["atorvastatin", "clarithromycin"],
    severity: "moderate",
    description: "Increased statin exposure. Consider dose reduction.",
  },
  
  // Other Common
  {
    drugs: ["digoxin", "amiodarone"],
    severity: "high",
    description: "Amiodarone increases digoxin levels. Reduce digoxin dose.",
  },
  {
    drugs: ["theophylline", "ciprofloxacin"],
    severity: "high",
    description: "Ciprofloxacin increases theophylline levels significantly.",
  },
];

export const useDrugInteractionCheck = () => {
  // Normalize drug name for comparison
  const normalizeDrugName = useCallback((name: string): string => {
    return name.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  }, []);

  // Check if two drug names match (including partial matches)
  const drugsMatch = useCallback((drug1: string, drug2: string): boolean => {
    const norm1 = normalizeDrugName(drug1);
    const norm2 = normalizeDrugName(drug2);
    return norm1.includes(norm2) || norm2.includes(norm1);
  }, [normalizeDrugName]);

  // Check medications for interactions
  const checkInteractions = useCallback((
    newMedications: Medication[],
    existingMedications: Medication[] = []
  ): InteractionResult[] => {
    const interactions: InteractionResult[] = [];
    const allMeds = [...newMedications, ...existingMedications];

    // Check each pair of medications
    for (let i = 0; i < allMeds.length; i++) {
      for (let j = i + 1; j < allMeds.length; j++) {
        const med1 = allMeds[i];
        const med2 = allMeds[j];

        if (!med1.name.trim() || !med2.name.trim()) continue;

        // Check against interaction database
        for (const interaction of DRUG_INTERACTIONS) {
          const [drug1, drug2] = interaction.drugs;
          
          const med1MatchesDrug1 = drugsMatch(med1.name, drug1);
          const med1MatchesDrug2 = drugsMatch(med1.name, drug2);
          const med2MatchesDrug1 = drugsMatch(med2.name, drug1);
          const med2MatchesDrug2 = drugsMatch(med2.name, drug2);

          if ((med1MatchesDrug1 && med2MatchesDrug2) || 
              (med1MatchesDrug2 && med2MatchesDrug1)) {
            interactions.push({
              drug1: med1.name,
              drug2: med2.name,
              severity: interaction.severity,
              description: interaction.description,
            });
          }
        }
      }
    }

    // Remove duplicates
    const unique = interactions.filter((v, i, a) => 
      a.findIndex(t => 
        (t.drug1 === v.drug1 && t.drug2 === v.drug2) ||
        (t.drug1 === v.drug2 && t.drug2 === v.drug1)
      ) === i
    );

    return unique;
  }, [drugsMatch]);

  // Log interaction for audit
  const logInteraction = useCallback(async (
    patientId: string,
    doctorId: string,
    interactions: InteractionResult[],
    acknowledged: boolean
  ) => {
    try {
      await supabase.from("medical_history").insert({
        patient_id: patientId,
        record_type: "drug_interaction_warning",
        title: "Drug-Drug Interaction Warning",
        description: JSON.stringify({
          interactions,
          acknowledged,
          timestamp: new Date().toISOString(),
          acknowledged_by: doctorId
        }),
        recorded_by: doctorId
      });
    } catch (error) {
      console.error("Failed to log interaction:", error);
    }
  }, []);

  return {
    checkInteractions,
    logInteraction,
    normalizeDrugName,
  };
};
