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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Image, File, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMedicalHistory } from "@/hooks/useMedicalHistory";

interface UploadRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RECORD_TYPES = [
  { value: "vaccination", label: "Vaccination Record" },
  { value: "lab_test", label: "Lab Test Result" },
  { value: "imaging", label: "Imaging/X-ray/MRI" },
  { value: "surgery", label: "Surgery Record" },
  { value: "allergy_test", label: "Allergy Test" },
  { value: "blood_work", label: "Blood Work" },
  { value: "other", label: "Other" },
];

const UploadRecordDialog = ({ open, onOpenChange }: UploadRecordDialogProps) => {
  const { user } = useAuth();
  const { addRecord } = useMedicalHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [recordType, setRecordType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateRecorded, setDateRecorded] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Max 10MB
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-5 w-5 text-primary" />;
    }
    if (file.type === "application/pdf") {
      return <FileText className="h-5 w-5 text-destructive" />;
    }
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const resetForm = () => {
    setRecordType("");
    setTitle("");
    setDescription("");
    setDateRecorded("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!recordType || !title || !user) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsUploading(true);

    try {
      let fileUrls: string[] = [];

      // Upload file if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/records/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("prescriptions")
          .upload(filePath, selectedFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("prescriptions")
          .getPublicUrl(filePath);

        fileUrls.push(publicUrl);
      }

      // Add record to medical history
      await addRecord({
        record_type: recordType,
        title,
        description: description || undefined,
        date_recorded: dateRecorded || undefined,
        attachments: fileUrls.length > 0 ? fileUrls : undefined,
      });

      toast.success("Record added successfully");
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error uploading record:", error);
      toast.error("Failed to upload record");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Medical Record</DialogTitle>
          <DialogDescription>
            Add vaccination records, test results, or other medical documents
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Record Type */}
          <div className="space-y-2">
            <Label htmlFor="record-type">Record Type *</Label>
            <Select value={recordType} onValueChange={setRecordType}>
              <SelectTrigger>
                <SelectValue placeholder="Select record type" />
              </SelectTrigger>
              <SelectContent>
                {RECORD_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., COVID-19 Booster, Blood Panel Results"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date of Record</Label>
            <Input
              id="date"
              type="date"
              value={dateRecorded}
              onChange={(e) => setDateRecorded(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description / Notes</Label>
            <Textarea
              id="description"
              placeholder="Additional details about this record..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Attach Document (Optional)</Label>
            
            {!selectedFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Upload className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, Images up to 10MB
                </p>
              </div>
            ) : (
              <div className="border rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedFile)}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-1 text-destructive hover:bg-destructive/10 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Info Note */}
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-xs text-muted-foreground">
              📋 Records you upload are stored securely and visible to you and 
              any healthcare provider you grant access to via QR code.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!recordType || !title || isUploading}
            className="w-full gradient-primary"
          >
            {isUploading ? "Uploading..." : "Save Record"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadRecordDialog;
