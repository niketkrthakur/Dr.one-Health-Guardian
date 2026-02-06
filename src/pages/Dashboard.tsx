import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import PatientCard from "@/components/dashboard/PatientCard";
import QuickAccessCard from "@/components/dashboard/QuickAccessCard";
import AlertBanner from "@/components/dashboard/AlertBanner";
import { User, FileText, Pill, Brain, QrCode, Camera, Stethoscope, LogOut, Search } from "lucide-react";
import SafetyDisclaimer from "@/components/shared/SafetyDisclaimer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userRole, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

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

  // Doctor Dashboard
  if (userRole === "doctor") {
    return (
      <AppLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Doctor Welcome */}
          <div className="healthcare-card bg-primary/5 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Stethoscope className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Welcome, Dr. {profile?.name || "Doctor"}</h2>
                <p className="text-muted-foreground">Medical Staff Access</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="healthcare-card">
            <h3 className="font-semibold mb-3">How to Access Patient Records</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">1</span>
                <span>Ask the patient to show their Emergency QR code</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">2</span>
                <span>Scan the QR code with your phone camera or use the shared link</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">3</span>
                <span>View patient info and add prescriptions as needed</span>
              </li>
            </ol>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Quick Actions
            </h3>
            
            <QuickAccessCard
              icon={User}
              title="My Profile"
              description="Update your information"
              path="/profile"
            />
            
            <QuickAccessCard
              icon={QrCode}
              title="Scan Patient QR"
              description="Access patient records via QR code"
              path="#"
              variant="primary"
            />
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
          <SafetyDisclaimer variant="ai" />
        </div>
      </AppLayout>
    );
  }

  // Patient Dashboard
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Patient Card */}
        <PatientCard
          name={profile?.name || "Set up your profile"}
          age={profile?.age || undefined}
          gender={profile?.gender || undefined}
          bloodGroup={profile?.blood_group || undefined}
          allergies={profile?.allergies || []}
        />

        {/* Critical Alerts */}
        {profile?.allergies && profile.allergies.length > 0 && (
          <AlertBanner
            type="critical"
            title="Known Allergies"
            message={profile.allergies.join(", ")}
          />
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Quick Access
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            <QuickAccessCard
              icon={User}
              title="My Profile"
              description="View and update your health information"
              path="/profile"
            />
            
            <QuickAccessCard
              icon={FileText}
              title="Medical Records"
              description="View your complete medical timeline"
              path="/records"
            />
            
            <QuickAccessCard
              icon={Pill}
              title="My Prescriptions"
              description="Active and past prescriptions"
              path="/prescriptions"
            />
            
            <QuickAccessCard
              icon={Brain}
              title="AI Medical Summary"
              description="Quick overview for medical staff"
              path="/ai-summary"
              variant="primary"
            />
            
            <QuickAccessCard
              icon={Camera}
              title="Upload Prescription"
              description="Scan or upload prescription documents"
              path="/upload"
            />
            
            <QuickAccessCard
              icon={QrCode}
              title="Emergency QR Code"
              description="Share critical info with medical staff"
              path="/emergency"
              variant="emergency"
            />
            
            <QuickAccessCard
              icon={Search}
              title="Find a Doctor"
              description="Healthcare navigation by condition"
              path="/doctor-finder"
            />
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
        <SafetyDisclaimer variant="ai" />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
