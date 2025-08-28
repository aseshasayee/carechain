import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, LogOut, User, Heart, TestTube } from "lucide-react";

interface DashboardHeaderProps {
  onNotificationClick: () => void;
  onSettingsClick: () => void;
  onLogout: () => void;
  demoMode: boolean;
  onDemoToggle: (enabled: boolean) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  onNotificationClick, 
  onSettingsClick, 
  onLogout,
  demoMode,
  onDemoToggle
}) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Breadcrumb */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="gradient-primary rounded-lg p-2">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">CareChain</span>
                <span className="text-sm text-gray-500 ml-2">Employer Portal</span>
              </div>
            </div>
          </div>

          {/* Center - Demo Toggle */}
          <div className="flex-1 max-w-md mx-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <TestTube className="h-4 w-4 text-amber-600" />
                <Label htmlFor="demo-toggle" className="text-sm font-medium text-amber-800">
                  Demo Mode
                </Label>
                <Switch
                  id="demo-toggle"
                  checked={demoMode}
                  onCheckedChange={onDemoToggle}
                  className="data-[state=checked]:bg-amber-600"
                />
              </div>
              {demoMode && (
                <span className="text-xs text-amber-600 font-medium">
                  All features unlocked for testing
                </span>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">0</div>
                <div className="text-gray-500">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">0</div>
                <div className="text-gray-500">Applications</div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block h-8 w-px bg-gray-300"></div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotificationClick}
              className="relative hover:bg-gray-100"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-gray-100">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'EM'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user ? `${user.firstName} ${user.lastName}` : 'Employer'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || 'employer@demo.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSettingsClick}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
