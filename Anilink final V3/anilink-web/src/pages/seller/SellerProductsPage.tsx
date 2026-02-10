import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Pencil, Archive, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useSellerProducts, useCreateSellerProduct, useUpdateSellerProduct } from "@/hooks/useSellerProducts";
import { AddSellerProductSheet } from "@/components/seller/AddSellerProductSheet";
import { EditSellerProductSheet } from "@/components/seller/EditSellerProductSheet";
import { useToast } from "@/components/ui/use-toast";
import { staggerItem, cardHoverClass } from "@/lib/motion";

/** UI product shape (mapped from API DTO). */
interface UiProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  active?: boolean;
  vetApproved?: boolean;
  image?: string;
  description?: string;
}

export function SellerProductsPage() {
  const { data: products = [], isLoading, isError } = useSellerProducts();
  const createProduct = useCreateSellerProduct();
  const updateProduct = useUpdateSellerProduct();
  const { push } = useToast();

  const [addOpen, setAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<UiProduct | null>(null);
  const [stockEditingId, setStockEditingId] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState("");

  const activeProducts = products.filter((p) => (p as UiProduct).active !== false);
  const archivedProducts = products.filter((p) => (p as UiProduct).active === false);

  const handleArchive = (_p: UiProduct) => {
    push({ title: "Archive", description: "Archive is managed by admin. Contact support." });
  };

  const handleActivate = (_p: UiProduct) => {
    push({ title: "Restore", description: "Restore is managed by admin. Contact support." });
  };

  const handleStockStart = (p: UiProduct) => {
    setStockEditingId(p.id);
    setStockValue(String(p.stock));
  };

  const handleStockSave = (id: string) => {
    const n = parseInt(stockValue, 10);
    if (!Number.isNaN(n) && n >= 0) {
      updateProduct.mutate({ id, data: { stock: n } });
    }
    setStockEditingId(null);
    setStockValue("");
  };

  const handleDelete = (_p: UiProduct) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    push({ title: "Delete", description: "Delete is not yet supported." });
  };

  if (isLoading) return <LoadingSkeleton lines={8} />;
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-destructive">Could not load products.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2">Products</h1>
            <p className="text-muted-foreground">Manage your marketplace listings.</p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Add product
          </Button>
        </motion.div>

        {products.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <Card className="border border-border">
            <CardContent className="p-8">
              <EmptyState
                title="No products yet"
                description="Add products to sell on the AniLink marketplace. Feeds, medicines, and veterinary supplies."
                action={
                  <Button onClick={() => setAddOpen(true)}>Add product</Button>
                }
              />
            </CardContent>
          </Card>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
          >
            {activeProducts.map((product) => (
              <motion.div key={product.id} variants={staggerItem}>
              <ProductRow
                key={product.id}
                product={product as UiProduct}
                isStockEditing={stockEditingId === product.id}
                stockValue={stockValue}
                onStockValueChange={setStockValue}
                onStockStart={handleStockStart}
                onStockSave={handleStockSave}
                onEdit={() => setEditingProduct(product as UiProduct)}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
              </motion.div>
            ))}
            {archivedProducts.length > 0 && (
              <>
                <h2 className="text-sm font-medium text-muted-foreground mt-6">Archived</h2>
                {archivedProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product as UiProduct}
                    isStockEditing={stockEditingId === product.id}
                    stockValue={stockValue}
                    onStockValueChange={setStockValue}
                    onStockStart={handleStockStart}
                    onStockSave={handleStockSave}
                    onEdit={() => setEditingProduct(product as UiProduct)}
                    onArchive={handleActivate}
                    onDelete={handleDelete}
                    archiveLabel="Restore"
                  />
                ))}
              </>
            )}
          </motion.div>
        )}
      </div>

      <AddSellerProductSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreate={createProduct.mutate}
        isPending={createProduct.isPending}
      />
      <EditSellerProductSheet
        product={editingProduct}
        open={!!editingProduct}
        onOpenChange={(open: boolean) => !open && setEditingProduct(null)}
        onUpdate={updateProduct.mutate}
        isPending={updateProduct.isPending}
      />
    </div>
  );
}

interface ProductRowProps {
  product: UiProduct;
  isStockEditing: boolean;
  stockValue: string;
  onStockValueChange: (v: string) => void;
  onStockStart: (p: UiProduct) => void;
  onStockSave: (id: string) => void;
  onEdit: () => void;
  onArchive: (p: UiProduct) => void;
  onDelete: (p: UiProduct) => void;
  archiveLabel?: string;
}

function ProductRow({
  product,
  isStockEditing,
  stockValue,
  onStockValueChange,
  onStockStart,
  onStockSave,
  onEdit,
  onArchive,
  onDelete,
  archiveLabel = "Archive",
}: ProductRowProps) {
  return (
    <Card className={`border border-border ${cardHoverClass}`}>
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted">
          {product.image ? (
            <img src={product.image} alt="" className="h-full w-full object-cover rounded-lg" />
          ) : (
            <Package className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-medium">{product.title}</span>
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
            {product.vetApproved && (
              <Badge variant="default" className="bg-secondary text-xs">
                Vet-approved
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            UGX {product.price.toLocaleString()} · Stock:{" "}
            {isStockEditing ? (
              <span className="inline-flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  value={stockValue}
                  onChange={(e) => onStockValueChange(e.target.value)}
                  className="w-20 h-7 text-sm inline"
                />
                <Button size="sm" variant="ghost" onClick={() => onStockSave(product.id)}>
                  Save
                </Button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onStockStart(product)}
                className="underline hover:no-underline"
              >
                {product.stock}
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onArchive(product)}
          >
            <Archive className="h-4 w-4 mr-1" />
            {archiveLabel}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(product)}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
