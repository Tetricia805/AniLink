import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";

export function SellerPayoutsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Payouts</h1>
          <p className="text-muted-foreground mb-6">View payout history and settings.</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <Card className="border border-border transition-all duration-200 hover:shadow-lg hover:border-primary/30">
            <CardContent className="p-8">
              <EmptyState
                title="Payouts"
                description="Payout history and settings (coming soon)."
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
