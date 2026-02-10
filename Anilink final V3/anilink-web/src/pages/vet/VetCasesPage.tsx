import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useVetCases } from "@/hooks/useCases";
import { useToast } from "@/components/ui/use-toast";
import type { CaseDto } from "@/api/cases";
import { staggerContainer, staggerItem, cardHoverClass } from "@/lib/motion";

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  const s = status?.toUpperCase() ?? "";
  if (s === "SUBMITTED") return "secondary";
  if (s === "UNDER_REVIEW") return "default";
  if (s === "CLOSED") return "outline";
  return "outline";
}

export function VetCasesPage() {
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get("focus");
  const { data: cases = [], isLoading, isError, isFetching } = useVetCases();
  const { push } = useToast();
  const hasShownRefetchErrorRef = useRef(false);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.debug('[VetCasesPage] count:', cases.length, 'isLoading:', isLoading, 'isFetching:', isFetching, 'isError:', isError);
    }
  }, [cases.length, isLoading, isFetching, isError]);

  useEffect(() => {
    if (isError && cases.length > 0 && !hasShownRefetchErrorRef.current) {
      hasShownRefetchErrorRef.current = true;
      push({ title: "Could not refresh cases", description: "Showing last loaded data." });
    }
    if (!isError) hasShownRefetchErrorRef.current = false;
  }, [isError, cases.length, push]);
  const [focusedCase, setFocusedCase] = useState<CaseDto | null>(null);

  useEffect(() => {
    if (focusId && cases.length > 0) {
      const c = cases.find((x) => x.id === focusId || x.id.startsWith(focusId));
      if (c) setFocusedCase(c);
    } else {
      setFocusedCase(null);
    }
  }, [focusId, cases]);

  if (isLoading && !cases.length) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Cases</h1>
          <p className="text-muted-foreground mb-6">
            Cases assigned to you for review.
          </p>
          <LoadingSkeleton lines={8} />
        </div>
      </div>
    );
  }

  if (isError && !cases.length) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Cases</h1>
          <Card>
            <CardContent className="p-8">
              <p className="text-destructive">Could not load cases.</p>
            </CardContent>
          </Card>
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
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">Cases</h1>
          <p className="text-muted-foreground mb-6">
            Cases submitted by farmers (e.g. from scan results). Add notes, recommend treatment, mark resolved.
          </p>
        </motion.div>

        {cases.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <Card className="border border-border">
              <CardContent className="p-8">
                <EmptyState
                  title="No cases assigned"
                  description="When farmers submit scans or request help, cases will appear here once assigned to you."
                />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {cases.map((c) => (
              <motion.div key={c.id} variants={staggerItem}>
                <Card
                  className={`border border-border ${cardHoverClass} ${focusedCase?.id === c.id ? "ring-2 ring-primary" : ""}`}
                >
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-medium">{c.animalType}</span>
                    <Badge variant={getStatusBadgeVariant(c.status)}>
                      {c.status}
                    </Badge>
                    {c.createdAt && (
                      <span className="text-sm text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {c.symptoms?.join(", ") ?? "No symptoms listed"}
                  </p>
                  {c.notes && (
                    <p className="text-sm mb-2">{c.notes}</p>
                  )}
                  {c.aiAssessment && (
                    <p className="text-xs text-muted-foreground">
                      AI: {c.aiAssessment.status} (confidence: {c.aiAssessment.confidence ?? "—"})
                    </p>
                  )}
                </CardContent>
              </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
