import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface MedicationReminder {
  id: string;
  patient_id: string;
  prescription_id: string | null;
  medication_name: string;
  dosage: string | null;
  frequency: string;
  reminder_times: string[];
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useMedicationReminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user]);

  const fetchReminders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("medication_reminders")
      .select("*")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reminders:", error);
    } else {
      setReminders((data as MedicationReminder[]) || []);
    }
    setLoading(false);
  };

  const addReminder = async (reminder: {
    medication_name: string;
    dosage?: string;
    frequency: string;
    reminder_times: string[];
    start_date?: string;
    end_date?: string;
    prescription_id?: string;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase.from("medication_reminders").insert({
      patient_id: user.id,
      medication_name: reminder.medication_name,
      dosage: reminder.dosage,
      frequency: reminder.frequency,
      reminder_times: reminder.reminder_times,
      start_date: reminder.start_date || new Date().toISOString().split("T")[0],
      end_date: reminder.end_date,
      prescription_id: reminder.prescription_id,
    });

    if (error) {
      toast.error("Failed to create reminder");
      return { error };
    }

    toast.success("Reminder created successfully");
    await fetchReminders();
    return { error: null };
  };

  const updateReminder = async (id: string, updates: Partial<MedicationReminder>) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("medication_reminders")
      .update(updates)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update reminder");
      return { error };
    }

    await fetchReminders();
    return { error: null };
  };

  const deleteReminder = async (id: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("medication_reminders")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete reminder");
      return { error };
    }

    toast.success("Reminder deleted");
    await fetchReminders();
    return { error: null };
  };

  const toggleReminder = async (id: string, isActive: boolean) => {
    return updateReminder(id, { is_active: isActive });
  };

  return {
    reminders,
    loading,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminder,
    refetch: fetchReminders,
  };
};
