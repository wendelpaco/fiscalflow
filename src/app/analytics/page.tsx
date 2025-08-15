"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Job, JobsResponse } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Clock,
  AlertCircle,
} from "lucide-react";
import AnalyticsFilters from "@/components/analytics-filters";
import AnalyticsInsights from "@/components/analytics-insights";
import Link from "next/link";

export default function AnalyticsPage() {
  const [filters, setFilters] = useState({
    period: "all",
    status: "all",
  });

  const fetchJobs = async (): Promise<JobsResponse> => {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://192.168.0.104:3001";
    const res = await fetch(`${baseUrl}/api/jobs`, { cache: "no-store" });
    if (!res.ok) throw new Error("Erro ao buscar jobs");
    return res.json();
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Atualiza a cada 10 segundos
  });

  const jobs: Job[] = data?.jobs || [];

  // Função para filtrar jobs baseado nos filtros aplicados
  const getFilteredJobs = (): Job[] => {
    if (!jobs.length) return [];

    let filteredJobs: Job[] = [...jobs];

    // Filtro por período
    if (filters.period !== "all") {
      const now = new Date();
      const periodMap: Record<string, number> = {
        "1d": 1,
        "7d": 7,
        "30d": 30,
        "90d": 90,
      };
      const daysToSubtract = periodMap[filters.period] || 0;

      if (daysToSubtract > 0) {
        const cutoffDate = new Date(
          now.getTime() - daysToSubtract * 24 * 60 * 60 * 1000
        );
        filteredJobs = filteredJobs.filter((job) => {
          const jobDate = new Date(job.createdAt);
          return jobDate >= cutoffDate;
        });
      }
    }

    // Filtro por status
    if (filters.status !== "all") {
      filteredJobs = filteredJobs.filter(
        (job) => job.status === filters.status
      );
    }

    return filteredJobs;
  };

  const filteredJobs: Job[] = getFilteredJobs();

  // Processar dados para análise
  const processAnalyticsData = () => {
    if (!filteredJobs.length) return null;

    // Status distribution
    const statusCount = filteredJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Processing time analysis
    const processingTimes = filteredJobs
      .filter((job) => job.processingDurationMs && job.processingDurationMs > 0)
      .map((job) => ({
        id: job.id,
        duration: job.processingDurationMs! / 1000, // Convert to seconds
        status: job.status,
      }))
      .sort((a, b) => b.duration - a.duration);

    // Daily job creation
    const dailyJobs = filteredJobs.reduce((acc, job) => {
      const date = new Date(job.createdAt).toLocaleDateString("pt-BR");
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Financial data (if available)
    const financialData = filteredJobs
      .filter((job) => job.metadata?.totals?.amountToPay)
      .map((job) => ({
        id: job.id,
        amount:
          parseFloat(
            job
              .metadata!.totals!.amountToPay.replace("R$", "")
              .replace(",", ".")
              .trim()
          ) || 0,
        status: job.status,
      }));

    return {
      statusCount,
      processingTimes,
      dailyJobs,
      financialData,
    };
  };

  const analyticsData = processAnalyticsData();

  // Cores para os gráficos
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // Status labels
  const statusLabels = {
    PENDING: "Pendente",
    PROCESSING: "Processando",
    DONE: "Concluído",
    ERROR: "Erro",
    BLOCKED: "Bloqueado",
  };

  // Métricas principais
  const getMainMetrics = () => {
    if (!filteredJobs.length) return null;

    const totalJobs = filteredJobs.length;
    const completedJobs = filteredJobs.filter(
      (job) => job.status === "DONE"
    ).length;
    const errorJobs = filteredJobs.filter(
      (job) => job.status === "ERROR"
    ).length;
    const blockedJobs = filteredJobs.filter(
      (job) => job.status === "BLOCKED"
    ).length;
    const errorAndBlockedJobs = errorJobs + blockedJobs;
    const pendingJobs = filteredJobs.filter(
      (job) => job.status === "PENDING"
    ).length;
    const pendingAndBlockedJobs = pendingJobs + blockedJobs;
    const jobsWithDuration = filteredJobs.filter(
      (job) => job.processingDurationMs && job.processingDurationMs > 0
    );
    const avgProcessingTime =
      jobsWithDuration.length > 0
        ? jobsWithDuration.reduce(
            (sum, job) => sum + job.processingDurationMs!,
            0
          ) / jobsWithDuration.length
        : 0;

    const totalAmount = filteredJobs
      .filter((job) => job.metadata?.totals?.amountToPay)
      .reduce((sum, job) => {
        const amount =
          parseFloat(
            job
              .metadata!.totals!.amountToPay.replace("R$", "")
              .replace(",", ".")
              .trim()
          ) || 0;
        return sum + amount;
      }, 0);

    return {
      totalJobs,
      completedJobs,
      errorJobs: errorJobs, // Apenas jobs com erro, sem incluir bloqueados
      pendingJobs: pendingAndBlockedJobs,
      blockedJobs: blockedJobs, // Jobs bloqueados para insights
      avgProcessingTime: avgProcessingTime / 1000, // Convert to seconds
      totalAmount,
    };
  };

  const metrics = getMainMetrics();

  // Função utilitária para garantir tipo Job
  function isJob(obj: unknown): obj is Job {
    return (
      !!obj &&
      typeof obj === "object" &&
      "id" in obj &&
      typeof (obj as any).id === "string" &&
      "status" in obj &&
      typeof (obj as any).status === "string"
    );
  }

  // Calcular tempo máximo/mínimo de processamento e jobs extremos
  let maxJob: Job | null = null;
  let minJob: Job | null = null;
  let maxTime = 0;
  let minTime = Infinity;
  let jobsProcessing = 0;
  let jobsBlocked = 0;
  const statusCount: Record<string, number> = {};
  const filteredJobsSafe: Job[] = Array.isArray(filteredJobs)
    ? filteredJobs.filter(isJob)
    : [];
  if (filteredJobsSafe.length > 0) {
    (filteredJobsSafe as Job[]).forEach((job: Job) => {
      statusCount[job.status] = (statusCount[job.status] || 0) + 1;
      if (job.status === "PROCESSING") jobsProcessing++;
      if (job.status === "BLOCKED") jobsBlocked++;
      if (
        typeof job.processingDurationMs === "number" &&
        job.status === "DONE"
      ) {
        if (job.processingDurationMs > maxTime) {
          maxTime = job.processingDurationMs;
          maxJob = job;
        }
        if (job.processingDurationMs < minTime) {
          minTime = job.processingDurationMs;
          minJob = job;
        }
      }
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Análise Avançada
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Carregando dados de análise...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Análise Avançada
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Erro ao carregar dados de análise.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          Análise Avançada
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Visualize métricas e tendências dos dados processados.
        </p>
      </div>

      {/* Filtros */}
      <AnalyticsFilters
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
        }}
      />

      {/* Indicador de Filtros Ativos */}
      {(filters.period !== "all" || filters.status !== "all") && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <span className="font-medium">Filtros ativos:</span>
              {filters.period !== "all" && (
                <span className="bg-blue-100 px-2 py-1 rounded">
                  Período:{" "}
                  {filters.period === "1d"
                    ? "Último dia"
                    : filters.period === "7d"
                    ? "Últimos 7 dias"
                    : filters.period === "30d"
                    ? "Últimos 30 dias"
                    : filters.period === "90d"
                    ? "Últimos 90 dias"
                    : filters.period}
                </span>
              )}
              {filters.status !== "all" && (
                <span className="bg-blue-100 px-2 py-1 rounded">
                  Status: {filters.status}
                </span>
              )}
              <button
                onClick={() => setFilters({ period: "all", status: "all" })}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Limpar filtros
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas Principais */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Jobs
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                Jobs processados no total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jobs Concluídos
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.completedJobs}
              </div>
              <p className="text-xs text-muted-foreground">
                {((metrics.completedJobs / metrics.totalJobs) * 100).toFixed(1)}
                % de sucesso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Jobs com Erro
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {metrics.errorJobs}
              </div>
              <p className="text-xs text-muted-foreground">
                {((metrics.errorJobs / metrics.totalJobs) * 100).toFixed(1)}% de
                erro
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {metrics.totalAmount.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Valor total processado
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights */}
      <AnalyticsInsights metrics={metrics} />

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Distribuição por Status */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <CardDescription>
              Proporção de jobs por status de processamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(analyticsData.statusCount).map(
                      ([status, count]) => ({
                        name:
                          statusLabels[status as keyof typeof statusLabels] ||
                          status,
                        value: count,
                      })
                    )}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(analyticsData.statusCount).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Tempo de Processamento */}
        <Card>
          <CardHeader>
            <CardTitle>Tempo de Processamento</CardTitle>
            <CardDescription>
              Tempo médio de processamento por job (segundos)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData && analyticsData.processingTimes.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.processingTimes.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="duration" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
            {(!analyticsData || analyticsData.processingTimes.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado de tempo de processamento disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jobs por Dia */}
        <Card>
          <CardHeader>
            <CardTitle>Jobs Criados por Dia</CardTitle>
            <CardDescription>
              Volume de jobs criados ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={Object.entries(analyticsData.dailyJobs).map(
                    ([date, count]) => ({
                      date,
                      jobs: count,
                    })
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="jobs"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Valor por Job */}
        <Card>
          <CardHeader>
            <CardTitle>Valor por Job</CardTitle>
            <CardDescription>
              Distribuição de valores processados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData && analyticsData.financialData.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData.financialData.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="id" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value}`, "Valor"]} />
                  <Bar dataKey="amount" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            )}
            {(!analyticsData || analyticsData.financialData.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado financeiro disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Detalhada</CardTitle>
          <CardDescription>
            Métricas detalhadas de performance do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Métrica</th>
                  <th className="text-left p-2">Valor</th>
                  <th className="text-left p-2">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {metrics && (
                  <>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Taxa de Sucesso</td>
                      <td className="p-2">
                        {(
                          (metrics.completedJobs / metrics.totalJobs) *
                          100
                        ).toFixed(1)}
                        %
                      </td>
                      <td className="p-2 text-muted-foreground">
                        Jobs concluídos com sucesso
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Taxa de Erro</td>
                      <td className="p-2">
                        {(
                          (metrics.errorJobs / metrics.totalJobs) *
                          100
                        ).toFixed(1)}
                        %
                      </td>
                      <td className="p-2 text-muted-foreground">
                        Jobs que falharam no processamento
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">
                        Tempo Médio de Processamento
                      </td>
                      <td className="p-2">
                        {metrics.avgProcessingTime > 0
                          ? `${metrics.avgProcessingTime.toFixed(2)}s`
                          : "N/A"}
                      </td>
                      <td className="p-2 text-muted-foreground">
                        Tempo médio para processar um job
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">
                        Tempo Máximo de Processamento
                      </td>
                      <td className="p-2">
                        {maxJob &&
                        isJob(maxJob) &&
                        typeof (maxJob as Job).processingDurationMs ===
                          "number" &&
                        typeof (maxJob as Job).urlQueueId === "string" ? (
                          <Link
                            href={`/jobs/${(maxJob as Job).urlQueueId}`}
                            className="underline text-primary"
                          >
                            {(
                              (maxJob as Job).processingDurationMs! / 1000
                            ).toFixed(2)}
                            s
                          </Link>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="p-2 text-muted-foreground">
                        Job mais lento
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">
                        Tempo Mínimo de Processamento
                      </td>
                      <td className="p-2">
                        {minJob &&
                        isJob(minJob) &&
                        typeof (minJob as Job).processingDurationMs! ===
                          "number" &&
                        typeof (minJob as Job).urlQueueId === "string" ? (
                          <Link
                            href={`/jobs/${(minJob as Job).urlQueueId}`}
                            className="underline text-primary"
                          >
                            {(
                              (minJob as Job).processingDurationMs! / 1000
                            ).toFixed(2)}
                            s
                          </Link>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="p-2 text-muted-foreground">
                        Job mais rápido
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Jobs Pendentes</td>
                      <td className="p-2">{metrics.pendingJobs}</td>
                      <td className="p-2 text-muted-foreground">
                        Jobs aguardando processamento
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Jobs em Processamento</td>
                      <td className="p-2">{jobsProcessing}</td>
                      <td className="p-2 text-muted-foreground">
                        Jobs atualmente em processamento
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Jobs Bloqueados</td>
                      <td className="p-2">{jobsBlocked}</td>
                      <td className="p-2 text-muted-foreground">
                        Jobs aguardando liberação
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">
                        Valor Total Processado
                      </td>
                      <td className="p-2">
                        R$ {metrics.totalAmount.toFixed(2)}
                      </td>
                      <td className="p-2 text-muted-foreground">
                        Soma de todos os valores processados
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
