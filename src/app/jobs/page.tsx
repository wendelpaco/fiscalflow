import { getJobs } from "@/lib/actions";
import JobsTable from "@/components/jobs-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = 'force-dynamic'

export default async function JobsPage() {
  const jobs = await getJobs();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Fila de Processamento</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Acompanhe o status de todos os jobs de processamento de NFCe.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Jobs</CardTitle>
          <CardDescription>
            Lista de todos os jobs criados.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <JobsTable initialJobs={jobs} />
        </CardContent>
      </Card>
    </div>
  );
}
