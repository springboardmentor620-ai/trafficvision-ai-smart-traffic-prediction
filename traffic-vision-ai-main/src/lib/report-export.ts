export type ReportSection = {
  title: string;
  description?: string;
  columns: string[];
  rows: (string | number)[][];
};

export type ReportDocument = {
  kind: string;
  title: string;
  generatedAt: string;
  period: string;
  summary: string[];
  kpis: { label: string; value: string }[];
  sections: ReportSection[];
};

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const csvCell = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function fileBase(doc: ReportDocument) {
  return `${doc.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${doc.generatedAt.slice(0, 10)}`;
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Full multi-section CSV workbook with header block, KPIs, summary and every table. */
export function downloadReportCsv(doc: ReportDocument) {
  const lines: string[] = [];
  lines.push(csvCell(doc.title));
  lines.push(`Generated at,${csvCell(new Date(doc.generatedAt).toLocaleString("en-IN"))}`);
  lines.push(`Period,${csvCell(doc.period)}`);
  lines.push("");
  lines.push("EXECUTIVE SUMMARY");
  doc.summary.forEach((s) => lines.push(csvCell(s)));
  lines.push("");
  lines.push("KEY METRICS");
  lines.push("Metric,Value");
  doc.kpis.forEach((k) => lines.push(`${csvCell(k.label)},${csvCell(k.value)}`));
  for (const section of doc.sections) {
    lines.push("");
    lines.push(csvCell(section.title.toUpperCase()));
    if (section.description) lines.push(csvCell(section.description));
    lines.push(section.columns.map(csvCell).join(","));
    section.rows.forEach((r) => lines.push(r.map(csvCell).join(",")));
  }
  saveBlob(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }), `${fileBase(doc)}.csv`);
}

export function reportHtml(doc: ReportDocument) {
  const generated = new Date(doc.generatedAt).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" });
  const kpis = doc.kpis
    .map((k) => `<div class="kpi"><span>${esc(k.label)}</span><strong>${esc(k.value)}</strong></div>`)
    .join("");
  const sections = doc.sections
    .map(
      (s) => `<section>
        <h2>${esc(s.title)}</h2>
        ${s.description ? `<p class="muted">${esc(s.description)}</p>` : ""}
        <table>
          <thead><tr>${s.columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
          <tbody>${s.rows
            .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`)
            .join("")}</tbody>
        </table>
        <p class="rows">${s.rows.length} record(s)</p>
      </section>`,
    )
    .join("");

  return `<!doctype html><html lang="en"><head><meta charset="utf-8" />
<title>${esc(doc.title)}</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Inter, system-ui, sans-serif; margin: 0; padding: 40px; color: #0f172a; background: #fff; }
  header { border-bottom: 3px solid #2563eb; padding-bottom: 18px; margin-bottom: 24px; }
  .brand { font-size: 13px; letter-spacing: .16em; text-transform: uppercase; color: #2563eb; font-weight: 700; }
  h1 { margin: 6px 0 4px; font-size: 28px; }
  .muted { color: #64748b; font-size: 13px; margin: 2px 0; }
  .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 22px 0 28px; }
  .kpi { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; background: #f8fafc; }
  .kpi span { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #64748b; }
  .kpi strong { font-size: 17px; }
  ul.summary { padding-left: 18px; } ul.summary li { margin-bottom: 8px; line-height: 1.55; font-size: 14px; }
  section { margin-top: 30px; page-break-inside: auto; }
  h2 { font-size: 17px; border-left: 4px solid #2563eb; padding-left: 10px; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
  th { background: #eff6ff; text-align: left; }
  th, td { border: 1px solid #e2e8f0; padding: 5px 7px; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  .rows { font-size: 11px; color: #94a3b8; margin-top: 6px; }
  footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; }
  @media print { body { padding: 16px; } section { page-break-inside: avoid; } }
</style></head><body>
<header>
  <div class="brand">TrafficVision AI · Smart Traffic Prediction &amp; Congestion Management</div>
  <h1>${esc(doc.title)}</h1>
  <p class="muted">Generated ${esc(generated)} · Period: ${esc(doc.period)} · Bengaluru road network</p>
</header>
<h2>Executive summary</h2>
<ul class="summary">${doc.summary.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
<div class="kpis">${kpis}</div>
${sections}
<footer>Produced by TrafficVision AI from live PostgreSQL traffic records and Random Forest inference. Confidential — for traffic operations use.</footer>
</body></html>`;
}

/** Opens a print-ready view of the full report so the browser can save it as PDF. */
export function downloadReportPdf(doc: ReportDocument) {
  const html = reportHtml(doc);
  const win = window.open("", "_blank", "width=1100,height=900");
  if (!win) {
    saveBlob(new Blob([html], { type: "text/html;charset=utf-8" }), `${fileBase(doc)}.html`);
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 600);
}

export function printReport(doc: ReportDocument) {
  downloadReportPdf(doc);
}
