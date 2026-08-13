import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface TicketCardProps {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'unresolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  userEmail?: string | null;
  userName?: string | null;
  isAdmin?: boolean;
  onStatusChange?: (id: string, newStatus: 'open' | 'in_progress' | 'resolved' | 'unresolved' | 'closed') => void;
  onCancel?: (id: string) => void;
}

const statusConfig = {
  open: { label: 'Open', icon: AlertCircle, color: 'bg-primary/10 text-primary border-primary/20' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'bg-secondary/10 text-secondary border-secondary/20' },
  resolved: { label: 'Resolved', icon: CheckCircle2, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  unresolved: { label: 'Unresolved', icon: AlertCircle, color: 'bg-destructive/10 text-destructive border-destructive/20' },
  closed: { label: 'Closed', icon: CheckCircle2, color: 'bg-muted text-muted-foreground border-muted' },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', color: 'bg-secondary/20 text-secondary' },
  high: { label: 'High', color: 'bg-destructive/20 text-destructive' },
};

const TicketCard = ({ id, title, description, status, priority, createdAt, userEmail, userName, isAdmin, onStatusChange, onCancel }: TicketCardProps) => {
  const StatusIcon = statusConfig[status].icon;

  const nextStatusMap: Record<string, 'open' | 'in_progress' | 'resolved' | 'unresolved' | 'closed'> = {
    open: 'in_progress',
    in_progress: 'resolved',
    resolved: 'closed',
    unresolved: 'in_progress',
  };

  const handleStatusChange = () => {
    if (!onStatusChange || !nextStatusMap[status]) return;
    onStatusChange(id, nextStatusMap[status]);
  };

  const handleUnresolved = () => {
    if (!onStatusChange) return;
    onStatusChange(id, 'unresolved');
  };

  return (
    <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          {isAdmin && (
            <p className="text-xs text-muted-foreground mt-1">
              Submitted by: <span className="text-foreground font-medium">{userName || userEmail || 'Unknown'}</span>
            </p>
          )}
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
          {isAdmin && nextStatusMap[status] && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleStatusChange}
              className="border-primary/20 hover:bg-primary/10"
            >
              {status === 'open' && 'Start'}
              {status === 'in_progress' && 'Mark Resolved'}
              {status === 'resolved' && 'Close'}
              {status === 'unresolved' && 'Reopen'}
            </Button>
          )}
          {isAdmin && status === 'in_progress' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleUnresolved}
              className="border-destructive/20 hover:bg-destructive/10 text-destructive"
            >
              Unresolved
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TicketCard;
