import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Clock, Plus, Pill, Trash2, Bell, BellOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMedicationReminders } from "@/hooks/useMedicationReminders";
import { useRefillRequests } from "@/hooks/useRefillRequests";
import AddReminderDialog from "@/components/reminders/AddReminderDialog";
import RefillRequestDialog from "@/components/refills/RefillRequestDialog";
import { cn } from "@/lib/utils";

const Reminders = () => {
  const { reminders, loading: remindersLoading, toggleReminder, deleteReminder } = useMedicationReminders();
  const { requests, loading: requestsLoading } = useRefillRequests();
  
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showRefillRequest, setShowRefillRequest] = useState(false);

  const loading = remindersLoading || requestsLoading;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-success bg-success/10";
      case "denied":
        return "text-destructive bg-destructive/10";
      default:
        return "text-warning bg-warning/10";
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      once_daily: "Once daily",
      twice_daily: "Twice daily",
      three_times_daily: "3x daily",
      four_times_daily: "4x daily",
      weekly: "Weekly",
      as_needed: "As needed",
    };
    return labels[frequency] || frequency;
  };

  if (loading) {
    return (
      <AppLayout title="Reminders">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Medication Reminders">
      <div className="space-y-6 animate-fade-in">
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setShowAddReminder(true)}
            className="flex items-center gap-2 gradient-primary"
          >
            <Clock className="h-4 w-4" />
            Add Reminder
          </Button>
          <Button
            onClick={() => setShowRefillRequest(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Request Refill
          </Button>
        </div>

        <Tabs defaultValue="reminders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
            <TabsTrigger value="refills">Refill Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="reminders" className="space-y-4 mt-4">
            {reminders.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No medication reminders</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add a reminder to never miss your medication
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={cn(
                      "healthcare-card",
                      !reminder.is_active && "opacity-60"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={cn(
                          "p-2 rounded-full",
                          reminder.is_active ? "bg-primary/10" : "bg-muted"
                        )}>
                          <Pill className={cn(
                            "h-5 w-5",
                            reminder.is_active ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{reminder.medication_name}</h4>
                          {reminder.dosage && (
                            <p className="text-sm text-muted-foreground">{reminder.dosage}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs px-2 py-0.5 bg-secondary/10 text-secondary rounded-full">
                              {getFrequencyLabel(reminder.frequency)}
                            </span>
                            {reminder.reminder_times.map((time, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                              >
                                {time}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Switch
                          checked={reminder.is_active}
                          onCheckedChange={(checked) => toggleReminder(reminder.id, checked)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteReminder(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="refills" className="space-y-4 mt-4">
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No refill requests</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Request a prescription refill when you're running low
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div key={request.id} className="healthcare-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{request.medication_name}</h4>
                        {request.request_notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {request.request_notes}
                          </p>
                        )}
                        {request.doctor_response && (
                          <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground font-medium">
                              Doctor's response:
                            </p>
                            <p className="text-sm">{request.doctor_response}</p>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full capitalize font-medium",
                        getStatusColor(request.status)
                      )}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Note */}
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground text-center">
            ⏰ In-app notifications will alert you at your specified times. 
            For email/SMS alerts, contact your healthcare provider.
          </p>
        </div>
      </div>

      <AddReminderDialog
        open={showAddReminder}
        onOpenChange={setShowAddReminder}
      />

      <RefillRequestDialog
        open={showRefillRequest}
        onOpenChange={setShowRefillRequest}
      />
    </AppLayout>
  );
};

export default Reminders;
