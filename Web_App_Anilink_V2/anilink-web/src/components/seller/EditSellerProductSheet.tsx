import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { SellerProductUpdate } from "@/api/sellerProducts";

const CATEGORIES = ["medicines", "feeds", "supplies", "vaccines"];

interface UiProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  image?: string;
}

interface EditSellerProductSheetProps {
  product: UiProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (params: { id: string; data: SellerProductUpdate }) => void;
  isPending?: boolean;
}

export function EditSellerProductSheet({
  product,
  open,
  onOpenChange,
  onUpdate,
  isPending,
}: EditSellerProductSheetProps) {
  const { push } = useToast();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("medicines");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setCategory(product.category);
      setPrice(String(product.price));
      setStock(String(product.stock));
      setDescription(product.description ?? "");
      setImage(product.image ?? "");
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !onUpdate) return;
    const priceNum = parseInt(price.replace(/\D/g, ""), 10) || 0;
    const stockNum = Math.max(0, parseInt(stock, 10) || 0);
    if (!title.trim()) {
      push({ title: "Validation", description: "Title is required." });
      return;
    }
    const img = image.trim();
    onUpdate({
      id: product.id,
      data: {
        title: title.trim(),
        category,
        price: priceNum,
        stock: stockNum,
        description: description.trim() || undefined,
        imageUrls: img ? [img] : undefined,
      },
    });
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit product</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <select
              id="edit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-input-background px-3 py-1 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (UGX)</Label>
              <Input
                id="edit-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="45000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stock">Stock</Label>
              <Input
                id="edit-stock"
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-image">Image URL (optional)</Label>
            <Input
              id="edit-image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
