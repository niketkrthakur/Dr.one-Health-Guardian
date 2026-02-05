import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface MedicalRecord {
  id: string;
  patient_id: string;
  recorded_by: string | null;
  record_type: string;
  title: string;
  description: string | null;
  date_recorded: string;
  attachments: string[];
  created_at: string;
}

export const useMedicalHistory = (patientId?: string) => {
  const { user, userRole } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user, patientId]);

  const fetchRecords = async () => {
    if (!user) return;

    let query = supabase
      .from("medical_history")
      .select("*")
      .order("date_recorded", { ascending: false });

    if (patientId) {
      query = query.eq("patient_id", patientId);
    } else if (userRole === "patient") {
      query = query.eq("patient_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching medical history:", error);
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  const addRecord = async (record: {
    record_type: string;
    title: string;
    description?: string;
    date_recorded?: string;
    patient_id?: string;
    attachments?: string[];
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    const targetPatientId = record.patient_id || user.id;

    const { error } = await supabase.from("medical_history").insert({
      patient_id: targetPatientId,
      recorded_by: user.id,
      record_type: record.record_type,
      title: record.title,
      description: record.description,
      date_recorded: record.date_recorded || new Date().toISOString().split("T")[0],
      attachments: record.attachments || []
    });

    if (error) {
      toast.error("Failed to add record");
      return { error };
    }

    toast.success("Record added successfully");
    await fetchRecords();
    return { error: null };
  };

  return {
    records,
    loading,
    addRecord,
    refetch: fetchRecords
  };
};
