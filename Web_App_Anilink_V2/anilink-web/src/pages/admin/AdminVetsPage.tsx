import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { useAdminVets, useApproveVet, useRejectVet } from "@/hooks/useAdmin";

export function AdminVetsPage() {
  const [tab, setTab] = useState<string>("pending");
  const [search, setSearch] = useState("");
  const [vetToReject, setVetToReject] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, isError } = useAdminVets({
    status: tab || undefined,
    search: search || undefined,
    page: 1,
    page_size: 50,
  });
  const approve = useApproveVet();
  const reject = useRejectVet();

  const items = data?.items ?? [];

  const handleApprove = (id: string) => {
    approve.mutate(id);
  };

  const handleRejectClick = (id: string, name: string) => {
    setVetToReject({ id, name });
    setRejectReason("");
  };

  const handleRejectConfirm = () => {
    if (!vetToReject) return;
    reject.mutate({ id: vetToReject.id, reason: rejectReason || undefined });
    setVetToReject(null);
  };

  if (isLoading && !data) return <LoadingSkeleton lines={8} />;
  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
          <p className="text-destructive">Could not load vets.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">Vets / Clinics</h1>
        <p className="text-muted-foreground mb-6">
          Approve and manage veterinarians and clinics.
        </p>

        <div className="flex flex-wrap gap-4 mb-6">
          <Input
            placeholder="Search by name, email, clinic"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            <Card>
              <CardContent className="p-0">
                {items.length === 0 ? (
                  <div className="p-8">
                    <EmptyState
                      title={tab === "pending" ? "No pending vets" : tab === "approved" ? "No approved vets" : "No rejected vets"}
                      description="Vets will appear here when they register."
                    />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium">Name</th>
                          <th className="text-left p-4 font-medium">Clinic</th>
                          <th className="text-left p-4 font-medium">Location</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          {tab === "pending" && <th className="text-left p-4 font-medium">Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((v) => (
                          <tr key={v.id} className="border-b last:border-0">
                            <td className="p-4">
                              <div>{v.name}</div>
                              <div className="text-muted-foreground text-xs">{v.email}</div>
                            </td>
                            <td className="p-4">{v.clinicName}</td>
                            <td className="p-4">{v.district ?? v.address ?? "—"}</td>
                            <td className="p-4">
                              <Badge variant={v.verified ? "default" : v.rejectionReason ? "destructive" : "secondary"}>
                                {v.verified ? "Approved" : v.rejectionReason ? "Rejected" : "Pending"}
                              </Badge>
                            </td>
                            {tab === "pending" && (
                              <td className="p-4 flex gap-2">
                                <Button size="sm" onClick={() => handleApprove(v.id)}>
                                  Approve
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleRejectClick(v.id, v.name)}>
                                  Reject
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={!!vetToReject} onOpenChange={(open) => !open && setVetToReject(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject vet</DialogTitle>
              <DialogDescription>
                {vetToReject && (
                  <>Reject {vetToReject.name}? Optionally provide a reason.</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <label className="text-sm font-medium">Reason (optional)</label>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Incomplete documentation"
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVetToReject(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleRejectConfirm}>Reject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
