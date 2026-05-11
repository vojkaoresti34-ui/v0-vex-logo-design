import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { LogosSlider } from "@/components/landing/logos-slider";
import { Stats } from "@/components/landing/stats";
import { Features } from "@/components/landing/features";
import { ProductPreview } from "@/components/landing/product-preview";
import { CVComparison } from "@/components/landing/cv-comparison";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { GlassFilter } from "@/components/ui/liquid-glass";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <GlassFilter />
      <Navbar />
      <Hero />
      <LogosSlider />
      <Stats />
      <Features />
      <ProductPreview />
      <CVComparison />
      <WorkflowSection />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
