import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import SafetyDisclaimer from "@/components/shared/SafetyDisclaimer";
import SpecialtyGrid from "@/components/doctor-finder/SpecialtyGrid";
import DoctorResultsList, { DoctorResult } from "@/components/doctor-finder/DoctorResultsList";
import NoDataSourceBanner from "@/components/doctor-finder/NoDataSourceBanner";
import { Button } from "@/components/ui/button";
import { Search, Navigation } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const DoctorFinder = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [results, setResults] = useState<DoctorResult[]>([]);
  const [apiMissing, setApiMissing] = useState(false);

  const handleSpecialtySelect = (specialtyId: string) => {
    setSelectedSpecialty(specialtyId);
    setSearchCompleted(false);
    setResults([]);
    setApiMissing(false);
  };

  const handleSearch = async () => {
    if (!selectedSpecialty) {
      toast.error("Please select a health condition first");
      return;
    }

    setSearching(true);
    setApiMissing(false);

    const doSearch = async (lat: number, lng: number) => {
      try {
        const { data, error } = await supabase.functions.invoke("search-doctors", {
          body: { lat, lng, specialty: selectedSpecialty, radius: 5000 },
        });

        if (error) {
          console.error("Edge function error:", error);
          setResults([]);
          setApiMissing(true);
        } else if (data?.error?.includes("not configured")) {
          setResults([]);
          setApiMissing(true);
        } else {
          setResults(data?.results || []);
          if (data?.results?.length === 0) {
            setApiMissing(!data?.error ? false : true);
          }
        }
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
        setApiMissing(true);
      }
      setSearchCompleted(true);
      setSearching(false);
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationGranted(true);
          doSearch(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          setLocationGranted(false);
          toast.info("Location access denied. Using default location.");
          // Fallback to a default (0,0 will return no results gracefully)
          doSearch(0, 0);
        }
      );
    } else {
      doSearch(0, 0);
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

        {/* Results */}
        {searchCompleted && (
          <DoctorResultsList
            results={results}
            locationGranted={locationGranted}
          />
        )}

        {/* No Data Source Banner — shown if API key missing */}
        {apiMissing && <NoDataSourceBanner />}

        {/* Navigation Disclaimer */}
        <SafetyDisclaimer variant="navigation" />
      </div>
    </AppLayout>
  );
};

export default DoctorFinder;
