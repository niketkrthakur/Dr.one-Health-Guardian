import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { useMedicationReminders } from "@/hooks/useMedicationReminders";

interface AddReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FREQUENCIES = [
  { value: "once_daily", label: "Once daily" },
  { value: "twice_daily", label: "Twice daily" },
  { value: "three_times_daily", label: "Three times daily" },
  { value: "four_times_daily", label: "Four times daily" },
  { value: "weekly", label: "Weekly" },
  { value: "as_needed", label: "As needed" },
];

const AddReminderDialog = ({ open, onOpenChange }: AddReminderDialogProps) => {
  const { addReminder } = useMedicationReminders();
  
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [reminderTimes, setReminderTimes] = useState<string[]>(["08:00"]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTime = () => {
    setReminderTimes([...reminderTimes, "12:00"]);
  };

  const removeTime = (index: number) => {
    setReminderTimes(reminderTimes.filter((_, i) => i !== index));
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...reminderTimes];
    newTimes[index] = value;
    setReminderTimes(newTimes);
  };

  const resetForm = () => {
    setMedicationName("");
    setDosage("");
    setFrequency("");
    setReminderTimes(["08:00"]);
    setStartDate("");
    setEndDate("");
  };

  const handleSubmit = async () => {
    if (!medicationName || !frequency || reminderTimes.length === 0) return;

    setIsSubmitting(true);
    const { error } = await addReminder({
      medication_name: medicationName,
      dosage: dosage || undefined,
      frequency,
      reminder_times: reminderTimes,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    });

    setIsSubmitting(false);
    if (!error) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Medication Reminder</DialogTitle>
          <DialogDescription>
            Set up alerts to remind you when to take your medication
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medication">Medication Name *</Label>
            <Input
              id="medication"
              placeholder="e.g., Metformin, Aspirin"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dosage">Dosage</Label>
            <Input
              id="dosage"
              placeholder="e.g., 500mg, 1 tablet"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Frequency *</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="How often?" />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reminder Times *</Label>
            <div className="space-y-2">
              {reminderTimes.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => updateTime(index, e.target.value)}
                    className="flex-1"
                  />
                  {reminderTimes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTime(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTime}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Time
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">
              ⏰ You'll receive in-app notifications at the specified times. 
              Email/SMS alerts can be enabled in your profile settings.
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!medicationName || !frequency || reminderTimes.length === 0 || isSubmitting}
            className="w-full gradient-primary"
          >
            {isSubmitting ? "Creating..." : "Create Reminder"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddReminderDialog;
