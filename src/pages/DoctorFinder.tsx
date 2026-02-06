import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import SafetyDisclaimer from "@/components/shared/SafetyDisclaimer";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Search,
  Heart,
  Brain,
  Bone,
  Eye,
  Baby,
  Stethoscope,
  Pill,
  Activity,
  Navigation,
  Phone,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface Specialty {
  id: string;
  label: string;
  icon: typeof Heart;
  keywords: string[];
}

interface DoctorResult {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  distance: string;
  phone: string;
  rating: number;
}

const SPECIALTIES: Specialty[] = [
  { id: "cardiac", label: "Cardiac / Heart", icon: Heart, keywords: ["heart", "cardiac", "chest pain", "bp", "hypertension"] },
  { id: "neuro", label: "Neurological", icon: Brain, keywords: ["brain", "nerve", "headache", "migraine", "seizure"] },
  { id: "ortho", label: "Orthopedic / Bone", icon: Bone, keywords: ["bone", "joint", "fracture", "back pain", "arthritis"] },
  { id: "eye", label: "Ophthalmology / Eye", icon: Eye, keywords: ["eye", "vision", "cataract", "glaucoma"] },
  { id: "pediatric", label: "Pediatric / Child", icon: Baby, keywords: ["child", "infant", "pediatric", "fever"] },
  { id: "general", label: "General Medicine", icon: Stethoscope, keywords: ["fever", "cold", "infection", "general"] },
  { id: "diabetes", label: "Diabetes / Endocrine", icon: Activity, keywords: ["diabetes", "thyroid", "hormone", "sugar"] },
  { id: "derma", label: "Dermatology / Skin", icon: Pill, keywords: ["skin", "rash", "allergy", "acne", "eczema"] },
];

// Simulated nearby doctor results (in production, this would query a real API / database)
const MOCK_RESULTS: Record<string, DoctorResult[]> = {
  cardiac: [
    { id: "1", name: "Dr. Anil Sharma", specialty: "Cardiologist", clinic: "Heart Care Clinic", distance: "1.2 km", phone: "+91-9876543210", rating: 4.8 },
    { id: "2", name: "Dr. Priya Kapoor", specialty: "Cardiologist", clinic: "City Heart Hospital", distance: "2.5 km", phone: "+91-9876543211", rating: 4.6 },
  ],
  neuro: [
    { id: "3", name: "Dr. Vikram Rao", specialty: "Neurologist", clinic: "Neuro Care Center", distance: "1.8 km", phone: "+91-9876543212", rating: 4.7 },
  ],
  ortho: [
    { id: "4", name: "Dr. Suresh Reddy", specialty: "Orthopedic Surgeon", clinic: "Bone & Joint Clinic", distance: "0.9 km", phone: "+91-9876543213", rating: 4.5 },
    { id: "5", name: "Dr. Meena Iyer", specialty: "Orthopedic Specialist", clinic: "OrthoPlus Hospital", distance: "3.1 km", phone: "+91-9876543214", rating: 4.9 },
  ],
  eye: [
    { id: "6", name: "Dr. Ravi Menon", specialty: "Ophthalmologist", clinic: "Vision Eye Center", distance: "2.0 km", phone: "+91-9876543215", rating: 4.4 },
  ],
  pediatric: [
    { id: "7", name: "Dr. Neha Gupta", specialty: "Pediatrician", clinic: "Kids Care Clinic", distance: "1.5 km", phone: "+91-9876543216", rating: 4.8 },
  ],
  general: [
    { id: "8", name: "Dr. Ajay Nair", specialty: "General Physician", clinic: "Family Health Center", distance: "0.5 km", phone: "+91-9876543217", rating: 4.3 },
    { id: "9", name: "Dr. Fatima Khan", specialty: "General Physician", clinic: "MedPlus Clinic", distance: "1.1 km", phone: "+91-9876543218", rating: 4.6 },
  ],
  diabetes: [
    { id: "10", name: "Dr. Sunita Joshi", specialty: "Endocrinologist", clinic: "Diabetes & Thyroid Center", distance: "2.3 km", phone: "+91-9876543219", rating: 4.7 },
  ],
  derma: [
    { id: "11", name: "Dr. Kiran Patel", specialty: "Dermatologist", clinic: "Skin & Glow Clinic", distance: "1.7 km", phone: "+91-9876543220", rating: 4.5 },
  ],
};

const DoctorFinder = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [results, setResults] = useState<DoctorResult[]>([]);
  const [locationGranted, setLocationGranted] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSpecialtySelect = (specialtyId: string) => {
    setSelectedSpecialty(specialtyId);
    setResults([]);
  };

  const handleSearch = async () => {
    if (!selectedSpecialty) {
      toast.error("Please select a health condition first");
      return;
    }

    setSearching(true);

    // Request geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationGranted(true);
          // Simulate search delay
          setTimeout(() => {
            setResults(MOCK_RESULTS[selectedSpecialty] || []);
            setSearching(false);
          }, 1000);
        },
        () => {
          // Location denied — still show results
          setLocationGranted(false);
          setTimeout(() => {
            setResults(MOCK_RESULTS[selectedSpecialty] || []);
            setSearching(false);
            toast.info("Location access denied. Showing general results.");
          }, 800);
        }
      );
    } else {
      setTimeout(() => {
        setResults(MOCK_RESULTS[selectedSpecialty] || []);
        setSearching(false);
      }, 800);
    }
  };

  return (
    <AppLayout title="Doctor Finder">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="healthcare-card gradient-primary text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-xl">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Find a Doctor</h2>
              <p className="text-white/80 text-sm">Healthcare Navigation Tool</p>
            </div>
          </div>
        </div>

        {/* Specialty Selection */}
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
                  onClick={() => handleSpecialtySelect(spec.id)}
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

        {/* Search Button */}
        {selectedSpecialty && (
          <Button
            className="w-full gradient-primary text-white"
            onClick={handleSearch}
            disabled={searching}
          >
            {searching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Searching nearby...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Find Nearby Doctors
              </>
            )}
          </Button>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Nearby Doctors{" "}
              {locationGranted && (
                <span className="text-success">
                  <MapPin className="h-3 w-3 inline" /> Location-based
                </span>
              )}
            </h3>

            {results.map((doctor) => (
              <div key={doctor.id} className="healthcare-card p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{doctor.name}</p>
                    <p className="text-sm text-primary">{doctor.specialty}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {doctor.clinic}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {doctor.distance}
                      </span>
                      <span className="text-xs text-warning">
                        ★ {doctor.rating}
                      </span>
                    </div>
                  </div>
                  <a
                    href={`tel:${doctor.phone}`}
                    className="p-2.5 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors"
                  >
                    <Phone className="h-5 w-5 text-primary" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Disclaimer */}
        <SafetyDisclaimer variant="navigation" />
      </div>
    </AppLayout>
  );
};

export default DoctorFinder;
