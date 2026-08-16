export type AppRole = "admin" | "operator" | "analyst" | "viewer";

const LABELS: Record<AppRole, string> = {
  admin: "Admin",
  operator: "Traffic Operator",
  analyst: "Analyst",
  viewer: "Viewer",
};

export function roleLabel(role: string): string {
  return LABELS[role as AppRole] ?? "Viewer";
}
