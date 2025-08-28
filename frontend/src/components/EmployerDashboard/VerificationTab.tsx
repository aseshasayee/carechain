import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertTriangle, Upload, FileText, Eye } from "lucide-react";
import EmployerProfileForm from "@/components/EmployerProfileForm";

interface VerificationTabProps {
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
}

const VerificationTab: React.FC<VerificationTabProps> = ({ 
  verificationStatus = 'pending', 
  rejectionReason 
}) => {
  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'verified': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verified': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusBadgeVariant = () => {
    switch (verificationStatus) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const StatusIcon = getStatusIcon();

  const renderVerificationStatus = () => {
    if (verificationStatus === 'verified') {
      return (
        <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
          <CheckCircle className="h-5 w-5" />
          <div>
            <div className="font-semibold">Verified</div>
            <div className="text-sm opacity-75">Institution approved</div>
          </div>
        </div>
      );
    }

    if (verificationStatus === 'rejected') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 text-red-800 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <div className="font-semibold">Verification Rejected</div>
          </div>
          <div className="text-red-700 text-sm mb-3">
            {rejectionReason || "Documents provided were unclear or incomplete. Please ensure all documents are clearly visible and meet the requirements."}
          </div>
          <Button variant="destructive" size="sm">
            Resubmit Documents
          </Button>
        </div>
      );
    }

    // Pending status
    return (
      <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
        <Clock className="h-5 w-5" />
        <div>
          <div className="font-semibold">Under Review</div>
          <div className="text-sm opacity-75">Submitted {new Date().toLocaleDateString()}</div>
        </div>
      </div>
    );
  };

  const verificationSteps = [
    {
      step: 1,
      title: "Institution Details",
      description: "Basic information about your healthcare institution",
      completed: true
    },
    {
      step: 2,
      title: "Representative Information",
      description: "Details about the institution representative",
      completed: true
    },
    {
      step: 3,
      title: "Facilities & Services",
      description: "Information about your facilities and services offered",
      completed: true
    },
    {
      step: 4,
      title: "Documentation",
      description: "Upload required licenses and certificates",
      completed: verificationStatus !== 'pending'
    },
    {
      step: 5,
      title: "Verification Review",
      description: "Our team reviews your submission",
      completed: verificationStatus === 'verified'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Institution Verification</h1>
              <p className="text-gray-600 mt-2">
                Complete your institution verification to start posting jobs and hiring healthcare professionals.
              </p>
            </div>
            {/* Current Status */}
            <div className="text-right">
              {renderVerificationStatus()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
        {/* Profile Form - Always show, styled better */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h2 className="text-2xl font-bold">Institution Profile Form</h2>
            <p className="mt-2 opacity-90">
              {verificationStatus === 'rejected' 
                ? "Please review and update your information based on the rejection feedback."
                : verificationStatus === 'verified'
                ? "Your institution is verified! You can update your information anytime."
                : "Complete all sections to submit for verification."
              }
            </p>
          </div>
          <div className="p-8">
            <EmployerProfileForm />
          </div>
        </div>

        {/* Help Section - Moved to bottom and simplified */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Assistance?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Verification Timeline</h4>
              <p className="text-gray-600">Typically takes 2-3 business days for review and approval.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Required Documents</h4>
              <p className="text-gray-600">Institution registration, licenses, and representative ID required.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Support</h4>
              <p className="text-gray-600">
                <a href="#" className="text-blue-600 hover:text-blue-800 underline">Contact our support team</a> for assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationTab;
