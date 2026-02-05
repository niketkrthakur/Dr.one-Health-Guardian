import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface PrescriptionFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  startDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  endDate: Date | undefined;
  onEndDateChange: (date: Date | undefined) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const PrescriptionFilters = ({
  searchQuery,
  onSearchChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClearFilters,
  hasActiveFilters,
}: PrescriptionFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      {/* Search + Filter Toggle Row */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search medications..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <CollapsibleTrigger asChild>
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="icon"
            className="shrink-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>

      {/* Expandable Date Filters */}
      <CollapsibleContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Start Date */}
          <div className="space-y-1">
            <Label className="text-xs">From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                  size="sm"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PP") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={onStartDateChange}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <Label className="text-xs">To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                  size="sm"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PP") : "End date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={onEndDateChange}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="w-full text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All Filters
          </Button>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default PrescriptionFilters;
