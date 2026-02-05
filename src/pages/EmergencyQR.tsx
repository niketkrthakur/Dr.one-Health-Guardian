import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import AppLayout from "@/components/layout/AppLayout";
import { Droplet, AlertTriangle, Heart, Phone, WifiOff, Share2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useAccessToken } from "@/hooks/useAccessToken";
import { toast } from "sonner";

const EmergencyQR = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
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
    const result = await generateToken(30); // 30 minutes expiry
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
          url: qrData
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(qrData);
      toast.success("Access link copied to clipboard");
    }
  };

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
              <div className="animate-pulse bg-gray-200 w-full h-full rounded-lg" />
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
              <RefreshCw className={`h-4 w-4 mr-1 ${tokenLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              size="sm"
              onClick={handleShare}
              className="gradient-primary"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>

        {/* Quick Info Display */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Critical Information
          </h4>

          {/* Patient Name & Blood Group */}
          <div className="healthcare-card flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">{profile?.name || "Name not set"}</p>
              <p className="text-muted-foreground text-sm">
                {profile?.age ? `${profile.age}y` : "Age N/A"} • {profile?.gender || "Gender N/A"}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-xl">
              <Droplet className="h-5 w-5" />
              <span className="font-bold text-xl">{profile?.blood_group || "N/A"}</span>
            </div>
          </div>

          {/* Allergies */}
          {profile?.allergies && profile.allergies.length > 0 && (
            <div className="healthcare-card alert-critical border">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-semibold text-sm">ALLERGIES</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.allergies.map((allergy, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-destructive/20 rounded-full text-sm font-semibold"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Chronic Conditions */}
          {profile?.chronic_conditions && profile.chronic_conditions.length > 0 && (
            <div className="healthcare-card alert-warning border">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4" />
                <span className="font-semibold text-sm">CONDITIONS</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.chronic_conditions.map((condition, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-warning/20 rounded-full text-sm font-semibold"
                  >
                    {condition}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {profile?.emergency_contact && (
            <a 
              href={`tel:${profile.emergency_contact}`}
              className="healthcare-card flex items-center gap-4 bg-primary/5 border-primary/30 hover:bg-primary/10 transition-colors"
            >
              <div className="p-3 bg-primary/10 rounded-xl">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Emergency Contact {profile.emergency_contact_name && `(${profile.emergency_contact_name})`}
                </p>
                <p className="font-bold text-lg text-primary">{profile.emergency_contact}</p>
              </div>
            </a>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground text-center">
            🔒 This QR provides <strong>time-limited, read-only</strong> access to critical medical 
            information. Doctors can view and add prescriptions only.
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
