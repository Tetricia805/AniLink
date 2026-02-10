import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutDashboard, Package, ShoppingBag, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { getDisplayName, getRoleLabel } from "@/lib/userUtils";
import { useSellerProducts } from "@/hooks/useSellerProducts";
import { useSellerOrders } from "@/hooks/useSellerOrders";
import { staggerContainer, staggerItem, sectionTransition, cardHoverClass } from "@/lib/motion";

const LOW_STOCK_THRESHOLD = 5;

function getLowStockCount(products: { stock?: number; active?: boolean }[], threshold = 5): number {
  return products.filter((p) => (p.active !== false) && (p.stock ?? 0) > 0 && (p.stock ?? 0) < threshold).length;
}

export function SellerDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: products = [] } = useSellerProducts();
  const { data: orders = [] } = useSellerOrders();

  const productsCount = products.length;
  const ordersCount = orders.length;
  const lowStockCount = getLowStockCount(products, LOW_STOCK_THRESHOLD);
  const revenueDisplay = "—"; // optional: sum from orders

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">
            Welcome back, {getDisplayName(user)}
          </h1>
          <Badge variant="secondary" className="text-sm">
            {getRoleLabel(user?.role)}
          </Badge>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <h2 className="text-xl font-medium mb-2">Seller Dashboard</h2>
          <p className="text-muted-foreground mb-6">Manage your products and orders.</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItem}>
            <Link to="/seller/products" className="block h-full">
              <Card className={`h-full border border-border ${cardHoverClass}`}>
                <CardContent className="p-4">
                  <Package className="h-5 w-5 text-icon-primary mb-2" />
                  <div className="text-2xl font-semibold">{productsCount}</div>
                  <div className="text-sm text-muted-foreground">Products</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
          <motion.div variants={staggerItem}>
            <Link to="/seller/orders" className="block h-full">
              <Card className={`h-full border border-border ${cardHoverClass}`}>
                <CardContent className="p-4">
                  <ShoppingBag className="h-5 w-5 text-secondary mb-2" />
                  <div className="text-2xl font-semibold">{ordersCount}</div>
                  <div className="text-sm text-muted-foreground">Orders</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
          <motion.div variants={staggerItem}>
            <Link to="/seller/inventory" className="block h-full">
              <Card className={`h-full border border-border ${cardHoverClass}`}>
                <CardContent className="p-4">
                  <LayoutDashboard className="h-5 w-5 text-icon-amber mb-2" />
                  <div className="text-2xl font-semibold">{lowStockCount}</div>
                  <div className="text-sm text-muted-foreground">Low stock</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
          <motion.div variants={staggerItem}>
            <Link to="/seller/payouts" className="block h-full">
              <Card className={`h-full border border-border ${cardHoverClass}`}>
                <CardContent className="p-4">
                  <Wallet className="h-5 w-5 text-icon-primary mb-2" />
                  <div className="text-2xl font-semibold">{revenueDisplay}</div>
                  <div className="text-sm text-muted-foreground">Payouts</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div className="flex flex-col gap-6" {...sectionTransition}>
          <Card className="p-6 border border-border transition-all duration-200 hover:shadow-lg hover:border-primary/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-muted-foreground">
                {productsCount === 0
                  ? "Get started by adding your first product."
                  : "Add more products to grow your store."}
              </p>
              <Button asChild>
                <Link to="/seller/products">Add product</Link>
              </Button>
            </div>
          </Card>

          <Card className="border border-border">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  When buyers order your products, orders will appear here.
                </p>
              ) : (
                <ul className="space-y-3">
                  {recentOrders.map((order) => (
                    <li
                      key={order.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 border-b border-border last:border-0"
                    >
                      <div>
                        <span className="font-medium">Order {order.id.slice(0, 8)}</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          {new Date(order.createdAt ?? "").toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          UGX {order.totalAmount.toLocaleString()}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">
                          {order.status}
                        </span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/seller/orders?order=${order.id}`}>View</Link>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
