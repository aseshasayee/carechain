import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, User, Bell, Shield, Globe } from "lucide-react";

const SettingsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <CardTitle>Account Settings</CardTitle>
          </div>
          <CardDescription>
            Update your account information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="Enter first name" />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Enter last name" />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="Enter email address" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch id="email-notifications" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="application-alerts">New Application Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified of new applications</p>
            </div>
            <Switch id="application-alerts" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="job-expiry">Job Expiry Reminders</Label>
              <p className="text-sm text-muted-foreground">Reminders before job postings expire</p>
            </div>
            <Switch id="job-expiry" />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline">Change Password</Button>
          <Button variant="outline">Enable Two-Factor Authentication</Button>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <CardTitle>Privacy</CardTitle>
          </div>
          <CardDescription>
            Control your privacy and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="profile-visibility">Public Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">Make your institution profile visible to candidates</p>
            </div>
            <Switch id="profile-visibility" />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="analytics-sharing">Analytics Data Sharing</Label>
              <p className="text-sm text-muted-foreground">Share anonymized data to improve platform</p>
            </div>
            <Switch id="analytics-sharing" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
