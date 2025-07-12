'use server';

/**
 * @fileOverview Summarizes key information from an NFC-e (Nota Fiscal de Consumidor Eletrônica).
 *
 * - summarizeNFCe - A function that takes an NFC-e data URL and returns a summary of the key information.
 * - SummarizeNFCeInput - The input type for the summarizeNFCe function.
 * - SummarizeNFCeOutput - The return type for the summarizeNFCe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNFCeInputSchema = z.object({
  nfceDataUri: z
    .string()
    .describe(
      "The NFC-e data as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeNFCeInput = z.infer<typeof SummarizeNFCeInputSchema>;

const SummarizeNFCeOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key information from the NFC-e.'),
});
export type SummarizeNFCeOutput = z.infer<typeof SummarizeNFCeOutputSchema>;

export async function summarizeNFCe(input: SummarizeNFCeInput): Promise<SummarizeNFCeOutput> {
  return summarizeNFCeFlow(input);
}

const summarizeNFCePrompt = ai.definePrompt({
  name: 'summarizeNFCePrompt',
  input: {schema: SummarizeNFCeInputSchema},
  output: {schema: SummarizeNFCeOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing Brazilian NFC-e (Nota Fiscal de Consumidor Eletrônica) documents.

  Given the data from the NFC-e, provide a concise summary of the key information, including the total amount, payment method, and a list of the items purchased.
  Focus on providing a clear and easy-to-understand summary that allows the user to quickly grasp the essential details of the transaction.

  NFC-e Data: {{media url=nfceDataUri}}`,
});

const summarizeNFCeFlow = ai.defineFlow(
  {
    name: 'summarizeNFCeFlow',
    inputSchema: SummarizeNFCeInputSchema,
    outputSchema: SummarizeNFCeOutputSchema,
  },
  async input => {
    const {output} = await summarizeNFCePrompt(input);
    return output!;
  }
);
