'use client';

import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { X, User, Mail, Phone, Calendar, MapPin, Building2, Briefcase, CreditCard, Shield, FileText } from 'lucide-react';

export default function ViewEmployeeDetailsDialog({
  open,
  onClose,
  employee
}) {
  if (!employee) return null;

  const formatDate = (date) => {
    if (!date) return 'Not provided';
    if (typeof date === 'string' && date.includes('T')) {
      return new Date(date).toLocaleDateString('en-GB');
    }
    return date;
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={`Employee Details - ${employee.name || 'N/A'}`}
      size="lg"
      footer={
        <div className="flex justify-end w-full">
          <Button
            onClick={onClose}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Basic Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Full Name</label>
              <p className="text-sm text-slate-900 mt-1">{employee.name || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Employee ID</label>
              <p className="text-sm text-slate-900 mt-1">{employee.employeeId || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <p className="text-sm text-slate-900 mt-1">{employee.email || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Phone
              </label>
              <p className="text-sm text-slate-900 mt-1">{employee.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Date of Birth
              </label>
              <p className="text-sm text-slate-900 mt-1">{formatDate(employee.dateOfBirth) || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Gender</label>
              <p className="text-sm text-slate-900 mt-1">{employee.gender || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Personal Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-600">Address</label>
              <p className="text-sm text-slate-900 mt-1">{employee.address || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">City</label>
              <p className="text-sm text-slate-900 mt-1">{employee.city || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">State</label>
              <p className="text-sm text-slate-900 mt-1">{employee.state || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Zip Code</label>
              <p className="text-sm text-slate-900 mt-1">{employee.zipCode || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Emergency Contact</label>
              <p className="text-sm text-slate-900 mt-1">{employee.emergencyContact || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Emergency Phone</label>
              <p className="text-sm text-slate-900 mt-1">{employee.emergencyPhone || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Work Details */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Work Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Job Title</label>
              <p className="text-sm text-slate-900 mt-1">{employee.jobTitle || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                Department
              </label>
              <p className="text-sm text-slate-900 mt-1">{employee.department || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Company</label>
              <p className="text-sm text-slate-900 mt-1">{employee.company || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Location</label>
              <p className="text-sm text-slate-900 mt-1">{employee.location || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Reporting Manager</label>
              <p className="text-sm text-slate-900 mt-1">{employee.reportingManager || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joining Date
              </label>
              <p className="text-sm text-slate-900 mt-1">{formatDate(employee.joiningDate) || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Tenure</label>
              <p className="text-sm text-slate-900 mt-1">{employee.tenure || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Role</label>
              <p className="text-sm text-slate-900 mt-1 capitalize">{employee.role || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Status</label>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                employee.status === 'Active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {employee.status || 'Not provided'}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Credential Access
              </label>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                employee.hasCredentialAccess 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {employee.hasCredentialAccess ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Subscription Access
              </label>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                employee.hasSubscriptionAccess 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {employee.hasSubscriptionAccess ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Bank & Insurance Details */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Bank & Insurance Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Bank Account Number</label>
              <p className="text-sm text-slate-900 mt-1">{employee.bankAccount || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">IFSC Code</label>
              <p className="text-sm text-slate-900 mt-1">{employee.ifsc || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                PAN Number
              </label>
              <p className="text-sm text-slate-900 mt-1">{employee.pan || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Aadhaar Number</label>
              <p className="text-sm text-slate-900 mt-1">{employee.aadhaar || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">UAN Number</label>
              <p className="text-sm text-slate-900 mt-1">{employee.uan || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">ESI Number</label>
              <p className="text-sm text-slate-900 mt-1">{employee.esiNo || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">PF Number</label>
              <p className="text-sm text-slate-900 mt-1">{employee.pfNo || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

