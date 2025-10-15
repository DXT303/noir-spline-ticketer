import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

interface TicketFiltersProps {
  activeFilter: 'all' | 'open' | 'in_progress' | 'closed';
  onFilterChange: (filter: 'all' | 'open' | 'in_progress' | 'closed') => void;
  counts: {
    all: number;
    open: number;
    in_progress: number;
    closed: number;
  };
}

const TicketFilters = ({ activeFilter, onFilterChange, counts }: TicketFiltersProps) => {
  const filters = [
    { value: 'all' as const, label: 'All Tickets', icon: null, count: counts.all },
    { value: 'open' as const, label: 'Open', icon: AlertCircle, count: counts.open },
    { value: 'in_progress' as const, label: 'In Progress', icon: Clock, count: counts.in_progress },
    { value: 'closed' as const, label: 'Closed', icon: CheckCircle2, count: counts.closed },
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.value;
        
        return (
          <Button
            key={filter.value}
            variant={isActive ? "default" : "outline"}
            onClick={() => onFilterChange(filter.value)}
            className={isActive 
              ? "bg-primary text-primary-foreground" 
              : "border-border hover:border-primary/50 hover:bg-primary/10"
            }
          >
            {Icon && <Icon className="w-4 h-4 mr-2" />}
            {filter.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              isActive 
                ? "bg-primary-foreground/20" 
                : "bg-muted"
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
