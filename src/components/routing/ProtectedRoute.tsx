import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "patient" | "doctor";
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole,
  redirectTo = "/auth" 
}: ProtectedRouteProps) => {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on actual role
    const dashboardPath = userRole === "doctor" ? "/doctor-dashboard" : "/dashboard";
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
