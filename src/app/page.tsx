"use client";

import JobCreationForm from "@/components/job-creation-form";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import JobStatusBadge from "@/components/job-status-badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRef, useEffect, useState } from "react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Clock, CheckCircle2, XCircle, Hourglass, Shield } from "lucide-react";

export default function Home() {
  // Buscar últimos jobs (limit=8 para melhor altura)
  const fetchJobs = async () => {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://192.168.0.104:3001";
    const res = await fetch(`${baseUrl}/api/jobs?limit=8`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Erro ao buscar jobs");
    return res.json();
  };
  const { data, isLoading, isError } = useQuery({
    queryKey: ["jobs-home"],
    queryFn: fetchJobs,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });
  const jobs = data?.jobs || [];
  const jobsToday = jobs.filter((job: any) => {
    const today = new Date();
    const created = new Date(job.createdAt);
    return (
      created.getDate() === today.getDate() &&
      created.getMonth() === today.getMonth() &&
      created.getFullYear() === today.getFullYear()
    );
  }).length;

  // refs para sincronizar altura
  const formCardRef = useRef<HTMLDivElement>(null);
  const [sidebarHeight, setSidebarHeight] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    if (formCardRef.current) {
      setSidebarHeight(formCardRef.current.offsetHeight);
    }
  }, [formCardRef.current, jobs.length]);

  // Funções utilitárias para status
  function getStatusIcon(status: string) {
    switch (status) {
      case "DONE":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "ERROR":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "PROCESSING":
        return <Hourglass className="w-4 h-4 text-blue-600" />;
      case "BLOCKED":
        return <Shield className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  }
  function getStatusLabel(status: string) {
    switch (status) {
      case "DONE":
        return "Concluído";
      case "ERROR":
        return "Erro";
      case "PROCESSING":
        return "Processando";
      case "BLOCKED":
        return "Bloqueado";
      default:
        return "Pendente";
    }
  }
  function getStatusBgColor(status: string) {
    switch (status) {
      case "DONE":
        return "#d1fae5"; // verde claro
      case "ERROR":
        return "#fee2e2"; // vermelho claro
      case "PROCESSING":
        return "#dbeafe"; // azul claro
      case "BLOCKED":
        return "#fef3c7"; // laranja claro
      default:
        return "#e5e7eb"; // cinza claro
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          FiscalFlow
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Envie suas notas fiscais para processamento em fila.
        </p>
      </div>
      <div className="flex flex-col md:flex-row md:items-start md:justify-center gap-8 w-full max-w-6xl mx-auto">
        {/* Sidebar à esquerda, altura igual ao card do formulário */}
        <div
          className="flex flex-col gap-4 w-full md:w-[320px] mb-4 md:mb-0"
          style={sidebarHeight ? { height: sidebarHeight } : {}}
        >
          <div className="flex flex-col h-full flex-1 gap-4">
            <Card className="flex-1 flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-base">
                  Últimos Jobs Criados
                </CardTitle>
                <CardDescription>
                  Veja o status dos últimos envios
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {isLoading && <div className="text-sm">Carregando...</div>}
                {isError && (
                  <div className="text-destructive text-sm">
                    Erro ao carregar jobs.
                  </div>
                )}
                {!isLoading && !isError && jobs.length === 0 && (
                  <div className="text-muted-foreground text-sm">
                    Nenhum job criado ainda.
                  </div>
                )}
                {!isLoading && !isError && jobs.length > 0 && (
                  <TooltipProvider>
                    <ul className="divide-y divide-muted-foreground/10 overflow-y-auto max-h-40 pr-1 hide-scrollbar">
                      {jobs.slice(0, 8).map((job: any) => (
                        <li
                          key={job.id}
                          className="grid grid-cols-[auto_1fr_auto] items-center gap-2 py-2 px-1 hover:bg-muted/60 transition-colors"
                        >
                          {/* Status Icone com tooltip */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span
                                className="inline-flex items-center justify-center w-6 h-6 rounded-full"
                                style={{
                                  backgroundColor: getStatusBgColor(job.status),
                                }}
                              >
                                {getStatusIcon(job.status)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <span className="font-medium text-xs">
                                {getStatusLabel(job.status)}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                href={`/jobs/${job.urlQueueId}`}
                                className="truncate text-primary underline text-xs max-w-[100px] cursor-pointer"
                              >
                                {job.id.slice(0, 8)}...
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <span className="font-mono text-xs">
                                {job.id}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                          <span className="text-muted-foreground text-xs text-right whitespace-nowrap">
                            {formatDistanceToNow(new Date(job.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </TooltipProvider>
                )}
                <div className="mt-3 text-right">
                  <Link href="/jobs" className="text-xs text-primary underline">
                    Ver Fila de Jobs &rarr;
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1 flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-base">Resumo de Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobsToday}</div>
                <div className="text-xs text-muted-foreground">
                  Jobs processados hoje
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Área principal à direita */}
        <div className="flex-1 flex flex-col items-center">
          {/*  max-w-xl */}
          <div className="w-full" ref={formCardRef}>
            <JobCreationForm>
              <div className="px-6 pb-4 pt-2 text-xs text-muted-foreground text-center md:text-left border-t">
                <span className="font-medium">Dica:</span> O campo Webhook é
                opcional. Se preenchido, seu sistema receberá notificações
                automáticas sobre o status do job.
              </div>
            </JobCreationForm>
          </div>
        </div>
      </div>
    </div>
  );
}
