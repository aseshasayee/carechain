import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardHeader from "@/components/EmployerDashboard/DashboardHeader";
import EmployerSidebar from "@/components/EmployerDashboard/EmployerSidebar";
import OverviewTab from "@/components/EmployerDashboard/OverviewTab";
import ProfileTab from "@/components/EmployerDashboard/ProfileTab";
import VerificationTab from "@/components/EmployerDashboard/VerificationTab";
import JobsTab from "@/components/EmployerDashboard/JobsTab";
import CandidatesTab from "@/components/EmployerDashboard/CandidatesTab";
import AnalyticsTab from "@/components/EmployerDashboard/AnalyticsTab";
import NotificationsTab from "@/components/EmployerDashboard/NotificationsTab";
import SettingsTab from "@/components/EmployerDashboard/SettingsTab";

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'rejected'>('pending');
  const [demoMode, setDemoMode] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = () => {
    setActiveTab('notifications');
  };

  const handleSettingsClick = () => {
    setActiveTab('settings');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab verificationStatus={verificationStatus} onTabChange={setActiveTab} demoMode={demoMode} />;
      case 'profile':
        return <ProfileTab />;
      case 'verification':
        return <VerificationTab verificationStatus={verificationStatus} />;
      case 'jobs':
        return <JobsTab verificationStatus={verificationStatus} demoMode={demoMode} />;
      case 'candidates':
        return <CandidatesTab verificationStatus={verificationStatus} demoMode={demoMode} />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab verificationStatus={verificationStatus} onTabChange={setActiveTab} demoMode={demoMode} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <EmployerSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        verificationStatus={verificationStatus}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          onNotificationClick={handleNotificationClick}
          onSettingsClick={handleSettingsClick}
          onLogout={handleLogout}
          demoMode={demoMode}
          onDemoToggle={setDemoMode}
        />
        <main className="flex-1 overflow-y-auto">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default EmployerDashboard;