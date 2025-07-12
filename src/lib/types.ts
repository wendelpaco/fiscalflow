export interface JobItem {
  title: string;
  code: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  totalPrice: string;
}

export interface JobTotals {
  totalItems: string;
  amountToPay: string;
  paymentMethod: string;
  paymentAmount: string;
  taxInfo?: string;
  discount?: string;
  totalValue?: string;
}

export interface JobMetadata {
  numero?: string;
  serie?: string;
  dataEmissao?: string;
  protocoloAutorizacao?: string;
  nomeEmpresa?: string;
  cnpj?: string;
  items?: JobItem[];
  totals?: JobTotals;
  error?: string;
}

export type JobStatus = "PENDING" | "PROCESSING" | "DONE" | "ERROR" | "BLOCKED";

export interface Job {
  id: string;
  status: JobStatus;
  url: string;
  urlFinal: string;
  webhookUrl: string | null;
  createdAt: string;
  urlQueueId: string;
  processingStartedAt: string | null;
  processingEndedAt: string | null;
  processingDurationMs: number | null;
  metadata: JobMetadata | null;
}

export interface JobsResponse {
  jobs: Job[];
  total: number;
}
