import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { useAdminUsers, useUpdateAdminUser } from "@/hooks/useAdmin";
import type { AdminUser } from "@/api/admin";

export function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isError } = useAdminUsers({
    search: search || undefined,
    role: role || undefined,
    status: status || undefined,
    page,
    page_size: pageSize,
  });
  const updateUser = useUpdateAdminUser();

  const [confirmUser, setConfirmUser] = useState<AdminUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<"role" | "deactivate" | "activate" | null>(null);
  const [newRole, setNewRole] = useState<string>("");

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const handleRoleChange = (user: AdminUser, role: string) => {
    if (role === user.role) return;
    setConfirmUser(user);
    setNewRole(role);
    setConfirmAction("role");
  };

  const handleDeactivate = (user: AdminUser) => {
    setConfirmUser(user);
    setConfirmAction("deactivate");
  };

  const handleActivate = (user: AdminUser) => {
    setConfirmUser(user);
    setConfirmAction("activate");
  };

  const executeConfirm = () => {
    if (!confirmUser) return;
    if (confirmAction === "role" && newRole) {
      updateUser.mutate({ id: confirmUser.id, data: { role: newRole } });
    } else if (confirmAction === "deactivate") {
      updateUser.mutate({ id: confirmUser.id, data: { is_active: false } });
    } else if (confirmAction === "activate") {
      updateUser.mutate({ id: confirmUser.id, data: { is_active: true } });
    }
    setConfirmUser(null);
    setConfirmAction(null);
  };

  if (isLoading && !data) return <LoadingSkeleton lines={8} />;
  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
          <p className="text-destructive">Could not load users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">Users</h1>
        <p className="text-muted-foreground mb-6">Manage platform users.</p>

        <div className="flex flex-wrap gap-4 mb-6">
          <Input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="h-10 w-[140px] rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All roles</option>
            <option value="OWNER">Owner</option>
            <option value="VET">Vet</option>
            <option value="SELLER">Seller</option>
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="h-10 w-[140px] rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No users found"
                  description="Try adjusting your search or filters."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Name</th>
                      <th className="text-left p-4 font-medium">Email</th>
                      <th className="text-left p-4 font-medium">Role</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((u) => (
                      <tr key={u.id} className="border-b last:border-0">
                        <td className="p-4">{u.name}</td>
                        <td className="p-4">{u.email}</td>
                        <td className="p-4">
                          <Badge variant="outline" className="capitalize">{u.role.toLowerCase()}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={u.is_active ? "default" : "secondary"}>
                            {u.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-4 flex gap-2 flex-wrap">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            className="h-8 w-[100px] rounded-md border border-input bg-background px-2 text-sm"
                          >
                            <option value="OWNER">Owner</option>
                            <option value="VET">Vet</option>
                            <option value="SELLER">Seller</option>
                          </select>
                          {u.is_active ? (
                            <Button variant="outline" size="sm" onClick={() => handleDeactivate(u)}>
                              Deactivate
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleActivate(u)}>
                              Activate
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-between items-center p-4 border-t">
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} · {total} total
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!confirmUser} onOpenChange={(open) => !open && setConfirmUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {confirmAction === "role" && "Change role"}
                {confirmAction === "deactivate" && "Deactivate user"}
                {confirmAction === "activate" && "Activate user"}
              </DialogTitle>
              <DialogDescription>
                {confirmUser && (
                  <>
                    {confirmAction === "role" && (
                      <>Change {confirmUser.name} to role {newRole}?</>
                    )}
                    {confirmAction === "deactivate" && (
                      <>Deactivate {confirmUser.name}? They will not be able to log in.</>
                    )}
                    {confirmAction === "activate" && (
                      <>Activate {confirmUser.name}? They will be able to log in again.</>
                    )}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmUser(null)}>Cancel</Button>
              <Button onClick={executeConfirm}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
