import { getJobById } from "@/lib/actions";
import { notFound } from "next/navigation";
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
import { AlertTriangle, Info, FileText, ShoppingCart, ListTree, Banknote } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await getJobById(params.id);

  if (!job) {
    notFound();
  }

  const formatDateTime = (date: string | null) => {
    if (!date) return 'N/A';
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
  }

  const formatDuration = (ms: number | null) => {
    if (ms === null) return "N/A";
    if (ms < 1000) return `${ms} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  }

  const hasItems = job.metadata?.items && job.metadata.items.length > 0;
  const hasTotals = job.metadata?.totals;

  return (
    <div className="space-y-6">
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
              <dd className="mt-1 font-semibold break-all text-foreground">{job.url}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">URL do Webhook</dt>
              <dd className="mt-1 font-semibold break-all text-foreground">{job.webhookUrl || 'N/A'}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Data de Criação</dt>
              <dd className="mt-1 font-semibold text-foreground">{formatDateTime(job.createdAt)}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Início do Processamento</dt>
              <dd className="mt-1 font-semibold text-foreground">{formatDateTime(job.processingStartedAt)}</dd>
            </div>
             <div>
              <dt className="font-medium text-muted-foreground">Fim do Processamento</dt>
              <dd className="mt-1 font-semibold text-foreground">{formatDateTime(job.processingEndedAt)}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Duração</dt>
              <dd className="mt-1 font-semibold text-foreground">{formatDuration(job.processingDurationMs)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary"/>
                Dados da Nota Fiscal
            </CardTitle>
            <CardDescription>Informações extraídas do documento fiscal.</CardDescription>
        </CardHeader>
        <CardContent>
            {job.metadata?.error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Erro no Processamento</AlertTitle>
                    <AlertDescription>{job.metadata.error}</AlertDescription>
                </Alert>
            )}
            {!job.metadata && job.status !== 'ERROR' && (
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Aguardando Processamento</AlertTitle>
                    <AlertDescription>Os metadados da nota fiscal estarão disponíveis assim que o job for concluído.</AlertDescription>
                </Alert>
            )}
            {job.metadata && !job.metadata.error && (
                <div className="space-y-6">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6 text-sm">
                        <div>
                            <dt className="font-medium text-muted-foreground">Empresa</dt>
                            <dd className="mt-1 font-semibold text-foreground">{job.metadata.nomeEmpresa || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-muted-foreground">CNPJ</dt>
                            <dd className="mt-1 font-semibold text-foreground">{job.metadata.cnpj || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-muted-foreground">Data de Emissão</dt>
                            <dd className="mt-1 font-semibold text-foreground">{job.metadata.dataEmissao || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-muted-foreground">Número da Nota</dt>
                            <dd className="mt-1 font-semibold text-foreground">{job.metadata.numero || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-muted-foreground">Série</dt>
                            <dd className="mt-1 font-semibold text-foreground">{job.metadata.serie || 'N/A'}</dd>
                        </div>
                    </dl>

                    {hasItems && (
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                                <ShoppingCart className="w-5 h-5"/>
                                Itens Comprados
                            </h3>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Produto</TableHead>
                                            <TableHead>Qtd.</TableHead>
                                            <TableHead>Preço Un.</TableHead>
                                            <TableHead className="text-right">Preço Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {job.metadata.items?.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item.title}</TableCell>
                                                <TableCell>{item.quantity} {item.unit}</TableCell>
                                                <TableCell>R$ {item.unitPrice}</TableCell>
                                                <TableCell className="text-right">R$ {item.totalPrice}</TableCell>
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
                                <Banknote className="w-5 h-5"/>
                                Totais e Pagamento
                            </h3>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm p-4 border rounded-lg">
                                 <div>
                                    <dt className="font-medium text-muted-foreground">Total de Itens</dt>
                                    <dd className="mt-1 font-semibold text-foreground">{job.metadata.totals?.totalItems || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-muted-foreground">Método de Pagamento</dt>
                                    <dd className="mt-1 font-semibold text-foreground">{job.metadata.totals?.paymentMethod || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-muted-foreground">Valor Pago</dt>
                                    <dd className="mt-1 font-semibold text-foreground">R$ {job.metadata.totals?.paymentAmount || 'N/A'}</dd>
                                </div>
                                 <div>
                                    <dt className="font-medium text-muted-foreground">Valor Total a Pagar</dt>
                                    <dd className="mt-1 text-xl font-bold text-primary">R$ {job.metadata.totals?.amountToPay || 'N/A'}</dd>
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
