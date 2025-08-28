import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  FileText, 
  TrendingUp, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Eye
} from "lucide-react";

interface OverviewTabProps {
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  onTabChange: (tab: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ 
  verificationStatus = 'pending', 
  onTabChange 
}) => {
  const stats = [
    {
      title: "Active Job Postings",
      value: "0",
      description: "Currently active",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Total Applications",
      value: "0",
      description: "All time applications",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Verification Status",
      value: verificationStatus === 'verified' ? 'Verified' : 
             verificationStatus === 'pending' ? 'Pending' : 'Action Required',
      description: "Institution verification",
      icon: verificationStatus === 'verified' ? CheckCircle : 
            verificationStatus === 'pending' ? Clock : AlertTriangle,
      color: verificationStatus === 'verified' ? 'text-green-600' : 
             verificationStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'
    },
    {
      title: "Profile Completion",
      value: "0%",
      description: "Complete your profile",
      icon: Building2,
      color: "text-purple-600"
    }
  ];

  const quickActions = [
    {
      title: "Complete Verification",
      description: "Submit required documents for verification",
      action: () => onTabChange('verification'),
      icon: CheckCircle,
      variant: "default" as const,
      disabled: verificationStatus === 'verified'
    },
    {
      title: "Post a Job",
      description: "Create your first job posting",
      action: () => onTabChange('jobs'),
      icon: Plus,
      variant: "outline" as const,
      disabled: verificationStatus !== 'verified'
    },
    {
      title: "View Applications",
      description: "Review candidate applications",
      action: () => onTabChange('candidates'),
      icon: Eye,
      variant: "outline" as const,
      disabled: verificationStatus !== 'verified'
    }
  ];

  const getVerificationBadgeVariant = () => {
    switch (verificationStatus) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">
            Welcome to your employer dashboard. Manage your institution and hiring process.
          </p>
        </div>

        {/* Verification Alert */}
        {verificationStatus !== 'verified' && (
          <div className="mb-8 bg-white rounded-xl shadow-lg border border-yellow-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-yellow-800">Verification Required</h3>
            </div>
            <p className="text-yellow-700 mb-4">
              {verificationStatus === 'pending' 
                ? "Your institution verification is pending. You'll be able to post jobs once verified."
                : "Your verification was rejected. Please check the verification section for details and resubmit."
              }
            </p>
            <Button 
              onClick={() => onTabChange('verification')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {verificationStatus === 'pending' ? 'Check Status' : 'Resubmit Documents'}
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.title === 'Verification Status' ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{stat.value}</span>
                      <Badge variant={getVerificationBadgeVariant()} className="text-xs">
                        {stat.value}
                      </Badge>
                    </div>
                  ) : (
                    stat.value
                  )}
                </div>
                <p className="text-sm text-gray-600">{stat.description}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Quick Actions</h2>
          <p className="text-gray-600 mb-6">Get started with essential tasks for your employer profile</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                      <Button 
                        variant={action.variant}
                        size="sm" 
                        className="w-full"
                        onClick={action.action}
                        disabled={action.disabled}
                      >
                        {action.title}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Recent Activity</h2>
          <p className="text-gray-600 mb-6">Your latest activities and updates</p>
          
          <div className="text-center py-12 text-gray-500">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No recent activity</h3>
            <p className="text-sm">Activity will appear here once you start using the platform</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
