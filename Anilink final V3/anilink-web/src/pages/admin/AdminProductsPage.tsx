import { useState } from "react";
import { motion } from "framer-motion";
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
import { useAdminProducts, useUpdateAdminProduct } from "@/hooks/useAdmin";
import type { AdminProduct } from "@/api/admin";

export function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isError } = useAdminProducts({
    search: search || undefined,
    status: status || undefined,
    page,
    page_size: pageSize,
  });
  const updateProduct = useUpdateAdminProduct();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const handleToggleActive = (id: string, current: boolean) => {
    updateProduct.mutate({ id, data: { is_active: !current } });
  };

  const handleToggleFlagged = (id: string, current: boolean) => {
    updateProduct.mutate({ id, data: { is_flagged: !current } });
  };

  const [noteProduct, setNoteProduct] = useState<AdminProduct | null>(null);
  const [noteValue, setNoteValue] = useState("");

  const handleEditNote = (p: AdminProduct) => {
    setNoteProduct(p);
    setNoteValue(p.adminNote ?? "");
  };

  const handleSaveNote = () => {
    if (!noteProduct) return;
    updateProduct.mutate({ id: noteProduct.id, data: { admin_note: noteValue || undefined } });
    setNoteProduct(null);
  };

  if (isLoading && !data) return <LoadingSkeleton lines={8} />;
  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
          <p className="text-destructive">Could not load products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Marketplace Products</h1>
          <p className="text-muted-foreground mb-6">Moderate and manage products.</p>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-4 mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Input
            placeholder="Search by title or seller"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="h-10 w-[140px] rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="flagged">Flagged</option>
          </select>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}>
        <Card className="border border-border">
          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No products found"
                  description="Try adjusting your search or filters."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Product</th>
                      <th className="text-left p-4 font-medium">Seller</th>
                      <th className="text-left p-4 font-medium">Price</th>
                      <th className="text-left p-4 font-medium">Stock</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p) => (
                      <tr key={p.id} className="border-b last:border-0">
                        <td className="p-4">
                          <div className="font-medium">{p.title}</div>
                          <div className="text-muted-foreground text-xs capitalize">{p.category}</div>
                          {p.adminNote && (
                            <div className="text-xs text-amber-600 mt-1">Note: {p.adminNote}</div>
                          )}
                        </td>
                        <td className="p-4">{p.sellerName ?? "—"}</td>
                        <td className="p-4">UGX {p.price.toLocaleString()}</td>
                        <td className="p-4">{p.stockQty}</td>
                        <td className="p-4 flex gap-1 flex-wrap">
                          <Badge variant={p.isActive ? "default" : "secondary"}>
                            {p.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {p.isFlagged && <Badge variant="destructive">Flagged</Badge>}
                        </td>
                        <td className="p-4 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(p.id, p.isActive)}
                          >
                            {p.isActive ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleFlagged(p.id, p.isFlagged)}
                          >
                            {p.isFlagged ? "Unflag" : "Flag"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNote(p)}
                          >
                            Note
                          </Button>
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
        </motion.div>

        <Dialog open={!!noteProduct} onOpenChange={(open) => !open && setNoteProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Admin note</DialogTitle>
              <DialogDescription>
                {noteProduct && <>Internal note for {noteProduct.title}</>}
              </DialogDescription>
            </DialogHeader>
            <Input
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              placeholder="e.g. Flagged for review"
              className="mt-2"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setNoteProduct(null)}>Cancel</Button>
              <Button onClick={handleSaveNote} disabled={updateProduct.isPending}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
