"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Job } from "./types";

const API_URL = "http://192.168.0.104:3000";
const AUTH_TOKEN = "17bcc4e2-416e-4172-9192-d874b60478ef";

const CreateJobSchema = z.object({
  url: z.string().url({ message: "Por favor, insira uma URL válida." }),
  webhookUrl: z
    .string()
    .url({ message: "A URL do webhook deve ser válida." })
    .optional()
    .or(z.literal(""))
    .transform((val) => {
      return val === "" ? undefined : val;
    }),
});

export async function createJob(prevState: any, formData: FormData) {
  const validatedFields = CreateJobSchema.safeParse({
    url: formData.get("url"),
    webhookUrl: formData.get("webhookUrl"),
  });

  if (!validatedFields.success) {
    return {
      type: "error",
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Por favor, corrija os erros no formulário.",
    };
  }

  const { url, webhookUrl } = validatedFields.data;

  try {
    const requestBody = {
      url,
      ...(webhookUrl && { webhookUrl }),
    };

    const response = await fetch(`${API_URL}/queue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        type: "error",
        message: `Falha ao criar o job: ${
          errorData.message || response.statusText
        }`,
      };
    }

    const newJob = await response.json();

    revalidatePath("/");
    revalidatePath("/jobs");

    return {
      type: "success",
      message: `Job ${newJob.jobId} criado com sucesso!`,
    };
  } catch (error) {
    if (error instanceof Error) {
      return { type: "error", message: `Erro de conexão: ${error.message}` };
    }
    return {
      type: "error",
      message: "Ocorreu um erro desconhecido ao se conectar com a API.",
    };
  }
}

export async function createMassJobs() {
  // Esta função pode ser implementada para criar jobs em massa na API real, se necessário.
  return {
    message: `Função de criação em massa não implementada para API real.`,
  };
}

// As funções getJobs e getJobById foram removidas pois só faziam sentido com dados mockados.
