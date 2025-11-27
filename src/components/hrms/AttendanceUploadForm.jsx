'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';

const AttendanceUploadForm = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [uploadMethod, setUploadMethod] = useState('manual'); // 'manual' or 'csv'
  const [formData, setFormData] = useState({
    date: '',
    timeIn: '',
    timeOut: '',
    biometricId: '',
    status: 'present'
  });
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleManualChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrors(prev => ({
        ...prev,
        file: 'Please select a CSV file'
      }));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        file: 'File size must be less than 10MB'
      }));
      return;
    }

    setCsvFile(file);
    setErrors(prev => ({ ...prev, file: '' }));

    // Preview CSV content
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target.result;
      const lines = csv.split('\n').slice(0, 6); // Show first 5 rows
      setCsvPreview(lines);
    };
    reader.readAsText(file);
  };

  const validateManualForm = () => {
    const newErrors = {};
    
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.biometricId) newErrors.biometricId = 'Biometric ID is required';
    if (!formData.timeIn) newErrors.timeIn = 'Time In is required';
    if (!formData.timeOut) newErrors.timeOut = 'Time Out is required';
    
    // Validate time logic
    if (formData.timeIn && formData.timeOut) {
      const timeIn = new Date(`2000-01-01 ${formData.timeIn}`);
      const timeOut = new Date(`2000-01-01 ${formData.timeOut}`);
      if (timeOut <= timeIn) {
        newErrors.timeOut = 'Time Out must be after Time In';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCsvForm = () => {
    const newErrors = {};
    
    if (!csvFile) {
      newErrors.file = 'Please select a CSV file';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (uploadMethod === 'manual') {
      if (validateManualForm()) {
        onSubmit({
          method: 'manual',
          data: formData
        });
      }
    } else {
      if (validateCsvForm()) {
        onSubmit({
          method: 'csv',
          file: csvFile
        });
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const event = {
        target: { files: [file] }
      };
      handleFileUpload(event);
    }
  };

  const removeFile = () => {
    setCsvFile(null);
    setCsvPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Method Selection */}
      <div className="flex space-x-4">
        <button
          onClick={() => setUploadMethod('manual')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            uploadMethod === 'manual'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setUploadMethod('csv')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            uploadMethod === 'csv'
              ? 'bg-primary-600 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          CSV Upload
        </button>
      </div>

      {uploadMethod === 'manual' ? (
        <Card title="Manual Attendance Entry">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => handleManualChange('date', e.target.value)}
              error={errors.date}
              required
            />
            
            <Input
              label="Biometric ID"
              value={formData.biometricId}
              onChange={(e) => handleManualChange('biometricId', e.target.value)}
              error={errors.biometricId}
              required
            />
            
            <Input
              label="Time In"
              type="time"
              value={formData.timeIn}
              onChange={(e) => handleManualChange('timeIn', e.target.value)}
              error={errors.timeIn}
              required
            />
            
            <Input
              label="Time Out"
              type="time"
              value={formData.timeOut}
              onChange={(e) => handleManualChange('timeOut', e.target.value)}
              error={errors.timeOut}
              required
            />
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleManualChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="half-day">Half Day</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="CSV Upload">
          <div className="space-y-6">
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                csvFile
                  ? 'border-secondary-300 bg-secondary-50'
                  : 'border-neutral-300 hover:border-primary-400'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {csvFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-secondary-600" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-neutral-900">{csvFile.name}</p>
                    <p className="text-sm text-neutral-600">
                      {(csvFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    onClick={removeFile}
                    icon={<X className="w-4 h-4" />}
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Upload className="w-12 h-12 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-neutral-900">
                      Drop your CSV file here
                    </p>
                    <p className="text-sm text-neutral-600">
                      or click to browse
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                </div>
              )}
            </div>

            {errors.file && (
              <div className="flex items-center text-sm text-danger-600">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.file}
              </div>
            )}

            {/* CSV Preview */}
            {csvPreview && (
              <div className="space-y-3">
                <h4 className="font-medium text-neutral-900">CSV Preview</h4>
                <div className="bg-neutral-50 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-neutral-700">
                    {csvPreview.join('\n')}
                  </pre>
                </div>
                <p className="text-xs text-neutral-500">
                  Showing first 5 rows. Make sure your CSV has columns: Date, Biometric ID, Time In, Time Out, Status
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
          icon={<FileText className="w-4 h-4" />}
        >
          {uploadMethod === 'manual' ? 'Add Record' : 'Upload CSV'}
        </Button>
      </div>
    </div>
  );
};

export default AttendanceUploadForm;
