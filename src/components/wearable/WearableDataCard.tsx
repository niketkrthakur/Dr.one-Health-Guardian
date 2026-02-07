import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Watch,
  WifiOff,
  Bluetooth,
  BluetoothOff,
  Pause,
  Play,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWearableData, WearableReading } from "@/hooks/useWearableData";
import SafetyDisclaimer from "@/components/shared/SafetyDisclaimer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const {
    readings,
    devices,
    connected,
    collecting,
    lastSynced,
    bluetoothSupported,
    scanning,
    connectDevice,
    disconnectDevice,
    disconnectAll,
    pauseDevice,
    resumeDevice,
  } = useWearableData(patientId);

  if (!connected && compact) {
    return null;
  }

  const handleConnect = async () => {
    if (!bluetoothSupported) {
      toast.error(
        "Web Bluetooth is not supported in this browser. Please use Chrome or Edge on a compatible device."
      );
      return;
    }
    const success = await connectDevice();
    if (success) {
      toast.success("Wearable device connected successfully");
    } else {
      toast.info("No device selected or connection failed.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="healthcare-card border border-accent/50">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Watch className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm">Wearable-Derived Data</h4>
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

        {/* Readings from real device */}
        {connected && readings.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {readings.map((reading: WearableReading) => {
              const Icon = iconMap[reading.type] || Activity;
              return (
                <div key={reading.type} className="p-3 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={cn("h-3.5 w-3.5", statusColor[reading.status])} />
                    <span className="text-xs text-muted-foreground">
                      {reading.label}
                    </span>
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
        ) : connected && readings.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Device connected but no sensor data available yet.
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            {bluetoothSupported ? (
              <>
                <Bluetooth className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  No wearable device connected
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Scan for a nearby BLE wearable to begin real-time data collection.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleConnect}
                  disabled={scanning}
                >
                  {scanning ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1.5" />
                      Scanning…
                    </>
                  ) : (
                    <>
                      <Bluetooth className="h-4 w-4 mr-1" />
                      Scan &amp; Connect Device
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <BluetoothOff className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  Bluetooth Not Supported
                </p>
                <p className="text-xs text-muted-foreground">
                  Web Bluetooth is required to connect wearable devices. Please use a
                  supported browser (Chrome or Edge) on a compatible device.
                </p>
              </>
            )}
          </div>
        )}

        {/* Connected device list with controls */}
        {devices.length > 0 && (
          <div className="mt-3 space-y-2">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Connected Devices
            </h5>
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Watch className="h-3.5 w-3.5 text-primary" />
                  <span className="text-sm font-medium">{device.name}</span>
                  {device.paused && (
                    <span className="text-xs text-warning">(Paused)</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {device.paused ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => resumeDevice(device.id)}
                      title="Resume data collection"
                    >
                      <Play className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => pauseDevice(device.id)}
                      title="Pause data collection"
                    >
                      <Pause className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => disconnectDevice(device.id)}
                    title="Disconnect device"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}

            {devices.length > 1 && (
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-xs text-destructive"
                onClick={disconnectAll}
              >
                Disconnect All Devices
              </Button>
            )}
          </div>
        )}

        {/* Single disconnect for one device */}
        {connected && devices.length === 1 && (
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-2 text-xs"
            onClick={disconnectAll}
          >
            Disconnect Device
          </Button>
        )}

        {/* Scan another device */}
        {connected && bluetoothSupported && (
          <Button
            size="sm"
            variant="outline"
            className="w-full mt-2 text-xs"
            onClick={handleConnect}
            disabled={scanning}
          >
            <Bluetooth className="h-3.5 w-3.5 mr-1" />
            Connect Another Device
          </Button>
        )}
      </div>

      {/* Wearable disclaimer — always shown when connected */}
      {connected && <SafetyDisclaimer variant="wearable" />}
    </div>
  );
};

export default WearableDataCard;
