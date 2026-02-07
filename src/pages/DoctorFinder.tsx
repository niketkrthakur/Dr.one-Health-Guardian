import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import SafetyDisclaimer from "@/components/shared/SafetyDisclaimer";
import SpecialtyGrid from "@/components/doctor-finder/SpecialtyGrid";
import DoctorResultsList from "@/components/doctor-finder/DoctorResultsList";
import NoDataSourceBanner from "@/components/doctor-finder/NoDataSourceBanner";
import { Button } from "@/components/ui/button";
import { Search, Navigation } from "lucide-react";
import { toast } from "sonner";

const DoctorFinder = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  const handleSpecialtySelect = (specialtyId: string) => {
    setSelectedSpecialty(specialtyId);
    setSearchCompleted(false);
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
          // No real data source connected — show empty state after brief delay
          setTimeout(() => {
            setSearchCompleted(true);
            setSearching(false);
          }, 600);
        },
        () => {
          setLocationGranted(false);
          setTimeout(() => {
            setSearchCompleted(true);
            setSearching(false);
            toast.info("Location access denied. Results may be limited.");
          }, 600);
        }
      );
    } else {
      setTimeout(() => {
        setSearchCompleted(true);
        setSearching(false);
      }, 600);
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
        <SpecialtyGrid
          selectedSpecialty={selectedSpecialty}
          onSelect={handleSpecialtySelect}
        />

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

        {/* Results — currently no real data source connected */}
        {searchCompleted && (
          <DoctorResultsList
            results={[]}
            locationGranted={locationGranted}
          />
        )}

        {/* No Data Source Banner — always shown */}
        <NoDataSourceBanner />

        {/* Navigation Disclaimer */}
        <SafetyDisclaimer variant="navigation" />
      </div>
    </AppLayout>
  );
};

export default DoctorFinder;
