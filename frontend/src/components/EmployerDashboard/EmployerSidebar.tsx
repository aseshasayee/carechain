import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  FileText, 
  Settings, 
  Bell, 
  BarChart3, 
  CheckCircle,
  AlertCircle,
  Home,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface EmployerSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
}

const EmployerSidebar: React.FC<EmployerSidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  verificationStatus = 'pending' 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: Home,
      description: 'Overview of your employer portal'
    },
    {
      id: 'profile',
      label: 'Institution Profile',
      icon: Building2,
      description: 'Manage your institution details'
    },
    {
      id: 'verification',
      label: 'Verification',
      icon: verificationStatus === 'verified' ? CheckCircle : AlertCircle,
      description: 'Submit documents for verification',
      badge: verificationStatus === 'pending' ? 'Pending' : 
             verificationStatus === 'verified' ? 'Verified' : 'Action Required'
    },
    {
      id: 'jobs',
      label: 'Job Postings',
      icon: FileText,
      description: 'Create and manage job postings'
    },
    {
      id: 'candidates',
      label: 'Manage Candidates',
      icon: Users,
      description: 'Review applications and candidates'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'View hiring insights and metrics'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      description: 'View all notifications'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Account and system settings'
    }
  ];

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Verified': return 'default';
      case 'Pending': return 'secondary';
      case 'Action Required': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out shadow-lg`}>
      {/* Header */}
      <div className={`${isCollapsed ? 'p-3' : 'p-6'} border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative`}>
        {!isCollapsed && (
          <div>
            <h2 className="text-xl font-semibold">Employer Portal</h2>
            <p className="text-sm opacity-90 mt-1">Manage your institution</p>
          </div>
        )}
        {isCollapsed && (
          <div className="text-center">
            <Building2 className="h-6 w-6 mx-auto" />
          </div>
        )}
        
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute ${isCollapsed ? 'top-2 right-2' : 'top-4 right-4'} text-white hover:bg-white/20 h-8 w-8 p-0`}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'} space-y-1`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <div key={item.id} className="relative group">
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full ${isCollapsed ? 'justify-center p-2' : 'justify-start p-3'} h-auto ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'hover:bg-gray-100 text-gray-700'
                } transition-all duration-200`}
                onClick={() => onTabChange(item.id)}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} w-full`}>
                  <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <div className="text-left">
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs opacity-75">{item.description}</div>
                      </div>
                    )}
                  </div>
                  {!isCollapsed && item.badge && (
                    <Badge 
                      variant={getBadgeVariant(item.badge)} 
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </Button>
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full top-0 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {item.label}
                  {item.badge && (
                    <span className={`ml-2 px-1 py-0.5 rounded text-xs ${
                      item.badge === 'Verified' ? 'bg-green-600' :
                      item.badge === 'Pending' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 text-center">
            Need help? <a href="#" className="text-blue-600 hover:text-blue-800 underline">Contact Support</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerSidebar;
