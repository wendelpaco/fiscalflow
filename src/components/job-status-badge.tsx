import { Badge } from "@/components/ui/badge";
import type { JobStatus } from "@/lib/types";
import {
  CheckCircle2,
  Clock,
  Hourglass,
  XCircle,
  Bot,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  PENDING: {
    label: "Pendente",
    icon: Clock,
    className:
      "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30 hover:bg-muted-foreground/30",
  },
  PROCESSING: {
    label: "Processando",
    icon: Hourglass,
    className:
      "bg-sky-500/20 text-sky-600 border-sky-500/30 hover:bg-sky-500/30 dark:text-sky-400",
  },
  DONE: {
    label: "Concluído",
    icon: CheckCircle2,
    className:
      "bg-green-500/15 text-green-700 border-green-500/40 hover:bg-green-500/25 dark:text-green-400 dark:bg-green-700/20 dark:border-green-400/40 font-semibold",
  },
  ERROR: {
    label: "Erro",
    icon: XCircle,
    className:
      "bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30",
  },
  BLOCKED: {
    label: "Bloqueado",
    icon: Shield,
    className:
      "bg-orange-500/20 text-orange-600 border-orange-500/30 hover:bg-orange-500/30 dark:text-orange-400",
  },
};

export default function JobStatusBadge({ status }: { status: JobStatus }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 whitespace-nowrap", config.className)}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
}
