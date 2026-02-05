import { 
  Brain, 
  Droplet, 
  AlertTriangle, 
  Heart, 
  Pill,
  Shield,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Profile } from "@/hooks/useProfile";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

interface Prescription {
  id: string;
  title: string;
  medications: Medication[] | null;
  is_verified: boolean;
  created_at: string;
}

interface PatientAISummaryProps {
  patient: Profile;
  prescriptions: Prescription[];
}

const PatientAISummary = ({ patient, prescriptions }: PatientAISummaryProps) => {
  // Extract current medications from prescriptions
  const currentMedications: Medication[] = [];
  
  prescriptions.forEach((rx) => {
    if (rx.medications && Array.isArray(rx.medications)) {
      rx.medications.forEach((med) => {
        if (typeof med === "object" && med !== null && "name" in med) {
          currentMedications.push(med as Medication);
        }
      });
    }
  });

  const lastUpdated = prescriptions.length > 0 
    ? new Date(prescriptions[0].created_at).toLocaleString()
    : new Date().toLocaleString();

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="healthcare-card gradient-primary text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-xl">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg">AI Medical Summary</h2>
            <p className="text-white/80 text-sm">5-10 second review for medical staff</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Clock className="h-4 w-4" />
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      {/* Patient Overview */}
      <div className="healthcare-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">{patient.name || "Unknown Patient"}</h3>
            <p className="text-muted-foreground">
              {patient.age ? `${patient.age} years` : "Age N/A"} • {patient.gender || "Gender N/A"}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-xl">
            <Droplet className="h-5 w-5 text-destructive" />
            <span className="font-bold text-xl text-destructive">
              {patient.blood_group || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Critical Allergies - MOST PROMINENT */}
      <div className={cn(
        "healthcare-card border-2 border-destructive/50",
        "bg-gradient-to-br from-destructive/5 to-destructive/10"
      )}>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="font-bold text-destructive">⚠️ CRITICAL ALLERGIES</h3>
        </div>
        
        {patient.allergies && patient.allergies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {patient.allergies.map((allergy, index) => (
              <span 
                key={index}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-full font-semibold text-sm"
              >
                {allergy}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No known allergies recorded</p>
        )}
      </div>

      {/* Chronic Conditions */}
      <div className="healthcare-card border border-warning/50 bg-warning/5">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-warning" />
          <h3 className="font-bold text-warning">Chronic Conditions</h3>
        </div>
        
        {patient.chronic_conditions && patient.chronic_conditions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {patient.chronic_conditions.map((condition, index) => (
              <span 
                key={index}
                className="px-4 py-2 bg-warning/20 text-warning rounded-full font-medium text-sm"
              >
                {condition}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No chronic conditions recorded</p>
        )}
      </div>

      {/* Current Medications */}
      <div className="healthcare-card border border-primary/30">
        <div className="flex items-center gap-2 mb-4">
          <Pill className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-primary">Current Medications</h3>
        </div>
        
        {currentMedications.length > 0 ? (
          <div className="space-y-3">
            {currentMedications.slice(0, 10).map((med, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-primary/5 rounded-xl"
              >
                <div>
                  <p className="font-semibold">{med.name}</p>
                  <p className="text-sm text-muted-foreground">{med.dosage}</p>
                </div>
                <span className="text-sm text-primary font-medium">{med.frequency}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No active medications</p>
        )}
      </div>

      {/* AI Disclaimer - MANDATORY */}
      <div className="healthcare-card bg-muted/50 border-2 border-muted">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm text-foreground">AI Disclaimer</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              This AI-generated summary is for <strong>assistive purposes only</strong>. 
              The AI operates solely on patient-provided data and does not diagnose 
              diseases or prescribe medication. <strong>Final medical decisions always 
              remain with qualified healthcare professionals.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAISummary;
