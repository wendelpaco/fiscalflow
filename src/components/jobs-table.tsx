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
  ArrowUp,
  ArrowDown,
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
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

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

  // Ordenação
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    switch (sortBy) {
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      case "id":
        aValue = a.id;
        bValue = b.id;
        break;
      case "notas":
        aValue = a.metadata?.items?.length || 0;
        bValue = b.metadata?.items?.length || 0;
        break;
      case "createdAt":
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
      case "processingDurationMs":
        aValue = a.processingDurationMs || 0;
        bValue = b.processingDurationMs || 0;
        break;
      default:
        aValue = a.createdAt;
        bValue = b.createdAt;
    }
    if (aValue < bValue) return sortDir === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const total = sortedJobs.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const end = start + limit;
  const jobs = sortedJobs.slice(start, end);

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
    const totalSeconds = Math.floor(ms / 1000);
    if (totalSeconds < 60) {
      return `${(ms / 1000).toFixed(2)} s`;
    }
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes < 60) {
      return `${minutes}m ${seconds}s`;
    }
    const hours = Math.floor(minutes / 60);
    const remMinutes = minutes % 60;
    return `${hours}h ${remMinutes}m ${seconds}s`;
  };

  function renderSortIcon(col: string) {
    if (sortBy !== col) return null;
    return sortDir === "asc" ? (
      <ArrowUp className="inline w-3 h-3 ml-1" />
    ) : (
      <ArrowDown className="inline w-3 h-3 ml-1" />
    );
  }

  function handleSort(col: string) {
    if (sortBy === col) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  }

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
              <TableHead
                className="w-[100px] cursor-pointer"
                onClick={() => handleSort("status")}
              >
                Status{renderSortIcon("status")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("id")}
              >
                ID{renderSortIcon("id")}
              </TableHead>
              <TableHead
                className="hidden md:table-cell cursor-pointer"
                onClick={() => handleSort("url")}
              >
                URL
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("notas")}
              >
                Notas{renderSortIcon("notas")}
              </TableHead>
              <TableHead
                className="hidden sm:table-cell cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                Criação{renderSortIcon("createdAt")}
              </TableHead>
              <TableHead
                className="hidden sm:table-cell text-right cursor-pointer"
                onClick={() => handleSort("processingDurationMs")}
              >
                Duração{renderSortIcon("processingDurationMs")}
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
                  <TableCell>{job.metadata?.items?.length || 0}</TableCell>
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
                <TableCell colSpan={7} className="h-24 text-center">
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
