import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import QuickAccessCard from "@/components/dashboard/QuickAccessCard";
import RefillRequestsManager from "@/components/doctor/RefillRequestsManager";
import { 
  User, 
  QrCode, 
  Stethoscope, 
  LogOut,
  Brain,
  ClipboardList,
  Shield,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import QRScannerDialog from "@/components/doctor/QRScannerDialog";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { signOut, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [showScanner, setShowScanner] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || profileLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Doctor Welcome Card */}
        <div className="healthcare-card bg-primary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome, Dr. {profile?.name || "Doctor"}</h2>
              <p className="text-muted-foreground">Medical Staff Portal</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="healthcare-card">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            How to Access Patient Records
          </h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">1</span>
              <span>Ask the patient to show their Emergency QR code from the Dr.One app</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">2</span>
              <span>Scan the QR code with your device camera or receive the shared link</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">3</span>
              <span>View AI summary, patient history, and add prescriptions as needed</span>
            </li>
          </ol>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Quick Actions
          </h3>
          
          <div 
            onClick={() => setShowScanner(true)}
            className="healthcare-card p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-primary/20 hover:border-primary/40 bg-primary/5"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">Scan Patient QR</h3>
                <p className="text-sm text-muted-foreground">
                  Use camera to scan QR code
                </p>
              </div>
              <QrCode className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          
          <QuickAccessCard
            icon={User}
            title="My Profile"
            description="Update your doctor profile"
            path="/profile"
          />
        </div>

        {/* Refill Requests */}
        <RefillRequestsManager />

        {/* Doctor Permissions Notice */}
        <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Doctor Access Permissions</h4>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>✓ View AI medical summary</li>
                <li>✓ View patient allergies, conditions, history</li>
                <li>✓ Add new prescriptions (with conflict detection)</li>
                <li>✗ Cannot edit patient profile or allergies</li>
                <li>✗ Cannot modify or delete existing records</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>

        {/* AI Disclaimer */}
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-primary mt-0.5" />
            <p className="text-xs">
              <strong>AI Disclaimer:</strong> AI insights are assistive only. 
              Final medical decisions remain with qualified healthcare professionals.
            </p>
          </div>
        </div>
      </div>

      <QRScannerDialog
        open={showScanner}
        onOpenChange={setShowScanner}
      />
    </AppLayout>
  );
};

export default DoctorDashboard;
