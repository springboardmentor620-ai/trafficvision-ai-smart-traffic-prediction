import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, FileText, Loader2, Printer, Share2 } from "lucide-react";
import { toast } from "sonner";
import { generateReport } from "@/lib/traffic.functions";
import { PageHeader, SectionCard } from "@/components/tv/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTraffic } from "@/lib/use-traffic";

export const Route = createFileRoute("/dashboard/reports")({ component: Reports });

function download(name: string, format: string, payload: unknown) {
  const isCsv = format === "csv";
  const body = isCsv ? toCsv(payload) : JSON.stringify(payload, null, 2);
  const blob = new Blob([body], { type: isCsv ? "text/csv" : "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.toLowerCase().replace(/\s+/g, "-")}.${isCsv ? "csv" : "json"}`;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(payload: unknown): string {
  const rows = Object.entries(payload as Record<string, unknown>).flatMap(([key, value]) =>
    Array.isArray(value) && value.length && typeof value[0] === "object"
      ? [
          key,
          Object.keys(value[0] as object).join(","),
          ...value.map((r) => Object.values(r as object).join(",")),
          "",
        ]
      : [`${key},${String(value)}`],
  );
  return rows.join("\n");
}

function Reports() {
  const { reportTemplates } = useTraffic();
  const [format, setFormat] = useState("pdf");
  const run = useServerFn(generateReport);
  const build = useMutation({
    mutationFn: (vars: { name: string; kind: string; format: string }) =>
      run({ data: { name: vars.name, kind: vars.kind, period: "custom", format: vars.format as "pdf" | "csv" | "excel" } }),
    onSuccess: (row) => {
      download(row.name, row.format, row.payload);
      toast.success("Report generated from live data");
    },
    onError: (e: Error) => toast.error("Report failed", { description: e.message }),
  });
  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Generate, download, print and share operational traffic reports"
        actions={
          <>
            <Button variant="outline"><Printer className="mr-1.5 h-4 w-4" />Print</Button>
            <Button variant="outline"><Share2 className="mr-1.5 h-4 w-4" />Share</Button>
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
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" disabled={build.isPending} onClick={() => build.mutate({ name: r.name, kind: r.kind, format: "csv" })}>CSV</Button>
              <Button size="sm" className="bg-brand text-primary-foreground" disabled={build.isPending} onClick={() => build.mutate({ name: r.name, kind: r.kind, format: "pdf" })}>PDF</Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
