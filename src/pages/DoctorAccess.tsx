import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAccessToken } from "@/hooks/useAccessToken";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/layout/AppLayout";
import PatientAISummary from "@/components/doctor/PatientAISummary";
import PrescriptionDriftAnalysis from "@/components/doctor/PrescriptionDriftAnalysis";
import WearableDataCard from "@/components/wearable/WearableDataCard";
import ManualPrescriptionDialog from "@/components/prescriptions/ManualPrescriptionDialog";
import SafetyDisclaimer from "@/components/shared/SafetyDisclaimer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Clock,
  Shield,
  Pill,
  Plus,
  CheckCircle,
  Brain,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Profile } from "@/hooks/useProfile";
import { MedicalRecord } from "@/hooks/useMedicalHistory";
import { useWearableData } from "@/hooks/useWearableData";

interface Prescription {
  id: string;
  title: string;
  description: string | null;
  medications: unknown;
  is_verified: boolean;
  created_at: string;
  file_url: string | null;
}

const DoctorAccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading } = useAuth();
  const { validateToken, useToken } = useAccessToken();

  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patient, setPatient] = useState<Profile | null>(null);
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);

  const { prescriptions } = usePrescriptions(patientId || undefined);
  const { readings: wearableReadings } = useWearableData(patientId || undefined);

  const validateAccess = useCallback(
    async (token: string) => {
      const result = await validateToken(token);

      if (!result.valid || !result.patientId) {
        toast.error("Access token expired or invalid");
        navigate("/doctor-dashboard");
        return;
      }

      setIsValid(true);
      setPatientId(result.patientId);
      setExpiresAt(result.expiresAt || null);

      await useToken(token);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", result.patientId)
        .maybeSingle();

      if (profileData) {
        setPatient(profileData as Profile);
      }

      const { data: historyData } = await supabase
        .from("medical_history")
        .select("*")
        .eq("patient_id", result.patientId)
        .order("date_recorded", { ascending: false });

      if (historyData) {
        setMedicalRecords(historyData as MedicalRecord[]);
      }

      setLoading(false);
    },
    [validateToken, useToken, navigate]
  );

  useEffect(() => {
    if (authLoading) return;

    const token = searchParams.get("token");
    if (!token) {
      toast.error("Invalid access link");
      navigate("/doctor-dashboard");
      return;
    }

    if (!user) {
      navigate(`/auth?redirect=/doctor-access?token=${token}`);
      return;
    }

    if (userRole !== "doctor") {
      toast.error("Only doctors can access patient records via QR");
      navigate("/dashboard");
      return;
    }

    validateAccess(token);
  }, [user, userRole, authLoading, searchParams, navigate, validateAccess]);

  if (loading || authLoading) {
    return (
      <AppLayout title="Doctor Access">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!isValid || !patient) {
    return (
      <AppLayout title="Doctor Access">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Invalid or expired access</p>
        </div>
      </AppLayout>
    );
  }

  const timeRemaining = expiresAt
    ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 60000))
    : 0;

  // Extract current medications
  const currentMedications: Array<{ name: string; dosage: string; frequency: string }> = [];
  prescriptions.forEach((rx: Prescription) => {
    if (rx.medications && Array.isArray(rx.medications)) {
      (rx.medications as Array<{ name: string; dosage: string; frequency: string }>).forEach(
        (med) => {
          if (typeof med === "object" && med !== null && "name" in med) {
            currentMedications.push(med);
          }
        }
      );
    }
  });

  const transformedPrescriptions = prescriptions.map((rx: Prescription) => ({
    id: rx.id,
    title: rx.title,
    medications: rx.medications as Array<{ name: string; dosage: string; frequency: string }> | null,
    is_verified: rx.is_verified,
    created_at: rx.created_at,
  }));

  return (
    <AppLayout title="Patient Record">
      <div className="space-y-6 animate-fade-in">
        {/* Access Badge */}
        <div className="flex items-center justify-between py-2 px-4 bg-primary/10 rounded-xl">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Doctor Access Mode
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {timeRemaining} min remaining
          </div>
        </div>

        {/* Quick Patient Info */}
        <Card className="healthcare-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              {patient.name || "Unknown Patient"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {patient.age ? `${patient.age}y` : "Age N/A"} •{" "}
              {patient.gender || "Gender N/A"} • Blood:{" "}
              {patient.blood_group || "N/A"}
            </p>
          </CardContent>
        </Card>

        {/* Prescription Drift Analysis — contextual advisory */}
        <PrescriptionDriftAnalysis
          medications={currentMedications}
          medicalHistory={medicalRecords}
          wearableReadings={wearableReadings}
          allergies={patient.allergies || []}
          chronicConditions={patient.chronic_conditions || []}
        />

        {/* Wearable Data — contextual safety signal */}
        <WearableDataCard patientId={patientId || undefined} />

        {/* Tabs for different views */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary" className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              AI Summary
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex items-center gap-1">
              <Pill className="h-4 w-4" />
              Rx
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-4">
            <PatientAISummary
              patient={patient}
              prescriptions={transformedPrescriptions}
            />
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-4">
            {/* Allergies */}
            {patient.allergies && patient.allergies.length > 0 && (
              <Card className="healthcare-card border-destructive/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Allergies (Read-Only)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chronic Conditions */}
            {patient.chronic_conditions && patient.chronic_conditions.length > 0 && (
              <Card className="healthcare-card border-warning/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm text-warning">
                    Chronic Conditions (Read-Only)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {patient.chronic_conditions.map((condition, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-warning/10 text-warning rounded-full text-sm"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medical Records */}
            <Card className="healthcare-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Medical History (Read-Only)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medicalRecords.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No medical history records
                  </p>
                ) : (
                  <div className="space-y-3">
                    {medicalRecords.map((record) => (
                      <div key={record.id} className="p-3 bg-muted/50 rounded-xl">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{record.title}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(record.date_recorded).toLocaleDateString()}
                          </span>
                        </div>
                        {record.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {record.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="mt-4">
            <Card className="healthcare-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Pill className="h-5 w-5 text-primary" />
                  Prescriptions
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowAddPrescription(true)}
                  className="gradient-primary"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add New
                </Button>
              </CardHeader>
              <CardContent>
                {prescriptions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No prescriptions on file
                  </p>
                ) : (
                  <div className="space-y-3">
                    {prescriptions.map((rx: Prescription) => (
                      <div
                        key={rx.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                      >
                        <div>
                          <p className="font-medium">{rx.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(rx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {rx.is_verified ? (
                          <span className="flex items-center gap-1 text-xs text-success">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-xs text-warning">Unverified</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Permissions & Disclaimer */}
        <SafetyDisclaimer variant="advisory" />
        <SafetyDisclaimer variant="ai" />
      </div>

      <ManualPrescriptionDialog
        open={showAddPrescription}
        onOpenChange={setShowAddPrescription}
        patientId={patientId || undefined}
        patientAllergies={patient?.allergies || []}
      />
    </AppLayout>
  );
};

export default DoctorAccess;
