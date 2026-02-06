import { Droplet, AlertTriangle, Heart, Pill, Phone } from "lucide-react";
import { Profile } from "@/hooks/useProfile";

interface MinimumSafeDatasetProps {
  profile: Profile;
  medications?: Array<{ name: string; dosage: string; frequency: string }>;
}

const MinimumSafeDataset = ({ profile, medications = [] }: MinimumSafeDatasetProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 rounded-full w-fit">
        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
        <span className="text-xs font-bold text-destructive uppercase tracking-wider">
          Minimum Safe Dataset
        </span>
      </div>

      {/* Patient Identity & Blood Group */}
      <div className="healthcare-card flex items-center justify-between">
        <div>
          <p className="font-bold text-lg">{profile.name || "Name not set"}</p>
          <p className="text-muted-foreground text-sm">
            {profile.age ? `${profile.age}y` : "Age N/A"} • {profile.gender || "Gender N/A"}
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-xl">
          <Droplet className="h-5 w-5" />
          <span className="font-bold text-xl">{profile.blood_group || "N/A"}</span>
        </div>
      </div>

      {/* Allergies — CRITICAL */}
      <div className="healthcare-card alert-critical border">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-semibold text-sm">KNOWN ALLERGIES</span>
        </div>
        {profile.allergies && profile.allergies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.allergies.map((allergy, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-destructive/20 rounded-full text-sm font-semibold"
              >
                {allergy}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No known allergies recorded</p>
        )}
      </div>

      {/* Chronic Conditions */}
      <div className="healthcare-card alert-warning border">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-4 w-4" />
          <span className="font-semibold text-sm">CHRONIC CONDITIONS</span>
        </div>
        {profile.chronic_conditions && profile.chronic_conditions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.chronic_conditions.map((condition, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-warning/20 rounded-full text-sm font-semibold"
              >
                {condition}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No chronic conditions recorded</p>
        )}
      </div>

      {/* High-Risk / Ongoing Medications */}
      <div className="healthcare-card border border-primary/30">
        <div className="flex items-center gap-2 mb-3">
          <Pill className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm text-primary">ONGOING MEDICATIONS</span>
        </div>
        {medications.length > 0 ? (
          <div className="space-y-2">
            {medications.slice(0, 8).map((med, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-primary/5 rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">{med.name}</p>
                  <p className="text-xs text-muted-foreground">{med.dosage}</p>
                </div>
                <span className="text-xs text-primary font-medium">{med.frequency}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No active medications recorded</p>
        )}
      </div>

      {/* Emergency Contact */}
      {profile.emergency_contact ? (
        <a
          href={`tel:${profile.emergency_contact}`}
          className="healthcare-card flex items-center gap-4 bg-primary/5 border-primary/30 hover:bg-primary/10 transition-colors"
        >
          <div className="p-3 bg-primary/10 rounded-xl">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Emergency Contact{" "}
              {profile.emergency_contact_name &&
                `(${profile.emergency_contact_name})`}
            </p>
            <p className="font-bold text-lg text-primary">
              {profile.emergency_contact}
            </p>
          </div>
        </a>
      ) : (
        <div className="healthcare-card bg-muted/50 text-center py-4">
          <Phone className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No emergency contact set</p>
        </div>
      )}
    </div>
  );
};

export default MinimumSafeDataset;
