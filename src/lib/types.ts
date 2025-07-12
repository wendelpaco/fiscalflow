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
}

export interface JobMetadata {
  numero?: string;
  serie?: string;
  dataEmissao?: string;
  nomeEmpresa?: string;
  cnpj?: string;
  items?: JobItem[];
  totals?: JobTotals;
  error?: string;
}

export type JobStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'ERROR';

export interface Job {
  id: string;
  status: JobStatus;
  url: string;
  webhookUrl: string | null;
  createdAt: string;
  processingStartedAt: string | null;
  processingEndedAt: string | null;
  processingDurationMs: number | null;
  metadata: JobMetadata | null;
}
