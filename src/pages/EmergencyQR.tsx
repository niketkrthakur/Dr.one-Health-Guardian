import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import AppLayout from "@/components/layout/AppLayout";
import MinimumSafeDataset from "@/components/emergency/MinimumSafeDataset";
import FullMedicalHistory from "@/components/emergency/FullMedicalHistory";
import WearableDataCard from "@/components/wearable/WearableDataCard";
import SafetyDisclaimer from "@/components/shared/SafetyDisclaimer";
import { WifiOff, Share2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { useMedicalHistory } from "@/hooks/useMedicalHistory";
import { useAccessToken } from "@/hooks/useAccessToken";
import { toast } from "sonner";

const EmergencyQR = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { prescriptions } = usePrescriptions();
  const { records, loading: historyLoading } = useMedicalHistory();
  const { generateToken, loading: tokenLoading } = useAccessToken();

  const [qrData, setQrData] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && !qrData) {
      generateNewToken();
    }
  }, [user]);

  const generateNewToken = async () => {
    const result = await generateToken(30);
    if (result.token) {
      const accessUrl = `${window.location.origin}/doctor-access?token=${result.token}`;
      setQrData(accessUrl);
      setExpiresAt(result.expiresAt || null);
    }
  };

  const handleShare = async () => {
    if (!qrData) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Dr.One Medical Access",
          text: "Scan this QR code or use this link to access my medical information",
          url: qrData,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(qrData);
      toast.success("Access link copied to clipboard");
    }
  };

  // Extract medications from prescriptions
  const currentMedications = prescriptions.flatMap((rx) => {
    if (rx.medications && Array.isArray(rx.medications)) {
      return (rx.medications as Array<{ name: string; dosage: string; frequency: string }>).filter(
        (m) => typeof m === "object" && m !== null && "name" in m
      );
    }
    return [];
  });

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <AppLayout title="Emergency QR" showNav={false}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  const timeRemaining = expiresAt
    ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 60000))
    : 30;

  return (
    <AppLayout title="Emergency QR" showNav={false}>
      <div className="space-y-6 animate-fade-in">
        {/* Offline Badge */}
        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-success/10 text-success rounded-full mx-auto w-fit">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">Works Offline</span>
        </div>

        {/* QR Code Card */}
        <div className="healthcare-card text-center py-8">
          <div className="inline-flex items-center justify-center w-56 h-56 bg-white rounded-2xl shadow-lg mx-auto mb-4 p-4">
            {qrData ? (
              <QRCodeSVG
                value={qrData}
                size={200}
                level="H"
                includeMargin={false}
                className="rounded-lg"
              />
            ) : (
              <div className="animate-pulse bg-muted w-full h-full rounded-lg" />
            )}
          </div>

          <h3 className="font-bold text-lg">Emergency Medical QR</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Valid for {timeRemaining} minutes
          </p>

          <div className="flex gap-2 justify-center mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={generateNewToken}
              disabled={tokenLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-1 ${tokenLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button size="sm" onClick={handleShare} className="gradient-primary">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>

        {/* Emergency Disclaimer Banner */}
        <SafetyDisclaimer variant="emergency" />

        {/* Minimum Safe Dataset — DEFAULT VIEW */}
        {profile && (
          <MinimumSafeDataset
            profile={profile}
            medications={currentMedications}
          />
        )}

        {/* Wearable Vitals (contextual, compact) */}
        <WearableDataCard compact />

        {/* Full Medical History — SECONDARY, EXPANDABLE */}
        <FullMedicalHistory records={records} loading={historyLoading} />

        {/* Security Notice */}
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground text-center">
            🔒 This QR provides <strong>time-limited, read-only</strong> access
            to critical medical information. Doctors can view and add
            prescriptions only.
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-3 px-6 rounded-xl border border-border text-foreground font-medium hover:bg-muted transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </AppLayout>
  );
};

export default EmergencyQR;
