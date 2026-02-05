import { useState } from "react";
import { RefreshCw, Check, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRefillRequests, RefillRequest } from "@/hooks/useRefillRequests";
import { cn } from "@/lib/utils";

const RefillRequestsManager = () => {
  const { requests, loading, respondToRequest } = useRefillRequests();
  const [selectedRequest, setSelectedRequest] = useState<RefillRequest | null>(null);
  const [response, setResponse] = useState("");
  const [isResponding, setIsResponding] = useState(false);

  const pendingRequests = requests.filter((r) => r.status === "pending");

  const handleRespond = async (status: "approved" | "denied") => {
    if (!selectedRequest) return;
    
    setIsResponding(true);
    await respondToRequest(selectedRequest.id, status, response || undefined);
    setIsResponding(false);
    setSelectedRequest(null);
    setResponse("");
  };

  if (loading) {
    return (
      <div className="healthcare-card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-muted rounded w-1/3" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="healthcare-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Refill Requests</h3>
          </div>
          {pendingRequests.length > 0 && (
            <span className="text-xs px-2 py-1 bg-warning/10 text-warning rounded-full">
              {pendingRequests.length} pending
            </span>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No pending refill requests
          </p>
        ) : (
          <div className="space-y-3">
            {pendingRequests.slice(0, 5).map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{request.medication_name}</p>
                  {request.request_notes && (
                    <p className="text-xs text-muted-foreground truncate">
                      {request.request_notes}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-success hover:text-success"
                    onClick={() => respondToRequest(request.id, "approved")}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Refill Request</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-medium">{selectedRequest?.medication_name}</p>
              {selectedRequest?.request_notes && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedRequest.request_notes}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Response (optional)</label>
              <Textarea
                placeholder="Add a message for the patient..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => handleRespond("denied")}
                disabled={isResponding}
              >
                <X className="h-4 w-4 mr-2" />
                Deny
              </Button>
              <Button
                className="flex-1 gradient-primary"
                onClick={() => handleRespond("approved")}
                disabled={isResponding}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RefillRequestsManager;
