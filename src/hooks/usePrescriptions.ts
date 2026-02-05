import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  title: string;
  description: string | null;
  medications: unknown;
  file_url: string | null;
  file_type: string | null;
  is_verified: boolean;
  upload_source: string;
  created_at: string;
  updated_at: string;
}

export const usePrescriptions = (patientId?: string) => {
  const { user, userRole } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPrescriptions();
    }
  }, [user, patientId]);

  const fetchPrescriptions = async () => {
    if (!user) return;

    let query = supabase
      .from("prescriptions")
      .select("*")
      .order("created_at", { ascending: false });

    if (patientId) {
      query = query.eq("patient_id", patientId);
    } else if (userRole === "patient") {
      query = query.eq("patient_id", user.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching prescriptions:", error);
    } else {
      setPrescriptions(data || []);
    }
    setLoading(false);
  };

  const addPrescription = async (prescription: {
    title: string;
    description?: string;
    medications?: any[];
    file_url?: string;
    file_type?: string;
    patient_id?: string;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    const isDoctor = userRole === "doctor";
    const targetPatientId = prescription.patient_id || user.id;

    const { error } = await supabase.from("prescriptions").insert({
      patient_id: targetPatientId,
      doctor_id: isDoctor ? user.id : null,
      title: prescription.title,
      description: prescription.description,
      medications: prescription.medications || [],
      file_url: prescription.file_url,
      file_type: prescription.file_type,
      is_verified: isDoctor,
      upload_source: isDoctor ? "doctor" : "user"
    });

    if (error) {
      toast.error("Failed to add prescription");
      return { error };
    }

    toast.success("Prescription added successfully");
    await fetchPrescriptions();
    return { error: null };
  };

  const uploadPrescriptionFile = async (file: File) => {
    if (!user) return { error: new Error("Not authenticated"), url: null };

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("prescriptions")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Failed to upload file");
      return { error: uploadError, url: null };
    }

    const { data: { publicUrl } } = supabase.storage
      .from("prescriptions")
      .getPublicUrl(filePath);

    return { error: null, url: publicUrl, fileType: file.type };
  };

  return {
    prescriptions,
    loading,
    addPrescription,
    uploadPrescriptionFile,
    refetch: fetchPrescriptions
  };
};
