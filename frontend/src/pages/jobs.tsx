import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  Filter, 
  Heart, 
  Clock, 
  DollarSign, 
  Calendar,
  Building2,
  Stethoscope
} from "lucide-react";

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  // Mock job data
  const jobs = [
    {
      id: 1,
      title: "Registered Nurse - ICU",
      company: "Metro General Hospital",
      location: "New York, NY",
      type: "Full-time",
      shift: "Night Shift",
      salary: "$75,000 - $90,000",
      postedDate: "2 days ago",
      description: "Seeking experienced ICU nurse for our Level 1 trauma center. Must have ACLS certification.",
      requirements: ["BSN preferred", "2+ years ICU experience", "ACLS certification"],
      benefits: ["Health insurance", "401k", "Paid time off", "Continuing education"],
      featured: true
    },
    {
      id: 2,
      title: "Physical Therapist",
      company: "Sunrise Rehabilitation Center",
      location: "Los Angeles, CA",
      type: "Full-time",
      shift: "Day Shift",
      salary: "$85,000 - $95,000",
      postedDate: "1 day ago",
      description: "Join our team of dedicated physical therapists in a state-of-the-art facility.",
      requirements: ["DPT degree", "State license", "1+ years experience"],
      benefits: ["Competitive salary", "Flexible schedule", "Professional development"],
      featured: false
    },
    {
      id: 3,
      title: "Medical Assistant",
      company: "Family Care Clinic",
      location: "Chicago, IL",
      type: "Part-time",
      shift: "Day Shift",
      salary: "$35,000 - $42,000",
      postedDate: "3 days ago",
      description: "Support our healthcare team in providing excellent patient care.",
      requirements: ["Medical assistant certification", "EHR experience", "Excellent communication"],
      benefits: ["Health insurance", "Flexible hours", "Training provided"],
      featured: false
    },
    {
      id: 4,
      title: "Emergency Room Nurse",
      company: "City Medical Center",
      location: "Miami, FL",
      type: "Full-time",
      shift: "Rotating",
      salary: "$70,000 - $85,000",
      postedDate: "4 days ago",
      description: "Fast-paced ER environment seeking skilled emergency nurses.",
      requirements: ["RN license", "BLS/ACLS", "ER experience preferred"],
      benefits: ["Sign-on bonus", "Shift differentials", "Tuition reimbursement"],
      featured: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-light to-secondary-light border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Find Your Next Healthcare Opportunity
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover thousands of healthcare jobs from top medical facilities nationwide
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-healthcare border-0">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      placeholder="Job title, keywords, or specialty"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      placeholder="City, state, or zip code"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="default" size="lg" className="px-8">
                    Search Jobs
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-border">
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nursing">Nursing</SelectItem>
                      <SelectItem value="therapy">Therapy</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                      <SelectItem value="emergency">Emergency Medicine</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Experience Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              {jobs.length} Jobs Found
            </h2>
            <p className="text-muted-foreground">Showing healthcare opportunities near you</p>
          </div>
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most Relevant</SelectItem>
              <SelectItem value="date">Newest First</SelectItem>
              <SelectItem value="salary">Highest Salary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {jobs.map((job) => (
            <Card 
              key={job.id} 
              className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                job.featured ? 'ring-2 ring-primary/20 bg-primary-light/30' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          {job.featured && (
                            <Badge variant="secondary" className="bg-primary text-primary-foreground">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-muted-foreground mb-2">
                          <Building2 className="mr-2 h-4 w-4" />
                          <span className="font-medium">{job.company}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground mb-4">
                          <MapPin className="mr-2 h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-muted-foreground mb-4">{job.description}</p>

                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-4 w-4" />
                        {job.type} • {job.shift}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="mr-1 h-4 w-4" />
                        {job.salary}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="mr-1 h-4 w-4" />
                        Posted {job.postedDate}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {job.requirements.slice(0, 3).map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="lg:ml-6 mt-4 lg:mt-0 flex flex-col gap-2">
                    <Button variant="default" className="w-full lg:w-auto">
                      Apply Now
                    </Button>
                    <Button variant="outline" className="w-full lg:w-auto">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Jobs
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Jobs;