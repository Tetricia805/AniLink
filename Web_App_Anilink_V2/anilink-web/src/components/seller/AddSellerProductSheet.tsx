import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import type { SellerProductCreate } from "@/api/sellerProducts";

const CATEGORIES = ["medicines", "feeds", "supplies", "vaccines"];

interface AddSellerProductSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (data: SellerProductCreate) => void;
  isPending?: boolean;
}

export function AddSellerProductSheet({ open, onOpenChange, onCreate, isPending }: AddSellerProductSheetProps) {
  const { push } = useToast();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("medicines");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const reset = () => {
    setTitle("");
    setCategory("medicines");
    setPrice("");
    setStock("0");
    setDescription("");
    setImage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseInt(price.replace(/\D/g, ""), 10) || 0;
    const stockNum = Math.max(0, parseInt(stock, 10) || 0);
    if (!title.trim()) {
      push({ title: "Validation", description: "Title is required." });
      return;
    }
    const img = image.trim();
    onCreate?.({
      title: title.trim(),
      category,
      price: priceNum,
      stock: stockNum,
      description: description.trim() || undefined,
      imageUrls: img ? [img] : undefined,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add product</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Product name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
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
              <Label htmlFor="price">Price (UGX)</Label>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="45000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Image URL (optional)</Label>
            <Input
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!onCreate || isPending}>
              {isPending ? "Adding…" : "Add product"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
