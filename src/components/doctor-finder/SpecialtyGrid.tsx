import {
  Heart,
  Brain,
  Bone,
  Eye,
  Baby,
  Stethoscope,
  Activity,
  Pill,
} from "lucide-react";

interface Specialty {
  id: string;
  label: string;
  icon: typeof Heart;
}

const SPECIALTIES: Specialty[] = [
  { id: "cardiac", label: "Cardiac / Heart", icon: Heart },
  { id: "neuro", label: "Neurological", icon: Brain },
  { id: "ortho", label: "Orthopedic / Bone", icon: Bone },
  { id: "eye", label: "Ophthalmology / Eye", icon: Eye },
  { id: "pediatric", label: "Pediatric / Child", icon: Baby },
  { id: "general", label: "General Medicine", icon: Stethoscope },
  { id: "diabetes", label: "Diabetes / Endocrine", icon: Activity },
  { id: "derma", label: "Dermatology / Skin", icon: Pill },
];

interface SpecialtyGridProps {
  selectedSpecialty: string | null;
  onSelect: (id: string) => void;
}

const SpecialtyGrid = ({ selectedSpecialty, onSelect }: SpecialtyGridProps) => (
  <div className="space-y-3">
    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
      Select Your Known Condition
    </h3>
    <div className="grid grid-cols-2 gap-2">
      {SPECIALTIES.map((spec) => {
        const Icon = spec.icon;
        const isSelected = selectedSpecialty === spec.id;
        return (
          <button
            key={spec.id}
            onClick={() => onSelect(spec.id)}
            className={`p-3 rounded-xl border text-left transition-all duration-200 ${
              isSelected
                ? "border-primary bg-primary/10 shadow-md"
                : "border-border bg-card hover:border-primary/30 hover:bg-primary/5"
            }`}
          >
            <Icon
              className={`h-5 w-5 mb-1.5 ${
                isSelected ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <p
              className={`text-sm font-medium ${
                isSelected ? "text-primary" : "text-foreground"
              }`}
            >
              {spec.label}
            </p>
          </button>
        );
      })}
    </div>
  </div>
);

export default SpecialtyGrid;
