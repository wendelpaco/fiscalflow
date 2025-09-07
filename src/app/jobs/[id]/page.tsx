"use client";
import { notFound, useParams } from "next/navigation";
import JobStatusBadge from "@/components/job-status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertTriangle,
  Info,
  FileText,
  ShoppingCart,
  ListTree,
  Banknote,
  ArrowLeft,
} from "lucide-react";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

function parseEmissaoDate(dateStr: string) {
  // Exemplo: "14/06/2025 13:23:17-03:00"
  return parse(dateStr, "dd/MM/yyyy HH:mm:ssXXX", new Date());
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const fetchJob = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";
    const res = await fetch(`${baseUrl}/api/status/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Erro ao buscar job");
    return res.json();
  };

  const {
    data: job,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["job", id],
    queryFn: fetchJob,
    refetchOnWindowFocus: true,
    enabled: !!id,
  });

  const formatDateTime = (date: string | null) => {
    if (!date) return "N/A";
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
  };

  function formatDuration(ms: number | null) {
    if (ms === null) return "N/A";
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
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">Carregando detalhes do job...</div>
    );
  }
  if (isError || !job) {
    return (
      <div className="text-center text-destructive py-8">
        Erro ao carregar detalhes do job.
      </div>
    );
  }

  const hasItems = job.metadata?.items && job.metadata.items.length > 0;
  const hasTotals = job.metadata?.totals;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <CardTitle>Detalhes do Job</CardTitle>
              <CardDescription className="break-all">{job.id}</CardDescription>
            </div>
            <JobStatusBadge status={job.status} />
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6 text-sm">
            <div>
              <dt className="font-medium text-muted-foreground">URL da NFCe</dt>
              <dd className="mt-1 font-semibold break-all text-foreground">
                {job.url}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                URL do Webhook
              </dt>
              <dd className="mt-1 font-semibold break-all text-foreground">
                {job.webhookUrl || "N/A"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                Data de Criação
              </dt>
              <dd className="mt-1 font-semibold text-foreground">
                {formatDateTime(job.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                Início do Processamento
              </dt>
              <dd className="mt-1 font-semibold text-foreground">
                {formatDateTime(job.processingStartedAt)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">
                Fim do Processamento
              </dt>
              <dd className="mt-1 font-semibold text-foreground">
                {formatDateTime(job.processingEndedAt)}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Duração</dt>
              <dd className="mt-1 font-semibold text-foreground">
                {formatDuration(job.processingDurationMs)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Dados da Nota Fiscal
          </CardTitle>
          <CardDescription>
            Informações extraídas do documento fiscal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {job.metadata?.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro no Processamento</AlertTitle>
              <AlertDescription>{job.metadata.error}</AlertDescription>
            </Alert>
          )}
          {!job.metadata && job.status !== "ERROR" && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Aguardando Processamento</AlertTitle>
              <AlertDescription>
                Os metadados da nota fiscal estarão disponíveis assim que o job
                for concluído.
              </AlertDescription>
            </Alert>
          )}
          {job.metadata && !job.metadata.error && (
            <div className="space-y-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6 text-sm">
                <div>
                  <dt className="font-medium text-muted-foreground">Empresa</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {job.metadata.nomeEmpresa || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">CNPJ</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {job.metadata.cnpj || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Data de Emissão
                  </dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {job.metadata.dataEmissao
                      ? format(
                          parseEmissaoDate(job.metadata.dataEmissao),
                          "dd/MM/yyyy 'às' HH:mm:ss",
                          { locale: ptBR }
                        )
                      : "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Número da Nota
                  </dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {job.metadata.numero || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">Série</dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {job.metadata.serie || "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-muted-foreground">
                    Protocolo de Autorização
                  </dt>
                  <dd className="mt-1 font-semibold text-foreground">
                    {job.metadata.protocoloAutorizacao || "N/A"}
                  </dd>
                </div>
              </dl>

              {hasItems && (
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-5 h-5" />
                    Itens Comprados
                  </h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead>Qtd.</TableHead>
                          <TableHead>Preço Un.</TableHead>
                          <TableHead className="text-right">
                            Preço Total
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {job.metadata.items?.map((item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {item.title}
                            </TableCell>
                            <TableCell>
                              {item.quantity} {item.unit}
                            </TableCell>
                            <TableCell>R$ {item.unitPrice}</TableCell>
                            <TableCell className="text-right">
                              R$ {item.totalPrice}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {hasTotals && (
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <Banknote className="w-5 h-5" />
                    Totais e Pagamento
                  </h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm p-4 border rounded-lg">
                    <div>
                      <dt className="font-medium text-muted-foreground">
                        Total de Itens
                      </dt>
                      <dd className="mt-1 font-semibold text-foreground">
                        {job.metadata.totals?.totalItems || "N/A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">
                        Método de Pagamento
                      </dt>
                      <dd className="mt-1 font-semibold text-foreground">
                        {job.metadata.totals?.paymentMethod || "N/A"}
                      </dd>
                    </div>
                    {job.metadata.totals?.taxInfo && (
                      <div>
                        <dt className="font-medium text-muted-foreground">
                          Informações de Imposto
                        </dt>
                        <dd className="mt-1 font-semibold text-foreground">
                          R$ {job.metadata.totals.taxInfo}
                        </dd>
                      </div>
                    )}
                    {job.metadata.totals?.discount && (
                      <div>
                        <dt className="font-medium text-muted-foreground">
                          Desconto
                        </dt>
                        <dd className="mt-1 font-semibold text-foreground">
                          R$ {job.metadata.totals.discount}
                        </dd>
                      </div>
                    )}
                    {job.metadata.totals?.totalValue && (
                      <div>
                        <dt className="font-medium text-muted-foreground">
                          Valor Total
                        </dt>
                        <dd className="mt-1 font-semibold text-foreground">
                          R$ {job.metadata.totals.totalValue}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="font-medium text-muted-foreground">
                        Valor Pago
                      </dt>
                      <dd className="mt-1 font-semibold text-foreground">
                        R$ {job.metadata.totals?.paymentAmount || "N/A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">
                        Valor Total a Pagar
                      </dt>
                      <dd className="mt-1 text-xl font-bold text-primary">
                        R$ {job.metadata.totals?.amountToPay || "N/A"}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
