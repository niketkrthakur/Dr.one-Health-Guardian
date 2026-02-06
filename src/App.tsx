import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ProtectedRoute from "@/components/routing/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import Profile from "./pages/Profile";
import Records from "./pages/Records";
import Reminders from "./pages/Reminders";
import AISummary from "./pages/AISummary";
import EmergencyQR from "./pages/EmergencyQR";
import DoctorAccess from "./pages/DoctorAccess";
import DoctorFinder from "./pages/DoctorFinder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Patient-only routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requiredRole="patient">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/records" 
              element={
                <ProtectedRoute requiredRole="patient">
                  <Records />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/prescriptions" 
              element={
                <ProtectedRoute requiredRole="patient">
                  <Records />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-summary" 
              element={
                <ProtectedRoute requiredRole="patient">
                  <AISummary />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/emergency" 
              element={
                <ProtectedRoute requiredRole="patient">
                  <EmergencyQR />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute requiredRole="patient">
                  <Records />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reminders" 
              element={
                <ProtectedRoute requiredRole="patient">
                  <Reminders />
                </ProtectedRoute>
              } 
            />
            
            {/* Doctor-only routes */}
            <Route 
              path="/doctor-dashboard" 
              element={
                <ProtectedRoute requiredRole="doctor">
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/doctor-access" 
              element={
                <ProtectedRoute requiredRole="doctor">
                  <DoctorAccess />
                </ProtectedRoute>
              } 
            />
            
            {/* Shared routes */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/doctor-finder" 
              element={
                <ProtectedRoute>
                  <DoctorFinder />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
