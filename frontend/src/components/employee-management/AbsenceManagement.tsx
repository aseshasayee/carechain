import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

interface AbsenceRequest {
  id: number;
  employee_name: string;
  absence_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  duration_days: number;
  employment_info: {
    job_title: string;
    department: string;
    hospital: string;
  };
  requested_by_name?: string;
  approved_by_name?: string;
  approval_notes?: string;
}

interface AbsenceManagementProps {
  userRole: 'candidate' | 'recruiter' | 'admin';
}

const AbsenceManagement: React.FC<AbsenceManagementProps> = ({ userRole }) => {
  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    absence_type: ''
  });

  const [newRequest, setNewRequest] = useState({
    absence_type: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchAbsenceRequests();
  }, [filters]);

  const fetchAbsenceRequests = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const response = await api.employeeManagement.getAbsenceRequests(params);
      
      if (response.ok) {
        const data = await response.json();
        setAbsenceRequests(data);
      } else {
        throw new Error('Failed to fetch absence requests');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.employeeManagement.createAbsenceRequest(newRequest);
      
      if (response.ok) {
        setNewRequest({
          absence_type: '',
          start_date: '',
          end_date: '',
          reason: ''
        });
        setShowCreateForm(false);
        fetchAbsenceRequests();
      } else {
        throw new Error('Failed to create absence request');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request');
    }
  };

  const handleApproval = async (id: number, action: 'approve' | 'reject', notes?: string) => {
    try {
      const response = await api.employeeManagement.approveAbsenceRequest(
        id.toString(), 
        action, 
        notes
      );
      
      if (response.ok) {
        fetchAbsenceRequests();
      } else {
        throw new Error(`Failed to ${action} absence request`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} request`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Absence Management</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage time-off requests and approvals
              </p>
            </div>
            {userRole === 'candidate' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Request Time Off
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Create Request Form */}
        {showCreateForm && userRole === 'candidate' && (
          <div className="px-6 py-4 bg-blue-50 border-b border-gray-200">
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Absence Type
                  </label>
                  <select
                    value={newRequest.absence_type}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, absence_type: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type...</option>
                    <option value="vacation">Vacation</option>
                    <option value="sick_leave">Sick Leave</option>
                    <option value="personal">Personal</option>
                    <option value="family_emergency">Family Emergency</option>
                    <option value="medical_appointment">Medical Appointment</option>
                    <option value="bereavement">Bereavement</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newRequest.start_date}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, start_date: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newRequest.end_date}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, end_date: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <textarea
                    value={newRequest.reason}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide a brief reason for your absence..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Absence Type
              </label>
              <select
                value={filters.absence_type}
                onChange={(e) => setFilters(prev => ({ ...prev, absence_type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="vacation">Vacation</option>
                <option value="sick_leave">Sick Leave</option>
                <option value="personal">Personal</option>
                <option value="family_emergency">Family Emergency</option>
                <option value="medical_appointment">Medical Appointment</option>
                <option value="bereavement">Bereavement</option>
              </select>
            </div>
          </div>
        </div>

        {/* Absence Requests List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {userRole === 'recruiter' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {absenceRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {request.employee_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.employment_info.job_title} - {request.employment_info.department}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {request.absence_type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {request.duration_days} day{request.duration_days !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(request.start_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      to {new Date(request.end_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={request.reason}>
                      {request.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.toUpperCase()}
                    </span>
                    {request.approved_by_name && (
                      <div className="text-xs text-gray-500 mt-1">
                        by {request.approved_by_name}
                      </div>
                    )}
                  </td>
                  {userRole === 'recruiter' && request.status === 'pending' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproval(request.id, 'approve')}
                          className="text-green-600 hover:text-green-900 px-2 py-1 border border-green-300 rounded text-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval(request.id, 'reject')}
                          className="text-red-600 hover:text-red-900 px-2 py-1 border border-red-300 rounded text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {absenceRequests.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No absence requests found</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbsenceManagement;
