"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface AnalyticsInsightsProps {
  metrics: {
    totalJobs: number;
    completedJobs: number;
    errorJobs: number;
    pendingJobs: number;
    avgProcessingTime: number;
    totalAmount: number;
  } | null;
}

export default function AnalyticsInsights({ metrics }: AnalyticsInsightsProps) {
  if (!metrics) return null;

  const generateInsights = () => {
    const insights = [];
    const successRate = (metrics.completedJobs / metrics.totalJobs) * 100;
    const errorRate = (metrics.errorJobs / metrics.totalJobs) * 100;

    // Insight sobre taxa de sucesso
    if (successRate >= 90) {
      insights.push({
        type: "positive",
        icon: CheckCircle,
        title: "Excelente Taxa de Sucesso",
        description: `${successRate.toFixed(
          1
        )}% dos jobs foram processados com sucesso.`,
        color: "text-green-600",
        bgColor: "bg-green-50",
      });
    } else if (successRate >= 70) {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Taxa de Sucesso Moderada",
        description: `${successRate.toFixed(
          1
        )}% dos jobs foram processados com sucesso. Considere investigar os erros.`,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      });
    } else {
      insights.push({
        type: "negative",
        icon: AlertTriangle,
        title: "Taxa de Sucesso Baixa",
        description: `${successRate.toFixed(
          1
        )}% dos jobs foram processados com sucesso. Ação necessária.`,
        color: "text-red-600",
        bgColor: "bg-red-50",
      });
    }

    // Insight sobre tempo de processamento
    if (metrics.avgProcessingTime < 5) {
      insights.push({
        type: "positive",
        icon: TrendingUp,
        title: "Processamento Rápido",
        description: `Tempo médio de ${metrics.avgProcessingTime.toFixed(
          2
        )}s por job. Performance excelente.`,
        color: "text-green-600",
        bgColor: "bg-green-50",
      });
    } else if (metrics.avgProcessingTime < 15) {
      insights.push({
        type: "warning",
        icon: TrendingDown,
        title: "Processamento Moderado",
        description: `Tempo médio de ${metrics.avgProcessingTime.toFixed(
          2
        )}s por job. Considere otimizações.`,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      });
    } else {
      insights.push({
        type: "negative",
        icon: TrendingDown,
        title: "Processamento Lento",
        description: `Tempo médio de ${metrics.avgProcessingTime.toFixed(
          2
        )}s por job. Otimização necessária.`,
        color: "text-red-600",
        bgColor: "bg-red-50",
      });
    }

    // Insight sobre volume de trabalho
    if (metrics.totalJobs > 100) {
      insights.push({
        type: "positive",
        icon: TrendingUp,
        title: "Alto Volume de Processamento",
        description: `${metrics.totalJobs} jobs processados. Sistema bem utilizado.`,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      });
    }

    // Insight sobre valor processado
    if (metrics.totalAmount > 10000) {
      insights.push({
        type: "positive",
        icon: TrendingUp,
        title: "Alto Valor Processado",
        description: `R$ ${metrics.totalAmount.toFixed(
          2
        )} em valores processados.`,
        color: "text-green-600",
        bgColor: "bg-green-50",
      });
    }

    // Insight sobre jobs pendentes
    if (metrics.pendingJobs > 10) {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "Jobs Pendentes",
        description: `${metrics.pendingJobs} jobs aguardando processamento.`,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
      });
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          Insights Automáticos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const IconComponent = insight.icon;
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${insight.bgColor} ${insight.color}`}
              >
                <div className="flex items-start gap-3">
                  <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{insight.title}</h4>
                    <p className="text-sm opacity-90">{insight.description}</p>
                  </div>
                  <Badge
                    variant={
                      insight.type === "positive"
                        ? "default"
                        : insight.type === "warning"
                        ? "secondary"
                        : "destructive"
                    }
                    className="flex-shrink-0"
                  >
                    {insight.type === "positive"
                      ? "Positivo"
                      : insight.type === "warning"
                      ? "Atenção"
                      : "Crítico"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
