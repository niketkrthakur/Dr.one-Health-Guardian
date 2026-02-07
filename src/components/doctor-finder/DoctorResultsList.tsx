import { MapPin, Phone } from "lucide-react";

export interface DoctorResult {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  distance: string;
  phone: string;
  rating: number;
  source: string;
}

interface DoctorResultsListProps {
  results: DoctorResult[];
  locationGranted: boolean;
}

const DoctorResultsList = ({ results, locationGranted }: DoctorResultsListProps) => {
  if (results.length === 0) {
    return (
      <div className="healthcare-card border-border bg-muted/30 text-center py-6">
        <p className="font-semibold text-foreground mb-1">
          No verified providers available
        </p>
        <p className="text-sm text-muted-foreground">
          Doctor listings will appear once verified data sources are connected.
        </p>
      </div>
    );
  }

  return (
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
              <p className="text-xs text-muted-foreground mt-1">{doctor.clinic}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {doctor.distance}
                </span>
                <span className="text-xs text-muted-foreground italic">
                  Source: {doctor.source}
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
  );
};

export default DoctorResultsList;
