import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

interface Employment {
  id: number;
  employee_name: string;
  job_title: string;
  department: string;
  employment_type: string;
  start_date: string;
  end_date?: string;
  salary: number;
  status: string;
  hospital_name: string;
  duration: string;
}

interface EmploymentListProps {
  userRole: 'candidate' | 'recruiter' | 'admin';
}

const EmploymentList: React.FC<EmploymentListProps> = ({ userRole }) => {
  const [employments, setEmployments] = useState<Employment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    employment_type: '',
    search: ''
  });

  useEffect(() => {
    fetchEmployments();
  }, [filters]);

  const fetchEmployments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: Record<string, string> = {};
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const response = await api.employeeManagement.getEmployments(params);
      
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        const employmentsArray = Array.isArray(data) ? data : (data.results || []);
        setEmployments(employmentsArray);
      } else {
        throw new Error('Failed to fetch employments');
      }
    } catch (err) {
      console.error('Error fetching employments:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setEmployments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      const response = await api.employeeManagement.updateEmployment(id.toString(), {
        status: newStatus
      });
      
      if (response.ok) {
        fetchEmployments(); // Refresh the list
      } else {
        throw new Error('Failed to update employment status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error: {error}</div>
        <button 
          onClick={fetchEmployments}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Employment Records</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage employment relationships and track employee status
          </p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by name or title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                placeholder="Department..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type
              </label>
              <select
                value={filters.employment_type}
                onChange={(e) => handleFilterChange('employment_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="per_diem">Per Diem</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employment List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
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
              {employments && Array.isArray(employments) && employments.map((employment) => (
                <tr key={employment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {employment.employee_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {employment.employment_type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employment.job_title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employment.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employment.duration}</div>
                    <div className="text-sm text-gray-500">
                      Since {new Date(employment.start_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      employment.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : employment.status === 'inactive'
                        ? 'bg-yellow-100 text-yellow-800'
                        : employment.status === 'terminated'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {employment.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  {userRole === 'recruiter' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={employment.status}
                        onChange={(e) => handleStatusUpdate(employment.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="on_leave">On Leave</option>
                        <option value="terminated">Terminated</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {employments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No employment records found</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmploymentList;
