import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Trash2, UserCog } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/tv/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDirectory } from "@/lib/use-account";
import { useTraffic } from "@/lib/use-traffic";

export const Route = createFileRoute("/dashboard/users")({ component: UserManagement });

function UserManagement() {
  const { activityLogs, users } = useDirectory();
  const [q, setQ] = useState("");
  const list = users.filter((u) => (u.name + u.email + u.role).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        title="User management"
        subtitle="Admins, traffic operators, roles, permissions and account status"
        actions={<Button className="bg-brand text-primary-foreground"><Plus className="mr-1.5 h-4 w-4" />Add user</Button>}
      />

      <SectionCard
        title={`Users (${list.length})`}
        description="Search, edit roles and manage account state"
        actions={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="w-56 pl-9" placeholder="Search users" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        }
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="bg-brand grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold text-primary-foreground">
                        {u.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{u.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{u.role}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{u.city}</TableCell>
                  <TableCell>
                    <Badge className={u.status === "Active" ? "bg-success/10 text-success" : u.status === "Suspended" ? "bg-destructive/10 text-destructive" : "bg-warning/20 text-warning"}>
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost"><UserCog className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      <SectionCard title="Activity logs" description="Recent actions across the workspace">
        <ul className="space-y-2 text-sm">
          {activityLogs.map((l) => (
            <li key={l.id} className="glass-soft flex items-center justify-between gap-3 rounded-xl p-3">
              <span className="min-w-0 truncate">
                <b>{l.actor}</b> <span className="text-muted-foreground">{l.action} · {l.target}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{l.at}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </>
  );
}
