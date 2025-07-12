"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Filter } from "lucide-react";

interface AnalyticsFiltersProps {
  onFilterChange: (filters: { period: string; status: string }) => void;
}

export default function AnalyticsFilters({
  onFilterChange,
}: AnalyticsFiltersProps) {
  const [period, setPeriod] = useState("7d");
  const [status, setStatus] = useState("all");

  const handleFilterChange = () => {
    onFilterChange({ period, status });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de Análise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Período</label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Último dia</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="PENDING">Pendente</SelectItem>
                <SelectItem value="PROCESSING">Processando</SelectItem>
                <SelectItem value="DONE">Concluído</SelectItem>
                <SelectItem value="ERROR">Erro</SelectItem>
                <SelectItem value="BLOCKED">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={handleFilterChange} className="w-full sm:w-auto">
              <Calendar className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
