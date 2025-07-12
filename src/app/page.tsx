import JobCreationForm from "@/components/job-creation-form";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">FiscalFlow</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Envie suas notas fiscais para processamento em fila.
        </p>
      </div>
      <JobCreationForm />
    </div>
  );
}
