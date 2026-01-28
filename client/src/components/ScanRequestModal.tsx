import { useState } from "react";
import { useSystems, useScanRequest } from "@/hooks/use-systems";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PlayCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScanRequestModalProps {
  children?: React.ReactNode;
}

export function ScanRequestModal({ children }: ScanRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const { data: systems, isLoading } = useSystems();
  const scanMutation = useScanRequest();
  const { toast } = useToast();

  const handleToggle = (id: string) => {
    setSelectedSystems(current => 
      current.includes(id) 
        ? current.filter(s => s !== id) 
        : [...current, id]
    );
  };

  const handleScan = async () => {
    if (selectedSystems.length === 0) return;
    
    try {
      await scanMutation.mutateAsync(selectedSystems);
      toast({
        title: "Scan Initiated",
        description: `Successfully started scan for ${selectedSystems.length} systems.`,
      });
      setOpen(false);
      setSelectedSystems([]);
    } catch (err) {
      toast({
        title: "Scan Failed",
        description: "Could not initiate scan. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button data-testid="button-request-scan" className="gap-2 bg-blue-600 hover:bg-blue-700">
            <PlayCircle size={16} /> Request Scan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Request Ad-Hoc Scan</DialogTitle>
          <DialogDescription className="text-slate-400">
            Select the systems you want to scan for compliance issues. This may take several minutes.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 max-h-[300px] overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            </div>
          ) : systems?.length === 0 ? (
            <p className="text-center text-slate-500 p-4">No authorized systems found.</p>
          ) : (
            <div className="space-y-3">
              {systems?.filter(s => s.hasAccess).map((system) => (
                <div 
                  key={system.id} 
                  data-testid={`checkbox-system-${system.id}`}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedSystems.includes(system.id) 
                      ? "bg-blue-600/20 border-blue-500" 
                      : "border-slate-700 hover:bg-slate-800"
                  }`}
                  onClick={() => handleToggle(system.id)}
                >
                  <Checkbox 
                    id={`sys-${system.id}`} 
                    checked={selectedSystems.includes(system.id)}
                    onCheckedChange={() => handleToggle(system.id)}
                    className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label 
                      htmlFor={`sys-${system.id}`}
                      className="text-sm font-medium leading-none cursor-pointer text-white"
                    >
                      {system.name}
                    </Label>
                    <p className="text-xs text-slate-500">
                      ID: {system.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleScan} 
            data-testid="button-start-scan"
            disabled={selectedSystems.length === 0 || scanMutation.isPending}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {scanMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="h-4 w-4" />
            )}
            Start Scan ({selectedSystems.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
