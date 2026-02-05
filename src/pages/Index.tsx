import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Heart, Brain, Lock } from "lucide-react";
import logo from "@/assets/logo.png";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on role
      if (userRole === "doctor") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, userRole, loading, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="animate-fade-in text-center max-w-md mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src={logo} 
              alt="Dr.One Logo" 
              className="w-48 h-48 mx-auto animate-scale-in drop-shadow-xl"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Dr.One</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            AI-Powered Health Records & Safety
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="healthcare-card p-4 text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Secure & Private</p>
            </div>
            <div className="healthcare-card p-4 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <p className="text-sm font-medium">Emergency Ready</p>
            </div>
            <div className="healthcare-card p-4 text-center">
              <Brain className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <p className="text-sm font-medium">AI-Powered</p>
            </div>
            <div className="healthcare-card p-4 text-center">
              <Lock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">You Own Your Data</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/auth")}
              className="w-full py-6 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity"
            >
              Get Started
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <button 
                onClick={() => navigate("/auth")}
                className="text-primary font-medium hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="px-6 pb-4">
        <div className="bg-muted/50 rounded-xl p-4 max-w-md mx-auto">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Patient Safety First:</strong> Dr.One is designed for healthcare use 
            with strict privacy controls. AI features are assistive only.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
