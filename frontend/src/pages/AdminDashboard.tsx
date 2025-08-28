import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Shield,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Server,
  MessageSquare
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();

  const platformStats = [
    { label: "Total Users", value: "12,847", icon: Users, color: "text-blue-600" },
    { label: "Active Jobs", value: "1,234", icon: Briefcase, color: "text-green-600" },
    { label: "Successful Placements", value: "892", icon: CheckCircle, color: "text-purple-600" },
    { label: "Revenue (MTD)", value: "$45,230", icon: TrendingUp, color: "text-orange-600" }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "New Registration",
      description: "Healthcare Professional registered",
      user: "Dr. Sarah Williams",
      timestamp: "2 minutes ago"
    },
    {
      id: 2,
      type: "Job Posted",
      description: "New ICU Nurse position",
      user: "Metro General Hospital",
      timestamp: "15 minutes ago"
    },
    {
      id: 3,
      type: "Successful Hire",
      description: "Candidate hired for OR Nurse",
      user: "Regional Medical Center",
      timestamp: "1 hour ago"
    },
    {
      id: 4,
      type: "Report Filed",
      description: "Content violation reported",
      user: "System",
      timestamp: "2 hours ago"
    }
  ];

  const systemHealth = [
    { metric: "API Response Time", value: "145ms", status: "good" },
    { metric: "Database Load", value: "67%", status: "warning" },
    { metric: "Active Sessions", value: "2,341", status: "good" },
    { metric: "Error Rate", value: "0.02%", status: "good" }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-light to-secondary-light rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Platform overview and management tools
              </p>
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              <Shield className="h-4 w-4 mr-1" />
              Admin Access
            </Badge>
          </div>
        </div>

        {/* Platform Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {platformStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform events and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">{activity.type}</h4>
                        <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-primary mt-1">{activity.user}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View Full Activity Log
              </Button>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Real-time platform performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemHealth.map((health, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        health.status === 'good' ? 'bg-green-500' : 
                        health.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="font-medium text-foreground">{health.metric}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{health.value}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Server className="h-4 w-4 mr-2" />
                System Diagnostics
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Management Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Management Tools</CardTitle>
            <CardDescription>Administrative functions and moderation tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                User Management
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Briefcase className="h-6 w-6 mb-2" />
                Job Moderation
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <MessageSquare className="h-6 w-6 mb-2" />
                Content Review
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <AlertTriangle className="h-6 w-6 mb-2" />
                Reports Queue
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                Analytics
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Database className="h-6 w-6 mb-2" />
                Database Tools
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Shield className="h-6 w-6 mb-2" />
                Security Settings
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Activity className="h-6 w-6 mb-2" />
                System Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;