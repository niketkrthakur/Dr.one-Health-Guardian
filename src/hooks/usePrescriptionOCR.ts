import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ExtractedMedication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface OCRResult {
  medications: ExtractedMedication[];
  prescriptionTitle: string;
  additionalNotes: string;
}

export const usePrescriptionOCR = () => {
  const [isScanning, setIsScanning] = useState(false);

  const scanPrescription = async (file: File): Promise<OCRResult | null> => {
    setIsScanning(true);
    
    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("scan-prescription", {
        body: { imageBase64: base64 }
      });

      if (error) {
        console.error("OCR error:", error);
        toast.error("Failed to scan prescription. Please try again.");
        return null;
      }

      if (data.error) {
        toast.error(data.error);
        return null;
      }

      const result: OCRResult = {
        medications: data.medications || [],
        prescriptionTitle: data.prescriptionTitle || "Scanned Prescription",
        additionalNotes: data.additionalNotes || ""
      };

      if (result.medications.length > 0) {
        toast.success(`Found ${result.medications.length} medication(s)`);
      } else {
        toast.info("No medications detected. Please enter manually.");
      }

      return result;

    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to scan prescription");
      return null;
    } finally {
      setIsScanning(false);
    }
  };

  return {
    scanPrescription,
    isScanning
  };
};
