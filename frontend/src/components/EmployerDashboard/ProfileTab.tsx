import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, MapPin, Globe, Phone, Mail } from "lucide-react";

const ProfileTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Institution Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your institution's public profile information.
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Basic Information</CardTitle>
          </div>
          <CardDescription>
            Update your institution's basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="institutionName">Institution Name</Label>
            <Input id="institutionName" placeholder="Enter institution name" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe your institution..."
              className="min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input id="website" className="pl-9" placeholder="https://..." />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input id="phone" className="pl-9" placeholder="+1 (555) 000-0000" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <CardTitle>Location</CardTitle>
          </div>
          <CardDescription>
            Update your institution's location details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Full Address</Label>
            <Textarea 
              id="address" 
              placeholder="Enter complete address..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="Enter city" />
            </div>
            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input id="state" placeholder="Enter state" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode">ZIP/Postal Code</Label>
              <Input id="zipCode" placeholder="Enter ZIP code" />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" placeholder="Enter country" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Contact Information</CardTitle>
          </div>
          <CardDescription>
            Update contact details for your institution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="primaryEmail">Primary Email</Label>
            <Input id="primaryEmail" type="email" placeholder="contact@institution.com" />
          </div>
          <div>
            <Label htmlFor="emergencyContact">Emergency Contact</Label>
            <Input id="emergencyContact" placeholder="Emergency contact number" />
          </div>
          <div>
            <Label htmlFor="hrContact">HR Contact Email</Label>
            <Input id="hrContact" type="email" placeholder="hr@institution.com" />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg">
          Save Profile Changes
        </Button>
      </div>
    </div>
  );
};

export default ProfileTab;
