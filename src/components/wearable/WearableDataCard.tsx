import { Activity, Heart, Thermometer, Wind, Watch, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WearableReading, useWearableData } from "@/hooks/useWearableData";
import SafetyDisclaimer from "@/components/shared/SafetyDisclaimer";
import { cn } from "@/lib/utils";

const iconMap: Record<string, typeof Heart> = {
  heart_rate: Heart,
  blood_pressure: Activity,
  spo2: Wind,
  temperature: Thermometer,
};

const statusColor: Record<string, string> = {
  normal: "text-success",
  elevated: "text-warning",
  low: "text-warning",
  unavailable: "text-muted-foreground",
};

interface WearableDataCardProps {
  patientId?: string;
  compact?: boolean;
}

const WearableDataCard = ({ patientId, compact = false }: WearableDataCardProps) => {
  const { readings, connected, lastSynced, connectDevice, disconnect } =
    useWearableData(patientId);

  if (!connected && compact) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="healthcare-card border border-accent/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Watch className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">Wearable Vitals</h4>
            {connected && (
              <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full font-medium">
                Connected
              </span>
            )}
          </div>
          {lastSynced && (
            <span className="text-xs text-muted-foreground">
              Synced {new Date(lastSynced).toLocaleTimeString()}
            </span>
          )}
        </div>

        {connected && readings.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {readings.map((reading: WearableReading) => {
              const Icon = iconMap[reading.type] || Activity;
              return (
                <div
                  key={reading.type}
                  className="p-3 bg-muted/50 rounded-xl"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={cn("h-3.5 w-3.5", statusColor[reading.status])} />
                    <span className="text-xs text-muted-foreground">{reading.label}</span>
                  </div>
                  <p className="font-bold text-lg">
                    {reading.value}
                    <span className="text-xs text-muted-foreground ml-1 font-normal">
                      {reading.unit}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <WifiOff className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">
              No wearable device connected
            </p>
            <Button size="sm" variant="outline" onClick={connectDevice}>
              <Watch className="h-4 w-4 mr-1" />
              Connect Device
            </Button>
          </div>
        )}

        {connected && (
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-2 text-xs"
            onClick={disconnect}
          >
            Disconnect Device
          </Button>
        )}
      </div>

      {connected && <SafetyDisclaimer variant="wearable" />}
    </div>
  );
};

export default WearableDataCard;
