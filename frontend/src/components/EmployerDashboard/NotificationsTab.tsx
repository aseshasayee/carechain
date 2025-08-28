import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Check, X } from "lucide-react";

const NotificationsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground mt-2">
          Stay updated with important notifications about your job postings and applications.
        </p>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-muted-foreground">
              You'll receive notifications here about application updates, verification status, and more.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsTab;
