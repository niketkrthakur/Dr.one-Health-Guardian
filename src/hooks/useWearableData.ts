import { useState, useEffect } from "react";

export interface WearableReading {
  type: "heart_rate" | "blood_pressure" | "spo2" | "temperature" | "steps";
  label: string;
  value: string;
  unit: string;
  timestamp: string;
  status: "normal" | "elevated" | "low" | "unavailable";
}

/**
 * Hook to provide wearable-derived physiological data as contextual safety signals.
 * Currently uses locally cached / simulated data.
 * In production, this would integrate with wearable device APIs (Apple Health, Google Fit, etc.).
 * 
 * IMPORTANT: Wearable data is strictly advisory and must not be used for
 * diagnosis, prediction, or autonomous medical decisions.
 */
export const useWearableData = (patientId?: string) => {
  const [readings, setReadings] = useState<WearableReading[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to load cached wearable data from localStorage
    const cacheKey = `wearable_data_${patientId || "self"}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setReadings(parsed.readings || []);
        setConnected(parsed.connected || false);
        setLastSynced(parsed.lastSynced || null);
      } catch {
        // Invalid cache, ignore
      }
    }
  }, [patientId]);

  const simulateReadings = (): WearableReading[] => {
    const now = new Date().toISOString();
    return [
      {
        type: "heart_rate",
        label: "Heart Rate",
        value: "72",
        unit: "bpm",
        timestamp: now,
        status: "normal",
      },
      {
        type: "blood_pressure",
        label: "Blood Pressure",
        value: "120/80",
        unit: "mmHg",
        timestamp: now,
        status: "normal",
      },
      {
        type: "spo2",
        label: "SpO₂",
        value: "98",
        unit: "%",
        timestamp: now,
        status: "normal",
      },
      {
        type: "temperature",
        label: "Body Temp",
        value: "36.6",
        unit: "°C",
        timestamp: now,
        status: "normal",
      },
    ];
  };

  const connectDevice = () => {
    // Simulate connecting a wearable device
    const simulated = simulateReadings();
    const now = new Date().toISOString();
    const cacheKey = `wearable_data_${patientId || "self"}`;

    setReadings(simulated);
    setConnected(true);
    setLastSynced(now);

    localStorage.setItem(cacheKey, JSON.stringify({
      readings: simulated,
      connected: true,
      lastSynced: now,
    }));
  };

  const disconnect = () => {
    setConnected(false);
    setReadings([]);
    setLastSynced(null);
    const cacheKey = `wearable_data_${patientId || "self"}`;
    localStorage.removeItem(cacheKey);
  };

  return {
    readings,
    connected,
    lastSynced,
    connectDevice,
    disconnect,
  };
};
