import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import SafetyDisclaimer from "@/components/shared/SafetyDisclaimer";
import { useMedicalHistory } from "@/hooks/useMedicalHistory";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { useWearableData } from "@/hooks/useWearableData";
import {
  FileText,
  Pill,
  Heart,
  Activity,
  Thermometer,
  Syringe,
  TestTube,
  Stethoscope,
  Calendar,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

type TimelineCategory = "all" | "records" | "prescriptions" | "wearable";

interface TimelineEntry {
  id: string;
  date: Date;
  category: "records" | "prescriptions" | "wearable";
  title: string;
  description: string | null;
  badge: string;
  icon: typeof FileText;
  badgeClass: string;
}

const recordTypeIcon: Record<string, typeof FileText> = {
  prescription: Pill,
  vaccination: Syringe,
  lab_test: TestTube,
  imaging: Activity,
  consultation: Stethoscope,
};

const Timeline = () => {
  const { records, loading: recordsLoading } = useMedicalHistory();
  const { prescriptions, loading: rxLoading } = usePrescriptions();
  const { readings, connected } = useWearableData();
  const [filter, setFilter] = useState<TimelineCategory>("all");

  const entries: TimelineEntry[] = [];

  // Map medical history
  records.forEach((r) => {
    entries.push({
      id: `rec-${r.id}`,
      date: parseISO(r.date_recorded),
      category: "records",
      title: r.title,
      description: r.description,
      badge: r.record_type,
      icon: recordTypeIcon[r.record_type] || FileText,
      badgeClass: "bg-primary/10 text-primary",
    });
  });

  // Map prescriptions
  prescriptions.forEach((p) => {
    entries.push({
      id: `rx-${p.id}`,
      date: parseISO(p.created_at),
      category: "prescriptions",
      title: p.title,
      description: p.description,
      badge: p.is_verified ? "Verified" : "Unverified",
      icon: Pill,
      badgeClass: p.is_verified
        ? "bg-success/10 text-success"
        : "bg-warning/10 text-warning",
    });
  });

  // Map wearable snapshots (latest reading as today's entry)
  if (connected && readings.length > 0) {
    readings.forEach((r) => {
      entries.push({
        id: `wear-${r.type}`,
        date: parseISO(r.timestamp),
        category: "wearable",
        title: `${r.label}: ${r.value} ${r.unit}`,
        description: `Status: ${r.status}`,
        badge: "Wearable",
        icon: r.type === "heart_rate" ? Heart : r.type === "temperature" ? Thermometer : Activity,
        badgeClass: "bg-accent text-accent-foreground",
      });
    });
  }

  // Filter + sort descending
  const filtered = entries
    .filter((e) => filter === "all" || e.category === filter)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const loading = recordsLoading || rxLoading;

  const filters: { key: TimelineCategory; label: string }[] = [
    { key: "all", label: "All" },
    { key: "records", label: "Records" },
    { key: "prescriptions", label: "Rx" },
    { key: "wearable", label: "Wearable" },
  ];

  return (
    <AppLayout title="Timeline">
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Health Timeline</h1>
            <p className="text-sm text-muted-foreground">
              Unified chronological view
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {filters.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={filter === f.key ? "default" : "outline"}
              className={cn("text-xs", filter === f.key && "gradient-primary text-white")}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="healthcare-card text-center py-10">
            <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground text-sm">
              No entries found. Add medical records or prescriptions to see your timeline.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-4">
              {filtered.map((entry, idx) => {
                const Icon = entry.icon;
                const showDateHeader =
                  idx === 0 ||
                  format(filtered[idx - 1].date, "yyyy-MM-dd") !==
                    format(entry.date, "yyyy-MM-dd");

                return (
                  <div key={entry.id}>
                    {showDateHeader && (
                      <div className="flex items-center gap-3 mb-3 ml-1">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center z-10">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {format(entry.date, "MMMM d, yyyy")}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-3 ml-1">
                      <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center z-10 flex-shrink-0">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="healthcare-card flex-1 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{entry.title}</p>
                            {entry.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {entry.description}
                              </p>
                            )}
                          </div>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap",
                              entry.badgeClass
                            )}
                          >
                            {entry.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1.5">
                          {format(entry.date, "h:mm a")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <SafetyDisclaimer variant="ai" />
      </div>
    </AppLayout>
  );
};

export default Timeline;
