'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, User, X } from 'lucide-react';
import { API_BASE_URL } from '@/lib/utils/constants';

const EmployeeSelect = ({ 
  value = '', 
  onChange, 
  placeholder = 'Select Employee',
  className = '',
  showUnassigned = true,
  error = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch employees from API
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      
      // Get selected company from sessionStorage
      const selectedCompany = typeof window !== 'undefined' ? sessionStorage.getItem('selectedCompany') : null;
      
      // Build API URL with company filter if available
      let apiUrl = `${API_BASE_URL}/admin-users`;
      if (selectedCompany) {
        apiUrl += `?company=${encodeURIComponent(selectedCompany)}`;
      }
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.users) {
        // Transform users to employee format
        const employeeList = data.users
          .filter(user => user.active !== false) // Only active users
          .map(user => ({
            id: user.id || user._id,
            name: user.name || '',
            email: user.email || '',
            employeeId: user.employeeId || '',
            department: user.department || ''
          }))
          .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
        
        setEmployees(employeeList);
        console.log(`[EmployeeSelect] Loaded ${employeeList.length} employees${selectedCompany ? ` for company: ${selectedCompany}` : ''}`);
      } else {
        throw new Error(data.error || 'Failed to fetch employees');
      }
    } catch (err) {
      console.error('[EmployeeSelect] Error fetching employees:', err);
      setErrorMessage(err.message || 'Failed to load employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter employees based on search query
  const filteredEmployees = employees.filter(emp => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      (emp.employeeId && emp.employeeId.toLowerCase().includes(query)) ||
      (emp.department && emp.department.toLowerCase().includes(query))
    );
  });

  const selectedEmployee = employees.find(emp => emp.name === value || emp.id === value);

  const handleSelect = (employee) => {
    onChange(employee.name);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    onChange('');
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-xs font-medium text-neutral-700 mb-1">
        Assigned To
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-1.5 text-sm rounded-lg border ${
            error || errorMessage
              ? 'border-red-500'
              : 'border-neutral-300'
          } bg-white text-left flex items-center justify-between cursor-pointer hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300`}
        >
          <span className={selectedEmployee ? 'text-neutral-900' : 'text-neutral-400'}>
            {selectedEmployee ? (
              <span className="flex items-center gap-2">
                <User className="w-3 h-3 text-neutral-500" />
                <span>{selectedEmployee.name}</span>
                {selectedEmployee.employeeId && (
                  <span className="text-xs text-neutral-500">({selectedEmployee.employeeId})</span>
                )}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <div className="flex items-center gap-1">
            {value && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear(e);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClear(e);
                  }
                }}
                className="p-0.5 hover:bg-neutral-100 rounded cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                aria-label="Clear selection"
              >
                <X className="w-3 h-3 text-neutral-400" />
              </span>
            )}
            <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col">
            {/* Search Input */}
            <div className="p-2 border-b border-neutral-200">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-neutral-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, ID, or department..."
                  className="w-full pl-7 pr-2 py-1.5 text-xs border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="p-4 text-center text-xs text-neutral-500">
                Loading employees...
              </div>
            )}

            {/* Error State */}
            {errorMessage && !loading && (
              <div className="p-4 text-center text-xs text-red-600">
                {errorMessage}
                <button
                  onClick={fetchEmployees}
                  className="ml-2 text-blue-600 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Employee List */}
            {!loading && !errorMessage && (
              <div className="overflow-y-auto max-h-48">
                {showUnassigned && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange('');
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full px-3 py-2 text-xs text-left hover:bg-neutral-100 transition-colors ${
                      !value ? 'bg-blue-50 text-blue-700' : 'text-neutral-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <X className="w-3 h-3" />
                      Unassigned
                    </span>
                  </button>
                )}
                
                {filteredEmployees.length === 0 ? (
                  <div className="p-4 text-center text-xs text-neutral-500">
                    {searchQuery ? 'No employees found matching your search.' : 'No employees available.'}
                  </div>
                ) : (
                  filteredEmployees.map((employee) => (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() => handleSelect(employee)}
                      className={`w-full px-3 py-2 text-xs text-left hover:bg-neutral-100 transition-colors ${
                        value === employee.name ? 'bg-blue-50 text-blue-700' : 'text-neutral-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-neutral-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{employee.name}</div>
                          <div className="text-neutral-500 text-xs truncate">
                            {employee.email}
                            {employee.employeeId && ` • ${employee.employeeId}`}
                            {employee.department && ` • ${employee.department}`}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Footer with count */}
            {!loading && !errorMessage && filteredEmployees.length > 0 && (
              <div className="px-3 py-1.5 border-t border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
                Showing {filteredEmployees.length} of {employees.length} employees
              </div>
            )}
          </div>
        )}
      </div>
      {(error || errorMessage) && (
        <p className="text-xs text-red-600 mt-1">{error || errorMessage}</p>
      )}
    </div>
  );
};

export default EmployeeSelect;

