import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useAccessToken = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const generateToken = async (expiresInMinutes: number = 30) => {
    if (!user) return { error: new Error("Not authenticated"), token: null };

    setLoading(true);
    
    // Generate a random token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();

    const { error } = await supabase.from("access_tokens").insert({
      patient_id: user.id,
      token,
      expires_at: expiresAt
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to generate access token");
      return { error, token: null };
    }

    return { error: null, token, expiresAt };
  };

  const validateToken = async (token: string) => {
    const { data, error } = await supabase
      .from("access_tokens")
      .select("*, profiles:patient_id(*)") 
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (error || !data) {
      return { valid: false, patientId: null };
    }

    return { 
      valid: true, 
      patientId: data.patient_id,
      expiresAt: data.expires_at
    };
  };

  const useToken = async (token: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("access_tokens")
      .update({
        used_by: user.id,
        used_at: new Date().toISOString()
      })
      .eq("token", token);

    return { error };
  };

  return {
    generateToken,
    validateToken,
    useToken,
    loading
  };
};
