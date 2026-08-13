import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";

interface TicketFiltersProps {
  activeFilter: 'all' | 'open' | 'in_progress' | 'resolved' | 'unresolved' | 'closed';
  onFilterChange: (filter: 'all' | 'open' | 'in_progress' | 'resolved' | 'unresolved' | 'closed') => void;
  counts: {
    all: number;
    open: number;
    in_progress: number;
    resolved: number;
    unresolved: number;
    closed: number;
  };
}

const TicketFilters = ({ activeFilter, onFilterChange, counts }: TicketFiltersProps) => {
  const filters = [
    { value: 'all' as const, label: 'All', icon: null, count: counts.all },
    { value: 'open' as const, label: 'Open', icon: AlertCircle, count: counts.open },
    { value: 'in_progress' as const, label: 'In Progress', icon: Clock, count: counts.in_progress },
    { value: 'resolved' as const, label: 'Resolved', icon: CheckCircle2, count: counts.resolved },
    { value: 'unresolved' as const, label: 'Unresolved', icon: XCircle, count: counts.unresolved },
    { value: 'closed' as const, label: 'Closed', icon: CheckCircle2, count: counts.closed },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.value;
        
        return (
          <Button
            key={filter.value}
            variant={isActive ? "default" : "outline"}
            onClick={() => onFilterChange(filter.value)}
            size="sm"
            className={`shrink-0 ${
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "border-border hover:border-primary/50 hover:bg-primary/10"
            }`}
          >
            {Icon && <Icon className="w-3 h-3 mr-1" />}
            {filter.label}
            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
              isActive ? "bg-primary-foreground/20" : "bg-muted"
            }`}>
              {filter.count}
            </span>
          </Button>
        );
      })}
    </div>
  );
};

export default TicketFilters;
