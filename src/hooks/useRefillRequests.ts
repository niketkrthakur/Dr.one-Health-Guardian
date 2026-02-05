import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface RefillRequest {
  id: string;
  patient_id: string;
  prescription_id: string | null;
  medication_name: string;
  status: "pending" | "approved" | "denied";
  request_notes: string | null;
  doctor_response: string | null;
  doctor_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useRefillRequests = () => {
  const { user, userRole } = useAuth();
  const [requests, setRequests] = useState<RefillRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user, userRole]);

  const fetchRequests = async () => {
    if (!user) return;

    let query = supabase
      .from("refill_requests")
      .select("*")
      .order("created_at", { ascending: false });

    // Patients see their own, doctors see all
    if (userRole === "patient") {
      query = query.eq("patient_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching refill requests:", error);
    } else {
      setRequests((data as RefillRequest[]) || []);
    }
    setLoading(false);
  };

  const createRequest = async (request: {
    medication_name: string;
    prescription_id?: string;
    request_notes?: string;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase.from("refill_requests").insert({
      patient_id: user.id,
      medication_name: request.medication_name,
      prescription_id: request.prescription_id,
      request_notes: request.request_notes,
    });

    if (error) {
      toast.error("Failed to submit refill request");
      return { error };
    }

    toast.success("Refill request submitted");
    await fetchRequests();
    return { error: null };
  };

  const respondToRequest = async (
    id: string,
    status: "approved" | "denied",
    response?: string
  ) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("refill_requests")
      .update({
        status,
        doctor_response: response,
        doctor_id: user.id,
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update request");
      return { error };
    }

    toast.success(`Request ${status}`);
    await fetchRequests();
    return { error: null };
  };

  return {
    requests,
    loading,
    createRequest,
    respondToRequest,
    refetch: fetchRequests,
  };
};
