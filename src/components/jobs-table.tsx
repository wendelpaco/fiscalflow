"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";

import type { Job, JobStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import JobStatusBadge from "./job-status-badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_OPTIONS: JobStatus[] = [
  "PENDING",
  "PROCESSING",
  "DONE",
  "ERROR",
  "BLOCKED",
];

interface JobsTableProps {
  allJobs: Job[];
}

export default function JobsTable({ allJobs }: JobsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<JobStatus[]>([]);
  const [search, setSearch] = useState("");

  // Filtro de status
  const filteredByStatus =
    statusFilter.length > 0
      ? allJobs.filter((job) => statusFilter.includes(job.status))
      : allJobs;

  // Filtro de busca
  const filteredJobs = filteredByStatus.filter(
    (job) =>
      job.id.toLowerCase().includes(search.toLowerCase()) ||
      job.url.toLowerCase().includes(search.toLowerCase())
  );

  const total = filteredJobs.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const end = start + limit;
  const jobs = filteredJobs.slice(start, end);

  const goToPage = (newPage: number) => {
    setPage(newPage);
  };

  // Resetar para página 1 ao mudar filtro
  function handleStatusChange(status: JobStatus) {
    setPage(1);
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPage(1);
    setSearch(e.target.value);
  }

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const formatDuration = (ms: number | null) => {
    if (ms === null) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-2">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium">Status:</span>
          {STATUS_OPTIONS.map((status) => (
            <Button
              key={status}
              variant={statusFilter.includes(status) ? "default" : "outline"}
              size="sm"
              className="px-2 py-1 text-xs"
              onClick={() => handleStatusChange(status)}
            >
              {status}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Buscar por ID ou URL"
            value={search}
            onChange={handleSearchChange}
            className="border rounded px-2 py-1 text-sm w-64"
          />
          <Search className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isPending}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead>ID</TableHead>
              <TableHead className="hidden md:table-cell">URL</TableHead>
              <TableHead className="hidden sm:table-cell">Criação</TableHead>
              <TableHead className="hidden sm:table-cell text-right">
                Duração
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <JobStatusBadge status={job.status} />
                  </TableCell>
                  <TableCell className="font-medium truncate max-w-xs">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {job.id.substring(0, 8)}...
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{job.id}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="hidden md:table-cell truncate max-w-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          {job.url.substring(0, 40)}...
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{job.url}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatDistanceToNow(new Date(job.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-right">
                    {formatDuration(job.processingDurationMs)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={`/jobs/${job.urlQueueId}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver Detalhes</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhum job encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Controles de paginação */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm text-muted-foreground">
          Página {page} de {totalPages} (exibindo {jobs.length} de {total} jobs)
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goToPage(1)}
            disabled={page === 1}
            aria-label="Primeira página"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            aria-label="Próxima página"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goToPage(totalPages)}
            disabled={page === totalPages}
            aria-label="Última página"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
