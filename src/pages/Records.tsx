import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { FileText, Calendar, Upload, CheckCircle, AlertCircle, Plus, Pill, Syringe, TestTube } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePrescriptions, Prescription } from "@/hooks/usePrescriptions";
import { useMedicalHistory } from "@/hooks/useMedicalHistory";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadPrescriptionDialog from "@/components/prescriptions/UploadPrescriptionDialog";
import ManualPrescriptionDialog from "@/components/prescriptions/ManualPrescriptionDialog";
import PrescriptionFilters from "@/components/prescriptions/PrescriptionFilters";
import UploadRecordDialog from "@/components/records/UploadRecordDialog";

const Records = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { prescriptions, loading: prescriptionsLoading } = usePrescriptions();
  const { records, loading: recordsLoading } = useMedicalHistory();
  
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [showRecordDialog, setShowRecordDialog] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Filter prescriptions
  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((prescription) => {
      // Search filter - check title, description, and medications
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = prescription.title.toLowerCase().includes(query);
        const matchesDescription = prescription.description?.toLowerCase().includes(query);
        
        // Check medications array
        const medications = prescription.medications as Array<{ name?: string }> || [];
        const matchesMedication = medications.some(
          (med) => med.name?.toLowerCase().includes(query)
        );

        if (!matchesTitle && !matchesDescription && !matchesMedication) {
          return false;
        }
      }

      // Date range filter
      const prescriptionDate = new Date(prescription.created_at);
      
      if (startDate && prescriptionDate < startDate) {
        return false;
      }
      
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (prescriptionDate > endOfDay) {
          return false;
        }
      }

      return true;
    });
  }, [prescriptions, searchQuery, startDate, endDate]);

  const hasActiveFilters = !!(searchQuery || startDate || endDate);

  const clearFilters = () => {
    setSearchQuery("");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // Get record type icon
  const getRecordIcon = (type: string) => {
    switch (type) {
      case "vaccination":
        return <Syringe className="h-4 w-4 text-success" />;
      case "lab_test":
      case "blood_work":
        return <TestTube className="h-4 w-4 text-primary" />;
      default:
        return <FileText className="h-4 w-4 text-primary" />;
    }
  };

  const loading = authLoading || prescriptionsLoading || recordsLoading;

  if (loading) {
    return (
      <AppLayout title="Medical Records">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Medical Records">
      <div className="space-y-6 animate-fade-in">
        {/* Upload Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => setShowUploadDialog(true)}
            className="healthcare-card flex flex-col items-center justify-center gap-1.5 py-4 border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <Upload className="h-5 w-5 text-primary" />
            <span className="font-medium text-primary text-xs">Upload Rx</span>
          </button>
          
          <button 
            onClick={() => setShowManualDialog(true)}
            className="healthcare-card flex flex-col items-center justify-center gap-1.5 py-4 border-2 border-dashed border-secondary/30 hover:border-secondary/50 hover:bg-secondary/5 transition-all"
          >
            <Plus className="h-5 w-5 text-secondary" />
            <span className="font-medium text-secondary text-xs">Manual Rx</span>
          </button>

          <button 
            onClick={() => setShowRecordDialog(true)}
            className="healthcare-card flex flex-col items-center justify-center gap-1.5 py-4 border-2 border-dashed border-success/30 hover:border-success/50 hover:bg-success/5 transition-all"
          >
            <Syringe className="h-5 w-5 text-success" />
            <span className="font-medium text-success text-xs">Add Record</span>
          </button>
        </div>

        <Tabs defaultValue="prescriptions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="history">Medical History</TabsTrigger>
          </TabsList>

          <TabsContent value="prescriptions" className="space-y-4 mt-4">
            {/* Filters */}
            <PrescriptionFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Filter summary */}
            {hasActiveFilters && (
              <p className="text-xs text-muted-foreground">
                Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions
              </p>
            )}

            {filteredPrescriptions.length === 0 ? (
              <div className="text-center py-12">
                <Pill className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {hasActiveFilters ? "No prescriptions match your filters" : "No prescriptions yet"}
                </p>
                {!hasActiveFilters && (
                  <p className="text-sm text-muted-foreground">
                    Upload or add your first prescription
                  </p>
                )}
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-4">
                  {filteredPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="relative flex gap-4">
                      {/* Timeline dot */}
                      <div className={cn(
                        "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2",
                        prescription.is_verified 
                          ? "bg-success/10 border-success" 
                          : "bg-warning/10 border-warning"
                      )}>
                        <Pill className={cn(
                          "h-4 w-4",
                          prescription.is_verified ? "text-success" : "text-warning"
                        )} />
                      </div>

                      {/* Card */}
                      <div className="flex-1 healthcare-card">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{prescription.title}</h4>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {prescription.description || (prescription.upload_source === "user" ? "User uploaded - Not verified" : "Added by doctor")}
                            </p>
                            
                            {/* Show medications if any */}
                            {Array.isArray(prescription.medications) && prescription.medications.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {(prescription.medications as Array<{ name?: string }>).slice(0, 3).map((med, idx) => (
                                  med.name && (
                                    <span key={idx} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                      {med.name}
                                    </span>
                                  )
                                ))}
                                {prescription.medications.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{prescription.medications.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {new Date(prescription.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            
                            {prescription.is_verified ? (
                              <span className="flex items-center gap-1 text-xs text-success">
                                <CheckCircle className="h-3 w-3" />
                                Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-warning">
                                <AlertCircle className="h-3 w-3" />
                                Unverified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            {records.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No medical history yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add vaccination records, test results, and more
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-4">
                  {records.map((record) => (
                    <div key={record.id} className="relative flex gap-4">
                      <div className={cn(
                        "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 bg-primary/10 border-primary",
                        record.record_type === "vaccination" && "bg-success/10 border-success",
                        (record.record_type === "lab_test" || record.record_type === "blood_work") && "bg-secondary/10 border-secondary"
                      )}>
                        {getRecordIcon(record.record_type)}
                      </div>

                      <div className="flex-1 healthcare-card">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full capitalize">
                                {record.record_type.replace("_", " ")}
                              </span>
                            </div>
                            <h4 className="font-semibold truncate mt-1">{record.title}</h4>
                            {record.description && (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {record.description}
                              </p>
                            )}
                            
                            {/* Show attachments if any */}
                            {record.attachments && record.attachments.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                {record.attachments.map((url, idx) => (
                                  <a
                                    key={idx}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-xs text-primary hover:underline bg-primary/10 px-2 py-1 rounded-full"
                                  >
                                    <FileText className="h-3 w-3" />
                                    <span>View File {idx + 1}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {new Date(record.date_recorded).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Note */}
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground text-center">
            📋 All records are append-only. No edits or deletions are allowed to ensure 
            complete medical history integrity.
          </p>
        </div>
      </div>

      <UploadPrescriptionDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
      />
      
      <ManualPrescriptionDialog
        open={showManualDialog}
        onOpenChange={setShowManualDialog}
      />

      <UploadRecordDialog
        open={showRecordDialog}
        onOpenChange={setShowRecordDialog}
      />
    </AppLayout>
  );
};

export default Records;
