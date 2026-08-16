import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, FileText, Loader2, Mail, Printer, Share2 } from "lucide-react";
import { toast } from "sonner";
import { emailReport, generateReport } from "@/lib/traffic.functions";
import { PageHeader, SectionCard } from "@/components/tv/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTraffic } from "@/lib/use-traffic";
import { downloadReportCsv, downloadReportPdf, type ReportDocument } from "@/lib/report-export";

export const Route = createFileRoute("/dashboard/reports")({ component: Reports });

function Reports() {
  const { reportTemplates } = useTraffic();
  const [format, setFormat] = useState("pdf");
  const [last, setLast] = useState<ReportDocument | null>(null);
  const run = useServerFn(generateReport);
  const mail = useServerFn(emailReport);

  const build = useMutation({
    mutationFn: (vars: { name: string; kind: string; format: string }) =>
      run({ data: { name: vars.name, kind: vars.kind, period: "custom", format: vars.format as "pdf" | "csv" | "excel" } }),
    onSuccess: (row) => {
      const doc = row.payload as unknown as ReportDocument;
      setLast(doc);
      if (row.format === "csv" || row.format === "excel") downloadReportCsv(doc);
      else downloadReportPdf(doc);
      toast.success("Report generated from live data", {
        description: `${doc.sections.length} sections · ${doc.sections.reduce((s, x) => s + x.rows.length, 0)} records`,
      });
    },
    onError: (e: Error) => toast.error("Report failed", { description: e.message }),
  });

  const send = useMutation({
    mutationFn: (vars: { name: string; kind: string }) => mail({ data: { name: vars.name, kind: vars.kind } }),
    onSuccess: (res) => toast.success("Report emailed", { description: `Sent to ${res.recipient}` }),
    onError: (e: Error) => toast.error("Could not email the report", { description: e.message }),
  });

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Generate, download, print, email and share operational traffic reports"
        actions={
          <>
            <Button variant="outline" disabled={!last} onClick={() => last && downloadReportPdf(last)}>
              <Printer className="mr-1.5 h-4 w-4" />Print
            </Button>
            <Button variant="outline" disabled={!last} onClick={() => last && downloadReportCsv(last)}>
              <Share2 className="mr-1.5 h-4 w-4" />Export CSV
            </Button>
            <Button
              variant="outline"
              disabled={send.isPending}
              onClick={() => send.mutate({ name: "Traffic summary report", kind: "summary" })}
            >
              {send.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Mail className="mr-1.5 h-4 w-4" />}
              Send to mail
            </Button>
            <Button
              className="bg-brand text-primary-foreground"
              disabled={build.isPending}
              onClick={() => build.mutate({ name: "Traffic summary report", kind: "summary", format: "pdf" })}
            >
              {build.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}
              Generate report
            </Button>
          </>
        }
      />

      <SectionCard title="Custom report builder" description="Pick a window and format, then generate">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input type="date" defaultValue="2026-07-01" />
          <Input type="date" defaultValue="2026-08-02" />
          <select
            className="h-10 rounded-xl border bg-card px-3 text-sm"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="excel">XLSX</option>
          </select>
          <Button
            className="bg-brand text-primary-foreground"
            disabled={build.isPending}
            onClick={() => build.mutate({ name: "Custom traffic report", kind: "summary", format })}
          >
            Build report
          </Button>
        </div>
      </SectionCard>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reportTemplates.map((r) => (
          <article key={r.name} className="glass card-hover rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </span>
              <Badge variant="outline">{r.pages} pages</Badge>
            </div>
            <h3 className="mt-4 font-display text-base font-bold">{r.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={build.isPending} onClick={() => build.mutate({ name: r.name, kind: r.kind, format: "csv" })}>CSV</Button>
              <Button size="sm" className="bg-brand text-primary-foreground" disabled={build.isPending} onClick={() => build.mutate({ name: r.name, kind: r.kind, format: "pdf" })}>PDF</Button>
              <Button size="sm" variant="ghost" disabled={send.isPending} onClick={() => send.mutate({ name: r.name, kind: r.kind })}>
                <Mail className="mr-1.5 h-4 w-4" />Send to mail
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
