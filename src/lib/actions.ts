'use server'

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Job } from './types';

const API_URL = 'http://localhost:3000';
const AUTH_TOKEN = '5b289e19-c6f0-4f27-bd42-1e6b46fb82f5';

// Mock database
let jobs: Job[] = [
    {
        id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        status: 'DONE',
        url: 'https://nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=some_long_key',
        webhookUrl: null,
        createdAt: '2024-07-10T14:33:48.425Z',
        processingStartedAt: '2024-07-10T14:33:44.937Z',
        processingEndedAt: '2024-07-10T14:33:48.432Z',
        processingDurationMs: 3495,
        metadata: {
            numero: '249769',
            serie: '11',
            dataEmissao: '07/05/2024 12:55:26-03:00',
            nomeEmpresa: 'SUPERMERCADO ZONA SUL SA F42',
            cnpj: '33.381.286/0075-98',
            items: [
                { title: 'QUEIJO MINAS FRESCAL', code: '12345', quantity: '1', unit: 'UN', unitPrice: '25,50', totalPrice: '25,50' },
                { title: 'PÃO DE FORMA INTEGRAL', code: '67890', quantity: '2', unit: 'UN', unitPrice: '8,75', totalPrice: '17,50' },
            ],
            totals: { totalItems: '3', amountToPay: '43,00', paymentMethod: 'Cartão de Crédito', paymentAmount: '43,00' }
        }
    },
    {
        id: 'b2c3d4e5-f6a7-8901-2345-67890abcdef0',
        status: 'ERROR',
        url: 'https://nfce.fazenda.sp.gov.br/portalnfce/sistema/qrcode.xhtml?p=another_key',
        webhookUrl: 'https://my-webhook-url.com/notify',
        createdAt: '2024-07-11T10:20:15.123Z',
        processingStartedAt: '2024-07-11T10:20:10.000Z',
        processingEndedAt: '2024-07-11T10:20:15.200Z',
        processingDurationMs: 5200,
        metadata: { error: 'Não foi possível acessar a URL da NFCe. A página retornou status 404.' }
    },
    {
        id: 'c3d4e5f6-a7b8-9012-3456-7890abcdef12',
        status: 'PROCESSING',
        url: 'http://exemplo.com/nfce3',
        webhookUrl: null,
        createdAt: '2024-07-12T11:00:00.000Z',
        processingStartedAt: '2024-07-12T11:00:05.000Z',
        processingEndedAt: null,
        processingDurationMs: null,
        metadata: null
    },
    {
        id: 'd4e5f6a7-b8c9-0123-4567-890abcdef234',
        status: 'PENDING',
        url: 'http://exemplo.com/nfce4',
        webhookUrl: 'https://my-webhook-url.com/notify',
        createdAt: '2024-07-12T11:05:00.000Z',
        processingStartedAt: null,
        processingEndedAt: null,
        processingDurationMs: null,
        metadata: null
    }
];

// To simulate a real API, we'll have this helper function
// In a real app, this would be a proper fetch call.
async function mockApiCall<T>(data: T, delay = 500): Promise<{ success: boolean; data?: T; error?: string }> {
    return new Promise(resolve => {
        setTimeout(() => {
            // Simulate random API failures
            if (Math.random() > 0.95) {
                resolve({ success: false, error: "Erro de conexão com a API." });
            } else {
                resolve({ success: true, data });
            }
        }, delay);
    });
}

const CreateJobSchema = z.object({
  url: z.string().url({ message: "Por favor, insira uma URL válida." }),
  webhookUrl: z.string().url({ message: "A URL do webhook deve ser válida." }).optional().or(z.literal('')),
});

export async function createJob(prevState: any, formData: FormData) {
    const validatedFields = CreateJobSchema.safeParse({
        url: formData.get('url'),
        webhookUrl: formData.get('webhookUrl'),
    });

    if (!validatedFields.success) {
        return {
            type: 'error',
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Por favor, corrija os erros no formulário.',
        };
    }

    const { url, webhookUrl } = validatedFields.data;

    const newJob: Job = {
        id: crypto.randomUUID(),
        status: 'PENDING',
        url,
        webhookUrl: webhookUrl || null,
        createdAt: new Date().toISOString(),
        processingStartedAt: null,
        processingEndedAt: null,
        processingDurationMs: null,
        metadata: null
    };

    const result = await mockApiCall(newJob);

    if (!result.success || !result.data) {
        return { type: 'error', message: result.error || "Falha ao criar o job." }
    }
    
    jobs.unshift(result.data); // Add to the top of the list

    revalidatePath('/');
    revalidatePath('/jobs');

    return { type: 'success', message: `Job ${result.data.id} criado com sucesso!` };
}

export async function createMassJobs() {
    const massUrls = [
        'https://nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=mass_job_1',
        'https://nfce.fazenda.sp.gov.br/portalnfce/sistema/qrcode.xhtml?p=mass_job_2',
        'http://invalid-url.com/nfce_mass_3'
    ];

    let createdCount = 0;
    for (const url of massUrls) {
        const newJob: Job = {
            id: crypto.randomUUID(),
            status: 'PENDING',
            url,
            webhookUrl: null,
            createdAt: new Date().toISOString(),
            processingStartedAt: null,
            processingEndedAt: null,
            processingDurationMs: null,
            metadata: null
        };
        const result = await mockApiCall(newJob, 100);
        if(result.success && result.data) {
            jobs.unshift(result.data);
            createdCount++;
        }
    }
    
    revalidatePath('/jobs');
    return { message: `${createdCount} de ${massUrls.length} jobs em massa foram criados.` };
}

export async function getJobs(): Promise<Job[]> {
    // Return a copy to avoid mutation
    return JSON.parse(JSON.stringify(jobs));
}

export async function getJobById(id: string): Promise<Job | undefined> {
    return jobs.find(job => job.id === id);
}
