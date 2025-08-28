import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  Clock, 
  TrendingUp, 
  MessageSquare,
  Star,
  CheckCircle,
  AlertCircle,
  Eye
} from "lucide-react";

const ProfessionalDashboard = () => {
  const { user } = useAuth();

  const applications = [
    {
      id: 1,
      jobTitle: "ICU Nurse",
      company: "Metro General Hospital",
      location: "New York, NY",
      appliedDate: "2 days ago",
      status: "Under Review",
      statusColor: "bg-yellow-500"
    },
    {
      id: 2,
      jobTitle: "Emergency Nurse",
      company: "City Medical Center", 
      location: "Miami, FL",
      appliedDate: "1 week ago",
      status: "Interview Scheduled",
      statusColor: "bg-blue-500"
    },
    {
      id: 3,
      jobTitle: "OR Nurse",
      company: "Regional Hospital",
      location: "Boston, MA", 
      appliedDate: "2 weeks ago",
      status: "Rejected",
      statusColor: "bg-red-500"
    }
  ];

  const recommendedJobs = [
    {
      id: 1,
      title: "Critical Care Nurse",
      company: "University Hospital",
      location: "Philadelphia, PA",
      salary: "$78,000 - $92,000",
      matchScore: 95
    },
    {
      id: 2, 
      title: "ER Nurse",
      company: "General Medical Center",
      location: "Washington, DC",
      salary: "$72,000 - $88,000", 
      matchScore: 88
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-light to-secondary-light rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-muted-foreground">
                Ready to find your next healthcare opportunity?
              </p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="text-sm text-muted-foreground">Profile Completion</span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={75} className="w-32" />
                <span className="text-sm font-medium">75%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-foreground">12</p>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-secondary" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-foreground">3</p>
                  <p className="text-sm text-muted-foreground">Interviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-foreground">2</p>
                  <p className="text-sm text-muted-foreground">Offers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-2xl font-bold text-foreground">4.8</p>
                  <p className="text-sm text-muted-foreground">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Track your job application status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{app.jobTitle}</h4>
                      <p className="text-sm text-muted-foreground">{app.company}</p>
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {app.location}
                        <Clock className="h-3 w-3 ml-3 mr-1" />
                        Applied {app.appliedDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="secondary" 
                        className={`${app.statusColor} text-white`}
                      >
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Applications
              </Button>
            </CardContent>
          </Card>

          {/* Recommended Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended for You</CardTitle>
              <CardDescription>Perfect matches based on your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedJobs.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-foreground">{job.title}</h4>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {job.matchScore}% match
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {job.location}
                      </div>
                      <span className="text-sm font-medium text-foreground">{job.salary}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="flex-1">Apply Now</Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View More Recommendations
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Fast access to common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                Update Profile
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                Schedule Availability
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <MessageSquare className="h-6 w-6 mb-2" />
                Messages
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Briefcase className="h-6 w-6 mb-2" />
                Browse Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;