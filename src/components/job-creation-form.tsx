
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { createJob, createMassJobs } from "@/lib/actions";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Layers } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const FormSchema = z.object({
  url: z.string().url({ message: "Por favor, insira uma URL válida." }),
  webhookUrl: z.string().url({ message: "A URL do webhook deve ser válida." }).optional().or(z.literal('')),
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <Send />}
      Enviar para Fila
    </Button>
  );
}

function MassSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            variant="outline"
            disabled={pending}
        >
            {pending ? <Loader2 className="animate-spin" /> : <Layers />}
            Criar Jobs em Massa
        </Button>
    )
}

export default function JobCreationForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useActionState(createJob, {
    type: "",
    message: "",
  });

  const massCreateAction = async () => {
    const result = await createMassJobs();
    toast({
        title: "Criação em Massa",
        description: result.message,
        variant: "default",
    });
  }

  const { register, formState: { errors }, reset } = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: { url: "", webhookUrl: "" },
  });

  useEffect(() => {
    if (state?.type === "success") {
      toast({
        title: "Sucesso!",
        description: state.message,
        variant: "default",
      });
      reset();
      formRef.current?.reset();
    } else if (state?.type === "error") {
      toast({
        title: "Erro!",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast, reset]);


  return (
    <Card className="max-w-2xl mx-auto">
      <form ref={formRef} action={formAction}>
        <CardHeader>
          <CardTitle>Criar Novo Job de Processamento</CardTitle>
          <CardDescription>
            Insira a URL de uma nota fiscal para adicioná-la à fila de processamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL da NFCe (obrigatório)</Label>
            <Input
              id="url"
              {...register("url")}
              placeholder="https://nfce.fazenda.gov.br/..."
            />
            {errors.url && <p className="text-sm text-destructive">{errors.url.message}</p>}
            {state?.errors?.url && <p className="text-sm text-destructive">{state.errors.url[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">URL do Webhook (opcional)</Label>
            <Input
              id="webhookUrl"
              {...register("webhookUrl")}
              placeholder="https://meusistema.com/webhook"
            />
            {errors.webhookUrl && <p className="text-sm text-destructive">{errors.webhookUrl.message}</p>}
            {state?.errors?.webhookUrl && <p className="text-sm text-destructive">{state.errors.webhookUrl[0]}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <SubmitButton />
        </CardFooter>
      </form>
      <Separator className="my-4" />
        <form action={massCreateAction}>
            <CardFooter className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">Ou crie jobs de teste em massa.</p>
                <MassSubmitButton />
            </CardFooter>
        </form>
    </Card>
  );
}
