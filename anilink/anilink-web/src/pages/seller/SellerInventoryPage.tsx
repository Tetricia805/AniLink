import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";

export function SellerInventoryPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2">Inventory</h1>
        <p className="text-muted-foreground mb-6">Track stock levels for your products.</p>
        <Card>
          <CardContent className="p-8">
            <EmptyState
              title="Inventory"
              description="Manage stock levels (coming soon)."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
