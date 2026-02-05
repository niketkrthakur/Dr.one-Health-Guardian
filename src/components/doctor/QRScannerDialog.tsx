import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, AlertTriangle, Link } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface QRScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QRScannerDialog = ({ open, onOpenChange }: QRScannerDialogProps) => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualLink, setManualLink] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && !showManualInput) {
      startScanner();
    }
    
    return () => {
      stopScanner();
    };
  }, [open, showManualInput]);

  const startScanner = async () => {
    setError(null);
    setIsScanning(true);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      
      if (!containerRef.current) return;

      scannerRef.current = new Html5Qrcode("qr-reader");

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // QR code not found in frame - silent
        }
      );
    } catch (err: any) {
      console.error("Scanner error:", err);
      setError(err.message || "Failed to access camera");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
  };

  const handleScanSuccess = (decodedText: string) => {
    stopScanner();
    
    // Extract token from URL
    try {
      const url = new URL(decodedText);
      const token = url.searchParams.get("token");
      
      if (token) {
        onOpenChange(false);
        navigate(`/doctor-access?token=${token}`);
      } else {
        setError("Invalid QR code - no access token found");
      }
    } catch {
      setError("Invalid QR code format");
    }
  };

  const handleManualSubmit = () => {
    if (!manualLink.trim()) return;

    try {
      const url = new URL(manualLink);
      const token = url.searchParams.get("token");
      
      if (token) {
        onOpenChange(false);
        navigate(`/doctor-access?token=${token}`);
      } else {
        toast.error("Invalid link - no access token found");
      }
    } catch {
      toast.error("Invalid link format");
    }
  };

  const handleClose = () => {
    stopScanner();
    setManualLink("");
    setShowManualInput(false);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Patient QR Code
          </DialogTitle>
          <DialogDescription>
            Point your camera at the patient's Emergency QR code to access their records
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!showManualInput ? (
            <>
              {/* Scanner Container */}
              <div 
                ref={containerRef}
                className="relative aspect-square bg-muted rounded-xl overflow-hidden"
              >
                <div id="qr-reader" className="w-full h-full" />
                
                {!isScanning && !error && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse text-center">
                      <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">
                        Starting camera...
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/95 p-4">
                    <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      {error}
                    </p>
                    <Button onClick={startScanner} variant="outline" size="sm">
                      Try Again
                    </Button>
                  </div>
                )}
              </div>

              {/* Manual link option */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  stopScanner();
                  setShowManualInput(true);
                }}
              >
                <Link className="h-4 w-4 mr-2" />
                Enter Link Manually
              </Button>
            </>
          ) : (
            <>
              {/* Manual link input */}
              <div className="space-y-2">
                <Label htmlFor="access-link">Access Link</Label>
                <Input
                  id="access-link"
                  placeholder="Paste the patient's access link here..."
                  value={manualLink}
                  onChange={(e) => setManualLink(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Ask the patient to share their access link from the Emergency QR screen
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowManualInput(false);
                    setManualLink("");
                  }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Use Camera
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleManualSubmit}
                  disabled={!manualLink.trim()}
                >
                  Access Records
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRScannerDialog;
