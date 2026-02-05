import { useState, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, FileText, X, Scan, Loader2 } from "lucide-react";
import { usePrescriptions } from "@/hooks/usePrescriptions";
import { usePrescriptionOCR, ExtractedMedication } from "@/hooks/usePrescriptionOCR";
import { Badge } from "@/components/ui/badge";

interface UploadPrescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
}

const UploadPrescriptionDialog = ({
  open,
  onOpenChange,
  patientId
}: UploadPrescriptionDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedMedications, setExtractedMedications] = useState<ExtractedMedication[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const { addPrescription, uploadPrescriptionFile } = usePrescriptions();
  const { scanPrescription, isScanning } = usePrescriptionOCR();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!title) return;

    setIsLoading(true);

    let fileUrl = null;
    let fileType = null;

    if (selectedFile) {
      const { url, fileType: type, error } = await uploadPrescriptionFile(selectedFile);
      if (error) {
        setIsLoading(false);
        return;
      }
      fileUrl = url;
      fileType = type;
    }

    await addPrescription({
      title,
      description,
      file_url: fileUrl || undefined,
      file_type: fileType || undefined,
      patient_id: patientId,
      medications: extractedMedications.length > 0 ? extractedMedications : undefined
    });

    setIsLoading(false);
    setTitle("");
    setDescription("");
    setSelectedFile(null);
    setPreview(null);
    setExtractedMedications([]);
    onOpenChange(false);
  };

  const handleScanPrescription = async () => {
    if (!selectedFile || !selectedFile.type.startsWith("image/")) return;
    
    const result = await scanPrescription(selectedFile);
    if (result) {
      if (result.prescriptionTitle && !title) {
        setTitle(result.prescriptionTitle);
      }
      if (result.additionalNotes && !description) {
        setDescription(result.additionalNotes);
      }
      if (result.medications.length > 0) {
        setExtractedMedications(result.medications);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setExtractedMedications([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Prescription</DialogTitle>
          <DialogDescription>
            Upload a prescription from your device or take a photo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Blood Test Results"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add any notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* File Upload Area */}
          {selectedFile ? (
            <div className="space-y-3">
              <div className="relative border rounded-xl p-4">
                <button
                  onClick={clearFile}
                  className="absolute top-2 right-2 p-1 bg-destructive/10 rounded-full hover:bg-destructive/20 z-10"
                >
                  <X className="h-4 w-4 text-destructive" />
                </button>
                
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-40 object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex items-center gap-3 py-4">
                    <FileText className="h-10 w-10 text-primary" />
                    <div>
                      <p className="font-medium truncate">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Scan Button - Only for images */}
              {selectedFile.type.startsWith("image/") && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleScanPrescription}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Scanning with AI...
                    </>
                  ) : (
                    <>
                      <Scan className="h-4 w-4 mr-2" />
                      Scan for Medications (AI)
                    </>
                  )}
                </Button>
              )}

              {/* Extracted Medications */}
              {extractedMedications.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Scan className="h-4 w-4 text-primary" />
                    Extracted Medications
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {extractedMedications.map((med, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {med.name} {med.dosage && `(${med.dosage})`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="h-6 w-6 text-primary" />
                <span className="text-sm">Take Photo</span>
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                type="button"
                variant="outline"
                className="h-24 flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6 text-primary" />
                <span className="text-sm">Upload File</span>
              </Button>
            </div>
          )}

          {/* Warning for user uploads */}
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-3">
            <p className="text-xs text-warning">
              ⚠️ User-uploaded prescriptions will be marked as "Not Verified" 
              until reviewed by a medical professional.
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!title || isLoading || isScanning}
            className="w-full gradient-primary"
          >
            {isLoading ? "Uploading..." : "Upload Prescription"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadPrescriptionDialog;
