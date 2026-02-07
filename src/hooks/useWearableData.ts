/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";

export interface WearableReading {
  type: "heart_rate" | "blood_pressure" | "spo2" | "temperature" | "steps";
  label: string;
  value: string;
  unit: string;
  timestamp: string;
  status: "normal" | "elevated" | "low" | "unavailable";
}

export interface ConnectedDevice {
  id: string;
  name: string;
  connected: boolean;
  paused: boolean;
}

/**
 * Hook to manage real wearable device connections via Web Bluetooth API.
 * Collects physiological data directly from connected devices.
 *
 * IMPORTANT: Wearable data is strictly advisory and must not be used for
 * diagnosis, prediction, or autonomous medical decisions.
 */
export const useWearableData = (patientId?: string) => {
  const [readings, setReadings] = useState<WearableReading[]>([]);
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [collecting, setCollecting] = useState(false);
  const [bluetoothSupported, setBluetoothSupported] = useState(false);
  const [scanning, setScanning] = useState(false);

  const cacheKey = `wearable_real_${patientId || "self"}`;

  // Check Web Bluetooth availability
  useEffect(() => {
    const supported = typeof navigator !== "undefined" && "bluetooth" in navigator;
    setBluetoothSupported(supported);
  }, []);

  // Restore cached real device data
  useEffect(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.readings) setReadings(parsed.readings);
        if (parsed.devices) setDevices(parsed.devices);
        if (parsed.lastSynced) setLastSynced(parsed.lastSynced);
        if (parsed.collecting) setCollecting(parsed.collecting);
      }
    } catch {
      // Invalid cache, ignore
    }
  }, [cacheKey]);

  const persistState = useCallback(
    (
      newReadings: WearableReading[],
      newDevices: ConnectedDevice[],
      synced: string | null,
      isCollecting: boolean
    ) => {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          readings: newReadings,
          devices: newDevices,
          lastSynced: synced,
          collecting: isCollecting,
        })
      );
    },
    [cacheKey]
  );

  /**
   * Scan for nearby Bluetooth Low Energy (BLE) wearable devices.
   * Requests the Heart Rate service by default; additional services
   * can be negotiated post-connection.
   */
  const scanForDevices = useCallback(async (): Promise<any | null> => {
    if (!bluetoothSupported) return null;

    setScanning(true);
    try {
      const bt = (navigator as any).bluetooth;
      const device = await bt.requestDevice({
        filters: [{ services: ["heart_rate"] }],
        optionalServices: [
          "battery_service",
          "health_thermometer",
          "environmental_sensing",
        ],
      });
      setScanning(false);
      return device;
    } catch (err) {
      setScanning(false);
      console.info("Bluetooth scan cancelled or failed:", err);
      return null;
    }
  }, [bluetoothSupported]);

  /**
   * Connect to a real BLE wearable, read its Heart Rate characteristic,
   * and populate readings from real sensor data.
   */
  const connectDevice = useCallback(async () => {
    const device = await scanForDevices();
    if (!device || !device.gatt) return false;

    try {
      const server = await device.gatt.connect();

      const now = new Date().toISOString();
      const newDevice: ConnectedDevice = {
        id: device.id,
        name: device.name || "Unknown Device",
        connected: true,
        paused: false,
      };

      const newReadings: WearableReading[] = [];

      // Attempt Heart Rate
      try {
        const hrService = await server.getPrimaryService("heart_rate");
        const hrChar = await hrService.getCharacteristic(
          "heart_rate_measurement"
        );
        const hrValue = await hrChar.readValue();
        // Heart Rate format flag is in the first byte
        const flags = hrValue.getUint8(0);
        const hr =
          flags & 0x01
            ? hrValue.getUint16(1, true)
            : hrValue.getUint8(1);

        newReadings.push({
          type: "heart_rate",
          label: "Heart Rate",
          value: String(hr),
          unit: "bpm",
          timestamp: now,
          status: hr > 100 ? "elevated" : hr < 50 ? "low" : "normal",
        });
      } catch {
        // Heart rate not available on this device
      }

      // Attempt Health Thermometer
      try {
        const tempService = await server.getPrimaryService(
          "health_thermometer"
        );
        const tempChar = await tempService.getCharacteristic(
          "temperature_measurement"
        );
        const tempValue = await tempChar.readValue();
        const tempRaw = tempValue.getUint32(1, true);
        const tempC = tempRaw / 100;

        newReadings.push({
          type: "temperature",
          label: "Body Temp",
          value: tempC.toFixed(1),
          unit: "°C",
          timestamp: now,
          status: tempC > 37.5 ? "elevated" : tempC < 35.5 ? "low" : "normal",
        });
      } catch {
        // Thermometer not available
      }

      // Attempt Battery level (as a proxy health indicator)
      try {
        const battService = await server.getPrimaryService("battery_service");
        const battChar = await battService.getCharacteristic("battery_level");
        const battValue = await battChar.readValue();
        const battLevel = battValue.getUint8(0);

        // We don't push battery as a vital but log it
        console.info(`Device battery: ${battLevel}%`);
      } catch {
        // Battery service not available
      }

      const updatedDevices = [
        ...devices.filter((d) => d.id !== device.id),
        newDevice,
      ];

      setDevices(updatedDevices);
      setReadings(newReadings);
      setLastSynced(now);
      setCollecting(true);
      persistState(newReadings, updatedDevices, now, true);

      return true;
    } catch (err) {
      console.error("Failed to connect to wearable:", err);
      return false;
    }
  }, [scanForDevices, devices, persistState]);

  /**
   * Disconnect a specific device.
   */
  const disconnectDevice = useCallback(
    (deviceId: string) => {
      const updatedDevices = devices.filter((d) => d.id !== deviceId);
      const hasConnected = updatedDevices.some((d) => d.connected);

      setDevices(updatedDevices);
      if (!hasConnected) {
        setReadings([]);
        setLastSynced(null);
        setCollecting(false);
      }
      persistState(
        hasConnected ? readings : [],
        updatedDevices,
        hasConnected ? lastSynced : null,
        hasConnected
      );
    },
    [devices, readings, lastSynced, persistState]
  );

  /**
   * Disconnect all devices and clear all data.
   */
  const disconnectAll = useCallback(() => {
    setDevices([]);
    setReadings([]);
    setLastSynced(null);
    setCollecting(false);
    localStorage.removeItem(cacheKey);
  }, [cacheKey]);

  /**
   * Pause data collection for a specific device.
   */
  const pauseDevice = useCallback(
    (deviceId: string) => {
      const updated = devices.map((d) =>
        d.id === deviceId ? { ...d, paused: true } : d
      );
      setDevices(updated);
      persistState(readings, updated, lastSynced, collecting);
    },
    [devices, readings, lastSynced, collecting, persistState]
  );

  /**
   * Resume data collection for a paused device.
   */
  const resumeDevice = useCallback(
    (deviceId: string) => {
      const updated = devices.map((d) =>
        d.id === deviceId ? { ...d, paused: false } : d
      );
      setDevices(updated);
      persistState(readings, updated, lastSynced, collecting);
    },
    [devices, readings, lastSynced, collecting, persistState]
  );

  const connected = devices.some((d) => d.connected);

  return {
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
  };
};
