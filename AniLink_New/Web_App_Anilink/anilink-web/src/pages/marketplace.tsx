import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ShoppingCart,
  Plus,
  CheckCircle2,
  Package,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { listMarketplaceProducts } from "@/api/marketplace";
import { mapMarketplaceDtoToProduct } from "@/types/marketplace";
import type { CartProduct } from "@/types/cart";
import type { MarketplaceProduct } from "@/types/marketplace";

const categories = [
  { id: "all", label: "All Products" },
  { id: "medicines", label: "Medicines" },
  { id: "feeds", label: "Feeds & Supplements" },
  { id: "supplies", label: "Supplies & Equipment" },
  { id: "vaccines", label: "Vaccines" },
];

function parsePrice(price: string): number {
  return Number.parseInt(price.replace(/,/g, ""), 10) || 0;
}

function toCartProduct(p: MarketplaceProduct): CartProduct {
  return {
    id: p.id,
    name: p.name,
    price: parsePrice(p.price),
    priceDisplay: p.price,
    image: p.image,
  };
}

export function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: apiProducts = [], isLoading } = useQuery({
    queryKey: ["marketplace-products"],
    queryFn: listMarketplaceProducts,
  });
  const products = useMemo(
    () => apiProducts.map((dto) => mapMarketplaceDtoToProduct(dto)),
    [apiProducts]
  );

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const setCartDrawerOpen = useCartStore((s) => s.setCartDrawerOpen);
  const cartCount = (items ?? []).reduce((a, i) => a + i.quantity, 0);

  const inCart = (productId: string | number) =>
    (items ?? []).some((i) => i.productId === productId || String(i.productId) === String(productId));

  const addToCart = (p: MarketplaceProduct) => {
    if (!p.inStock) return;
    addItem(toCartProduct(p), 1);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl mb-2">Marketplace</h1>
            <p className="text-muted-foreground">
              Browse and buy veterinary products safely
            </p>
          </div>
          {isAuthenticated && (
            <Button
              type="button"
              size="lg"
              className="relative"
              onClick={() => setCartDrawerOpen(true)}
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
                  {cartCount}
                </Badge>
              )}
            </Button>
          )}
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for products..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="mb-6 text-sm text-muted-foreground">Loading products…</div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              type="button"
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {selectedCategory === "all" &&
          products.filter((p) => p.recommended).length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl mb-4">Recommended Based on Last Scan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products
                .filter((p) => p.recommended)
                .map((product) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {product.vetApproved && (
                          <Badge variant="default" className="bg-secondary">
                            Vet-approved
                          </Badge>
                        )}
                        {product.inStock ? (
                          <Badge variant="secondary" className="bg-icon-primary-subtle text-icon-primary">
                            In stock
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Out of Stock</Badge>
                        )}
                      </div>
                      <h3 className="font-medium mb-2">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-semibold">
                            UGX {product.price}
                          </span>
                        </div>
                        {inCart(product.id) ? (
                          <Button type="button" size="sm" variant="secondary" disabled>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Added
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => addToCart(product)}
                            disabled={!product.inStock}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add to cart
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl md:text-2xl mb-4">
            {selectedCategory === "all"
              ? "All Products"
              : categories.find((c) => c.id === selectedCategory)?.label}
          </h2>
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search or category filter
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {product.vetApproved && (
                        <Badge variant="default" className="bg-secondary">
                          Vet-approved
                        </Badge>
                      )}
                      {product.inStock ? (
                        <Badge variant="secondary" className="bg-icon-primary-subtle text-icon-primary">
                          In stock
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Out of Stock</Badge>
                      )}
                    </div>
                    <h3 className="font-medium mb-2">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-semibold">
                          UGX {product.price}
                        </span>
                      </div>
                      {inCart(product.id) ? (
                        <Button type="button" size="sm" variant="secondary" disabled>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Added
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addToCart(product)}
                          disabled={!product.inStock}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to cart
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
