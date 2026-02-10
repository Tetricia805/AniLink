import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/Skeleton";
import { Stethoscope, ShoppingCart, FileText, Sparkles, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { ScanResult } from "@/types/scan";

export type ScanErrorNotCattle = { type: "NOT_CATTLE"; probCattle: number };

export interface ScanResultsViewProps {
  /** Optional display name (e.g. animal name or "AI Health Scan") */
  displayName?: string;
  /** Optional type/subtitle */
  displayType?: string;
  /** Optional emoji/icon */
  displayImage?: string;
  result: ScanResult | null;
  isLoading: boolean;
  onSaveToRecords?: () => void;
  onNewScan?: () => void;
  /** When healthy scan: callback for "View Records" (e.g. navigate to records with animalId). */
  onViewRecords?: () => void;
  /** When FMD pipeline rejects (image does not contain cattle). */
  scanError?: ScanErrorNotCattle | null;
}

const urgencyStyles: Record<ScanResult["urgency"], string> = {
  Low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
  Medium: "bg-icon-amber-subtle text-icon-amber",
  High: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
};

const confidenceStyles: Record<ScanResult["confidence"], string> = {
  High: "bg-primary/20 text-primary",
  Medium: "bg-icon-amber-subtle text-icon-amber",
  Low: "bg-muted text-muted-foreground",
};

export function ScanResultsView({
  displayName = "AI Health Scan",
  displayType,
  displayImage = "🐾",
  result,
  isLoading,
  onSaveToRecords,
  onNewScan,
  onViewRecords,
  scanError,
}: ScanResultsViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="rounded-xl border-primary/30 bg-primary/5">
          <CardContent className="py-8 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-icon-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-1">Analyzing…</h3>
              <p className="text-sm text-muted-foreground">
                AI is assessing the image. This may take a moment.
              </p>
            </div>
            <div className="w-full max-w-xs">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full w-1/2 animate-pulse bg-primary/50 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (scanError?.type === "NOT_CATTLE") {
    return (
      <div className="space-y-6">
        <Card className="rounded-xl border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-icon-amber shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-icon-amber mb-1">Image does not contain cattle</h3>
              <p className="text-sm text-icon-amber opacity-90">
                Confidence: {(scanError.probCattle * 100).toFixed(1)}%. Please upload a clear cattle
                image focused on muzzle, tongue, hooves, udder, or mouth.
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col sm:flex-row gap-3">
          {onNewScan && (
            <Button type="button" size="lg" className="flex-1" onClick={onNewScan}>
              Try another image
            </Button>
          )}
          <Button type="button" size="lg" variant="outline" className="flex-1" asChild>
            <Link to="/home">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
    >
      <Card className="rounded-xl border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-icon-amber shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-icon-amber mb-1">
              AI-assisted assessment
            </h3>
            <p className="text-sm text-icon-amber opacity-90">
              This is a preliminary AI assessment. Always consult a licensed veterinarian for diagnosis and treatment.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Scan results for {displayName}</CardTitle>
              {displayType && <CardDescription>{displayType}</CardDescription>}
            </div>
            <div className="text-3xl">{displayImage}</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-muted-foreground mb-2">{result.summary}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className={cn("rounded-full", confidenceStyles[result.confidence])}>
                {result.confidence} confidence
              </Badge>
              <Badge className={cn("rounded-full", urgencyStyles[result.urgency])}>
                {result.urgency} urgency
              </Badge>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Possible conditions</h3>
            <div className="space-y-3">
              {result.conditions.map((c, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium">{c.name}</h4>
                    <Badge
                      variant="secondary"
                      className={cn("shrink-0", confidenceStyles[c.confidenceLabel])}
                    >
                      {c.confidenceLabel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                  <Progress value={c.confidence} className="h-2" />
                  <p className="text-xs text-muted-foreground">{c.confidence}% confidence</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Recommended actions</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {result.recommendedActions.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>

          {result.shouldPersist === false && (
            <p className="text-sm text-muted-foreground py-2 px-3 rounded-lg bg-muted/50">
              No case saved because scan indicates healthy/low risk.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {onSaveToRecords && result.shouldPersist !== false && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onSaveToRecords}
              >
                <FileText className="h-4 w-4 mr-2" />
                Save to Records
              </Button>
            )}
            {result.shouldPersist === false && onViewRecords && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onViewRecords}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Records
              </Button>
            )}
            <Button type="button" className="flex-1" asChild>
              <Link to="/appointments?new=1">
                <Stethoscope className="h-4 w-4 mr-2" />
                Book a Vet
              </Link>
            </Button>
            <Button type="button" variant="secondary" className="flex-1" asChild>
              <Link to="/marketplace?tab=all&fromScan=1">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Recommended Products
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        {onNewScan && (
          <Button type="button" size="lg" className="flex-1" onClick={onNewScan}>
            Start New Scan
          </Button>
        )}
        <Button type="button" size="lg" variant="outline" className="flex-1" asChild>
          <Link to="/home">Return Home</Link>
        </Button>
      </div>
    </motion.div>
  );
}
