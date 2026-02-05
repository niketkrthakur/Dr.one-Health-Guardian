import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import PatientAISummary from "@/components/doctor/PatientAISummary";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { usePrescriptions } from "@/hooks/usePrescriptions";

const AISummary = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { prescriptions, loading: prescriptionsLoading } = usePrescriptions();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const isLoading = authLoading || profileLoading || prescriptionsLoading;

  if (isLoading) {
    return (
      <AppLayout title="AI Medical Summary">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout title="AI Medical Summary">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please complete your profile first</p>
        </div>
      </AppLayout>
    );
  }

  // Transform prescriptions for the AI summary component
  const transformedPrescriptions = prescriptions.map((rx) => ({
    id: rx.id,
    title: rx.title,
    medications: rx.medications as Array<{ name: string; dosage: string; frequency: string }> | null,
    is_verified: rx.is_verified,
    created_at: rx.created_at
  }));

  return (
    <AppLayout title="AI Medical Summary">
      <div className="animate-fade-in">
        <PatientAISummary 
          patient={profile} 
          prescriptions={transformedPrescriptions}
        />
      </div>
    </AppLayout>
  );
};

export default AISummary;
