import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EmploymentList from '../components/employee-management/EmploymentList';
import AbsenceManagement from '../components/employee-management/AbsenceManagement';

const EmployeeManagementPage: React.FC = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<'candidate' | 'recruiter' | 'admin'>('candidate');
  const [activeTab, setActiveTab] = useState('employment');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication and get user role
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Get user role from token or API call
    // For now, we'll assume role based on URL or localStorage
    const role = localStorage.getItem('userRole') as 'candidate' | 'recruiter' | 'admin' || 'candidate';
    setUserRole(role);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'employment', name: 'Employment Records', roles: ['candidate', 'recruiter', 'admin'] },
    { id: 'absence', name: 'Absence Management', roles: ['candidate', 'recruiter', 'admin'] },
    { id: 'performance', name: 'Performance Reviews', roles: ['recruiter', 'admin'] },
    { id: 'availability', name: 'Availability', roles: ['candidate', 'recruiter', 'admin'] },
  ].filter(tab => tab.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="mt-2 text-gray-600">
            {userRole === 'candidate' 
              ? 'Manage your employment records and time-off requests'
              : userRole === 'recruiter'
              ? 'Manage your hospital\'s employee records and approvals'
              : 'Comprehensive employee management system'
            }
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'employment' && (
            <EmploymentList userRole={userRole} />
          )}
          
          {activeTab === 'absence' && (
            <AbsenceManagement userRole={userRole} />
          )}
          
          {activeTab === 'performance' && (
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Reviews</h3>
              <p className="text-gray-600">Performance review component coming soon...</p>
            </div>
          )}
          
          {activeTab === 'availability' && (
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Availability</h3>
              <p className="text-gray-600">Availability management component coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagementPage;
