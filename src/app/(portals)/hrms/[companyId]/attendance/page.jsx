'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Upload } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import { useToast } from '@/components/common/Toast';
import PageHeader from '@/components/layout/PageHeader';
import AttendanceTable from '@/components/hrms/AttendanceTable';
import AttendanceUploadForm from '@/components/hrms/AttendanceUploadForm';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

const AttendancePage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  const toast = useToast();
  
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [attendance, setAttendance] = useState([
    {
      id: '1',
      date: '2023-12-01',
      biometricId: 'EMP001',
      employeeName: 'John Doe',
      status: 'present',
      timeIn: '09:00',
      timeOut: '18:00'
    },
    {
      id: '2',
      date: '2023-12-01',
      biometricId: 'EMP002',
      employeeName: 'Jane Smith',
      status: 'present',
      timeIn: '09:15',
      timeOut: '17:45'
    },
    {
      id: '3',
      date: '2023-12-01',
      biometricId: 'EMP003',
      employeeName: 'Mike Johnson',
      status: 'on-leave',
      timeIn: null,
      timeOut: null
    },
    {
      id: '4',
      date: '2023-12-02',
      biometricId: 'EMP001',
      employeeName: 'John Doe',
      status: 'present',
      timeIn: '08:45',
      timeOut: '18:15'
    },
    {
      id: '5',
      date: '2023-12-02',
      biometricId: 'EMP002',
      employeeName: 'Jane Smith',
      status: 'half-day',
      timeIn: '09:00',
      timeOut: '13:00'
    },
    {
      id: '6',
      date: '2023-12-02',
      biometricId: 'EMP003',
      employeeName: 'Mike Johnson',
      status: 'absent',
      timeIn: null,
      timeOut: null
    }
  ]);

  const handleUploadAttendance = () => {
    setShowUploadForm(true);
  };

  const handleSubmitAttendance = (data) => {
    if (data.method === 'manual') {
      // Add manual attendance record
      const newRecord = {
        id: Date.now().toString(),
        ...data.data,
        employeeName: 'Manual Entry' // In real app, fetch employee name by biometric ID
      };
      setAttendance(prev => [...prev, newRecord]);
      toast.success('Attendance record added successfully');
    } else {
      // Handle CSV upload
      toast.success('CSV file uploaded successfully');
    }
    
    setShowUploadForm(false);
  };

  const handleStatusUpdate = (recordId, newStatus) => {
    setAttendance(prev => prev.map(record => 
      record.id === recordId 
        ? { ...record, status: newStatus }
        : record
    ));
    toast.success('Attendance status updated successfully');
  };

  const handleExportAttendance = () => {
    toast.success('Attendance data exported successfully');
  };

  return (
    <div className="min-h-screen space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Attendance Management"
        description="Track and manage employee attendance records"
        actions={[
          <Button
            key="upload-attendance"
            onClick={handleUploadAttendance}
            icon={<Upload className="w-4 h-4" />}
          >
            Upload Attendance
          </Button>
        ]}
      />

      {/* Attendance Table */}
      <AttendanceTable
        attendance={attendance}
        onStatusUpdate={handleStatusUpdate}
        onExport={handleExportAttendance}
      />

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadForm}
        onClose={() => setShowUploadForm(false)}
        title="Upload Attendance"
        size="xl"
      >
        <AttendanceUploadForm
          onSubmit={handleSubmitAttendance}
          onCancel={() => setShowUploadForm(false)}
        />
      </Modal>
    </div>
  );
};

export default AttendancePage;
