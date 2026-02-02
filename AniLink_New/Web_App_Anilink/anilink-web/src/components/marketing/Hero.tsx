import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
        {/* Left Column */}
        <div className="space-y-6">
          <Badge className="bg-icon-primary-subtle text-icon-primary border-[color:var(--icon-primary)]/20">
            AI-assisted animal health
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Healthy animals. Faster help. Smarter farms.
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl">
            Scan symptoms, get AI guidance, find nearby vets, keep health records, and order trusted vet supplies — all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="text-base">
              <Link to="/register">Get started free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link to="/login">View demo</Link>
            </Button>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-icon-primary" />
              <span>Verified vets</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-icon-primary" />
              <span>Farm visits</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-icon-primary" />
              <span>Secure records</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-icon-primary" />
              <span>UGX pricing</span>
            </div>
          </div>
        </div>
        
        {/* Right Column - Hero Image Card */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-muted shadow-card border"
          >
            {/* Hero Image Placeholder - Replace with actual image */}
            <div className="aspect-[4/3] bg-gradient-to-br from-primary/30 via-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
              {/* Gradient background with icon */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-secondary/20" />
              <div className="relative z-10 text-center space-y-4 p-8">
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border-2 border-primary/30">
                  <svg className="w-12 h-12 text-icon-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-muted-foreground text-sm font-medium">Farm & Veterinary Care</p>
                <p className="text-xs text-muted-foreground/80">Replace with hero image: src/assets/hero-farm-vet.jpg</p>
              </div>
            </div>
            
            {/* Floating Cards */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-4 right-4 bg-card rounded-lg shadow-card border p-3 max-w-[180px]"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-icon-primary" />
                <span className="text-sm font-medium">Scan result ready</span>
              </div>
            </motion.div>
            
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
              className="absolute bottom-4 left-4 bg-card rounded-lg shadow-card border p-3 max-w-[180px]"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium">Vet available 2.1km</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
