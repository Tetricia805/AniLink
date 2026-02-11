import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <p className="text-muted-foreground mb-6 text-center">Terms of Service — Coming soon.</p>
      <Button asChild variant="outline">
        <Link to="/">Back</Link>
      </Button>
    </div>
  );
}
