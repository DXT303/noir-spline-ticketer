import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface TicketCardProps {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  onStatusChange?: (id: string, newStatus: 'open' | 'in_progress' | 'closed') => void;
}

const statusConfig = {
  open: { label: 'Open', icon: AlertCircle, color: 'bg-primary/10 text-primary border-primary/20' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'bg-secondary/10 text-secondary border-secondary/20' },
  closed: { label: 'Closed', icon: CheckCircle2, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', color: 'bg-secondary/20 text-secondary' },
  high: { label: 'High', color: 'bg-destructive/20 text-destructive' },
};

const TicketCard = ({ id, title, description, status, priority, createdAt, onStatusChange }: TicketCardProps) => {
  const StatusIcon = statusConfig[status].icon;

  const handleStatusChange = () => {
    if (!onStatusChange) return;
    
    const nextStatus = status === 'open' ? 'in_progress' : status === 'in_progress' ? 'closed' : 'open';
    onStatusChange(id, nextStatus);
  };

  return (
    <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge variant="outline" className={statusConfig[status].color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig[status].label}
          </Badge>
          <Badge variant="outline" className={priorityConfig[priority].color}>
            {priorityConfig[priority].label}
          </Badge>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {format(new Date(createdAt), 'MMM dd, yyyy')}
          </span>
          {status !== 'closed' && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleStatusChange}
              className="border-primary/20 hover:bg-primary/10"
            >
              Next Status
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TicketCard;
