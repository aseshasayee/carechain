import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import JobCategories from "@/components/JobCategories";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <JobCategories />
      </main>
      <footer className="bg-muted py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              © 2024 CareChain. All rights reserved. Connecting healthcare professionals with opportunities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
