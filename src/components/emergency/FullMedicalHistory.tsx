import { FileText, Calendar, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { useState } from "react";
import { MedicalRecord } from "@/hooks/useMedicalHistory";
import { Button } from "@/components/ui/button";

interface FullMedicalHistoryProps {
  records: MedicalRecord[];
  loading: boolean;
}

const FullMedicalHistory = ({ records, loading }: FullMedicalHistoryProps) => {
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        className="w-full justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          View Complete Medical History (If Required)
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {expanded && (
        <div className="space-y-3 animate-fade-in">
          {/* Authorization notice */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong>Authorized Access:</strong> Full medical history is displayed
                in read-only format for clinical reference. No modifications are
                permitted through this view.
              </p>
            </div>
          </div>

          {records.length === 0 ? (
            <div className="healthcare-card text-center py-6">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground text-sm">
                No medical history records found
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="healthcare-card p-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium capitalize">
                          {record.record_type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="font-medium text-sm">{record.title}</p>
                      {record.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {record.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-3">
                      <Calendar className="h-3 w-3" />
                      {new Date(record.date_recorded).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FullMedicalHistory;
