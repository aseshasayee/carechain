import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, Briefcase, Star } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fadeIn">
            Connect Healthcare{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              Professionals
            </span>{" "}
            with Opportunities
          </h1>
          
          {/* Subheading */}
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-slideUp">
            Join thousands of healthcare professionals finding their perfect match with top medical facilities. 
            From temporary shifts to permanent positions, discover your next career opportunity today.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-8 animate-slideUp">
            <div className="flex flex-col sm:flex-row gap-4 p-2 bg-card rounded-xl shadow-healthcare border border-border">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Job title, keywords, or company"
                  className="pl-10 border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="City, state, or zip code"
                  className="pl-10 border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
              <Button variant="default" size="lg" className="px-8">
                Search Jobs
              </Button>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slideUp">
            <Link to="/register?role=professional">
              <Button variant="default" size="lg" className="px-8">
                Find Healthcare Jobs
              </Button>
            </Link>
            <Link to="/register?role=employer">
              <Button variant="outline" size="lg" className="px-8">
                Hire Healthcare Staff
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto animate-fadeIn">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-primary mr-2" />
                <span className="text-2xl font-bold text-primary">10K+</span>
              </div>
              <p className="text-sm text-muted-foreground">Healthcare Professionals</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Briefcase className="h-6 w-6 text-secondary mr-2" />
                <span className="text-2xl font-bold text-secondary">5K+</span>
              </div>
              <p className="text-sm text-muted-foreground">Active Job Postings</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-accent mr-2" />
                <span className="text-2xl font-bold text-accent">98%</span>
              </div>
              <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;