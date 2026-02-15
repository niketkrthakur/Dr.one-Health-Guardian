import { MapPin, Star, Clock, ExternalLink } from "lucide-react";

export interface DoctorResult {
  id: string;
  name: string;
  address: string;
  rating: number | null;
  totalRatings: number;
  openNow: boolean | null;
  lat: number;
  lng: number;
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
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{doctor.name}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">{doctor.address}</span>
              </p>
              <div className="flex items-center gap-3 mt-2">
                {doctor.rating !== null && (
                  <span className="flex items-center gap-1 text-xs font-medium">
                    <Star className="h-3 w-3 text-warning fill-warning" />
                    {doctor.rating} ({doctor.totalRatings})
                  </span>
                )}
                {doctor.openNow !== null && (
                  <span className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    <span className={doctor.openNow ? "text-success" : "text-destructive"}>
                      {doctor.openNow ? "Open now" : "Closed"}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 italic">
                Source: Google Places
              </p>
            </div>
            <a
              href={`https://www.google.com/maps/place/?q=place_id:${doctor.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors flex-shrink-0"
              title="View on Maps"
            >
              <ExternalLink className="h-4 w-4 text-primary" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DoctorResultsList;
