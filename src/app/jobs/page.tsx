"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import JobsTable from "@/components/jobs-table";
import { JobsResponse } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export default function JobsPage() {
  const fetchJobs = async (): Promise<JobsResponse> => {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://192.168.0.104:3001";
    const res = await fetch(`${baseUrl}/api/jobs`, { cache: "no-store" });
    if (!res.ok) throw new Error("Erro ao buscar jobs");
    return res.json();
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
    refetchOnWindowFocus: true,
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });

  const jobs = data?.jobs || [];
  const total = data?.total || jobs.length;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Fila de Processamento
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Acompanhe o status de todos os jobs de processamento de NFCe.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Jobs</CardTitle>
          <CardDescription>Lista de todos os jobs criados.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center py-8">Carregando jobs...</div>
          )}
          {isError && (
            <div className="text-center text-destructive py-8">
              Erro ao carregar jobs.
            </div>
          )}
          {!isLoading && !isError && <JobsTable allJobs={jobs} />}
        </CardContent>
      </Card>
    </div>
  );
}
