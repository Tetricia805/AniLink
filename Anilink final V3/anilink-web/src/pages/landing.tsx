import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LandingNav } from "@/components/marketing/LandingNav";
import { Hero } from "@/components/marketing/Hero";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { FAQAccordion } from "@/components/marketing/FAQAccordion";
import { Footer } from "@/components/marketing/Footer";
import {
  Scan,
  Stethoscope,
  Truck,
  ShoppingCart,
  FileText,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "AI Health Scan",
    description: "Upload photos and symptoms for AI-assisted health assessment and guidance.",
  },
  {
    icon: Stethoscope,
    title: "Find & Book Vets",
    description: "Discover nearby veterinarians, check availability, and book appointments instantly.",
  },
  {
    icon: Truck,
    title: "Farm Visits & Emergency",
    description: "Request farm visits and emergency veterinary services available 24/7.",
  },
  {
    icon: ShoppingCart,
    title: "Marketplace",
    description: "Shop verified feeds, medicines, and veterinary supplies with transparent pricing.",
  },
  {
    icon: FileText,
    title: "Animal Records",
    description: "Maintain comprehensive health records, vaccination history, and treatment timelines.",
  },
  {
    icon: TrendingUp,
    title: "Insights",
    description: "Get alerts, reminders, and health trends to keep your animals healthy.",
  },
];

const steps = [
  {
    number: "1",
    title: "Add your animal",
    description: "Register your animals and create their profiles with basic information.",
  },
  {
    number: "2",
    title: "Scan symptoms / upload photos",
    description: "Use AI-powered scanning to get instant guidance on health concerns.",
  },
  {
    number: "3",
    title: "Get guidance + book vet + save record",
    description: "Receive recommendations, book appointments, and automatically save records.",
  },
];

/** Marketplace teaser: no mock data; same card design when products exist. */
const marketplaceTeaserProducts: { name: string; price: string }[] = [];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Social Proof */}
      <motion.section
        className="border-y bg-muted/30 py-8"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>1,200+ scans</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>300+ vet bookings</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>500+ orders</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Trusted by farmers</span>
            </div>
          </div>
        </div>
      </motion.section>
      
      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools to keep your animals healthy and your farm productive.
          </p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </section>
      
      {/* How It Works */}
      <section id="how-it-works" className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps. AI assistance helps guide you, but always consult a vet for final decisions.
            </p>
          </motion.div>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Built for Farmers & Vets */}
      <section id="for-vets" className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* For Farmers */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
          <Card className="border border-border transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5">
            <CardContent className="p-8 space-y-6">
              <h3 className="text-2xl font-bold">For Farmers</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>Fast help when animals need care</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>Save money with transparent pricing</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>Convenient farm visits available</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>Automated reminders and alerts</span>
                </li>
              </ul>
              <Button asChild size="lg" className="w-full">
                <Link to="/register">I'm a farmer</Link>
              </Button>
            </CardContent>
          </Card>
          </motion.div>
          
          {/* For Vets */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.08 }}
          >
          <Card className="border border-border transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5">
            <CardContent className="p-8 space-y-6">
              <h3 className="text-2xl font-bold">For Vets & Clinics</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                  <span>Professional profile and visibility</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                  <span>Manage bookings and schedule</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                  <span>Access patient history and records</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                  <span>Reach more farmers in your area</span>
                </li>
              </ul>
              <Button asChild variant="secondary" size="lg" className="w-full">
                <Link to="/register?role=vet">I'm a vet/clinic</Link>
              </Button>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </section>
      
      {/* Marketplace Teaser */}
      <section id="marketplace" className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted Marketplace</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Quality veterinary products, feeds, and supplies from verified sellers.
            </p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto mb-8">
            {marketplaceTeaserProducts.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-4">
                Browse the marketplace for veterinary products and supplies.
              </p>
            ) : (
              marketplaceTeaserProducts.map((product, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-2">{product.name}</h4>
                    <p className="text-primary font-medium">{product.price}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <div className="text-center">
            <Button asChild size="lg">
              <Link to="/marketplace">View marketplace</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* FAQ */}
      <section id="faq" className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about AniLink.
            </p>
          </motion.div>
          <FAQAccordion />
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="bg-primary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
          <Card className="max-w-3xl mx-auto border-primary/20 border-2 transition-all duration-200 hover:shadow-xl hover:border-primary/40">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to protect your animals?</h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of farmers and vets using AniLink to keep animals healthy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/register">Create account</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">Log in</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
