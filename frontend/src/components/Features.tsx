import { 
  Shield, 
  Clock, 
  Users, 
  Award, 
  MessageSquare, 
  CalendarCheck,
  MapPin,
  Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "Verified Professionals",
      description: "All healthcare workers undergo thorough background checks and credential verification for your peace of mind."
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Find temporary shifts, permanent positions, or part-time opportunities that fit your lifestyle and career goals."
    },
    {
      icon: Users,
      title: "Instant Matching",
      description: "Our advanced algorithm connects you with the right opportunities based on your skills, experience, and preferences."
    },
    {
      icon: Award,
      title: "Quality Assurance",
      description: "Partner with top-rated medical facilities that maintain the highest standards of patient care and workplace excellence."
    },
    {
      icon: MessageSquare,
      title: "Direct Communication",
      description: "Connect directly with hiring managers and colleagues through our secure messaging platform."
    },
    {
      icon: CalendarCheck,
      title: "Easy Scheduling",
      description: "Manage your work schedule, track hours, and coordinate with your team all in one convenient platform."
    },
    {
      icon: MapPin,
      title: "Location Flexibility",
      description: "Find opportunities in your preferred locations, from local hospitals to travel nursing assignments across the country."
    },
    {
      icon: Zap,
      title: "Quick Applications",
      description: "Apply to multiple positions with just one click using your comprehensive professional profile."
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Why Choose CareChain?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're committed to connecting healthcare professionals with meaningful opportunities 
            while ensuring the highest standards of quality and trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card/50 backdrop-blur"
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;