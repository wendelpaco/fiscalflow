"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, RefreshCw } from "lucide-react";

import type { Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import JobStatusBadge from "./job-status-badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function JobsTable({ initialJobs }: { initialJobs: Job[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };
  
  const formatDuration = (ms: number | null) => {
    if (ms === null) return "-";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  return (
    <div className="space-y-4">
        <div className="flex justify-end">
            <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isPending}
            >
                <RefreshCw className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
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
                <TableHead className="hidden sm:table-cell text-right">Duração</TableHead>
                <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {initialJobs.length > 0 ? (
                initialJobs.map((job) => (
                    <TableRow key={job.id}>
                    <TableCell>
                        <JobStatusBadge status={job.status} />
                    </TableCell>
                    <TableCell className="font-medium truncate max-w-xs">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>{job.id.substring(0, 8)}...</TooltipTrigger>
                                <TooltipContent>
                                <p>{job.id}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </TableCell>
                    <TableCell className="hidden md:table-cell truncate max-w-sm">
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>{job.url.substring(0, 40)}...</TooltipTrigger>
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
                    <TableCell className="hidden sm:table-cell text-right">{formatDuration(job.processingDurationMs)}</TableCell>
                    <TableCell className="text-right">
                        <Button asChild variant="ghost" size="icon">
                            <Link href={`/jobs/${job.id}`}>
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
    </div>
  );
}
