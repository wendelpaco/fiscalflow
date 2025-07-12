import { Badge } from "@/components/ui/badge";
import type { JobStatus } from "@/lib/types";
import { CheckCircle2, Clock, Hourglass, XCircle, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  PENDING: {
    label: "Pendente",
    icon: Clock,
    className: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30 hover:bg-muted-foreground/30",
  },
  PROCESSING: {
    label: "Processando",
    icon: Hourglass,
    className: "bg-sky-500/20 text-sky-600 border-sky-500/30 hover:bg-sky-500/30 dark:text-sky-400",
  },
  DONE: {
    label: "Concluído",
    icon: CheckCircle2,
    className: "bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent/30",
  },
  ERROR: {
    label: "Erro",
    icon: XCircle,
    className: "bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30",
  },
};

export default function JobStatusBadge({ status }: { status: JobStatus }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn("gap-1.5 whitespace-nowrap", config.className)}>
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
}
