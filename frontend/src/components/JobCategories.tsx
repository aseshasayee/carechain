import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  Heart, 
  Brain, 
  Pill, 
  Siren, 
  Baby,
  Eye,
  Bone
} from "lucide-react";

const JobCategories = () => {
  const categories = [
    {
      icon: Stethoscope,
      title: "Nursing",
      jobs: "2,340 jobs",
      description: "RN, LPN, ICU, ER, and specialty nursing positions",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: Heart,
      title: "Cardiology",
      jobs: "890 jobs",
      description: "Cardiac technicians, nurses, and specialists",
      color: "bg-secondary/10 text-secondary"
    },
    {
      icon: Brain,
      title: "Mental Health",
      jobs: "650 jobs",
      description: "Psychiatrists, therapists, and counselors",
      color: "bg-accent/10 text-accent"
    },
    {
      icon: Pill,
      title: "Pharmacy",
      jobs: "420 jobs",
      description: "Pharmacists, technicians, and assistants",
      color: "bg-warning/10 text-warning"
    },
    {
      icon: Siren,
      title: "Emergency Medicine",
      jobs: "750 jobs",
      description: "EMT, paramedics, and emergency staff",
      color: "bg-destructive/10 text-destructive"
    },
    {
      icon: Baby,
      title: "Pediatrics",
      jobs: "580 jobs",
      description: "Pediatric nurses, doctors, and specialists",
      color: "bg-success/10 text-success"
    },
    {
      icon: Eye,
      title: "Ophthalmology",
      jobs: "320 jobs",
      description: "Eye care specialists and technicians",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: Bone,
      title: "Orthopedics",
      jobs: "470 jobs",
      description: "Orthopedic surgeons, nurses, and specialists",
      color: "bg-secondary/10 text-secondary"
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Explore Healthcare Specialties
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find opportunities across all areas of healthcare, from bedside care to specialized medical fields.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link key={index} to={`/jobs?category=${category.title.toLowerCase()}`}>
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${category.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-primary font-medium mb-2">
                      {category.jobs}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="text-center">
          <Link to="/jobs">
            <Button variant="outline" size="lg">
              View All Job Categories
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default JobCategories;