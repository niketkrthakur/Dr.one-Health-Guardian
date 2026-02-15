import AppLayout from "@/components/layout/AppLayout";
import WearableDataCard from "@/components/wearable/WearableDataCard";
import SafetyDisclaimer from "@/components/shared/SafetyDisclaimer";
import { Watch } from "lucide-react";

const WearableDevices = () => {
  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Watch className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Wearable Devices</h1>
            <p className="text-sm text-muted-foreground">
              Connect and manage your health devices
            </p>
          </div>
        </div>

        {/* Full Wearable Card with device management */}
        <WearableDataCard />

        {/* Info Section */}
        <div className="healthcare-card space-y-3">
          <h3 className="font-semibold text-sm">How It Works</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">1</span>
              <span>Tap "Scan & Connect Device" to discover nearby Bluetooth wearables</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">2</span>
              <span>Select your device from the list and grant permission</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">3</span>
              <span>Real-time physiological data will appear once connected</span>
            </li>
          </ol>
          <p className="text-xs text-muted-foreground border-t border-border/50 pt-3">
            Supported data: Heart Rate, Body Temperature, SpO₂ (device-dependent).
            Only real device data is collected — no mock or simulated readings.
          </p>
        </div>

        {/* Safety Disclaimer */}
        <SafetyDisclaimer variant="wearable" />
      </div>
    </AppLayout>
  );
};

export default WearableDevices;
