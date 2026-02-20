'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Video, X } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function ScheduleInterviewDialog({ open, onOpenChange, onSchedule, candidateName = '', initialData = null }) {
  const [formData, setFormData] = useState({
    interviewer: initialData?.interviewer || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    meetingLink: initialData?.meetingLink || '',
  });

  const [errors, setErrors] = useState({});

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        interviewer: initialData.interviewer || '',
        date: initialData.date || '',
        time: initialData.time || '',
        meetingLink: initialData.meetingLink || '',
      });
    }
  }, [initialData]);

  const generateMeetingLink = () => {
    // Generate a random meeting link (in real app, this would call an API)
    const randomId = Math.random().toString(36).substring(2, 15);
    const meetingLink = `https://meet.example.com/${randomId}`;
    setFormData({ ...formData, meetingLink });
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.interviewer || formData.interviewer.trim() === '') {
      newErrors.interviewer = 'Interviewer name is required';
      isValid = false;
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
      isValid = false;
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSchedule = () => {
    if (validateForm()) {
      // Auto-generate meeting link if not provided
      if (!formData.meetingLink) {
        generateMeetingLink();
      }
      
      const interviewData = {
        ...formData,
        candidateName,
        scheduledAt: new Date(`${formData.date}T${formData.time}`).toISOString(),
      };
      
      onSchedule(interviewData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      interviewer: '',
      date: '',
      time: '',
      meetingLink: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <>
      {/* CSS to prevent LastPass and other password managers from interfering with date/time inputs */}
      <style dangerouslySetInnerHTML={{__html: `
        input[type="date"][data-lpignore="true"],
        input[type="time"][data-lpignore="true"] {
          position: relative !important;
          z-index: 1 !important;
        }
        input[type="date"][data-lpignore="true"]::-webkit-calendar-picker-indicator,
        input[type="time"][data-lpignore="true"]::-webkit-calendar-picker-indicator {
          cursor: pointer !important;
          position: absolute !important;
          right: 0.75rem !important;
          width: 20px !important;
          height: 20px !important;
          opacity: 1 !important;
          z-index: 10 !important;
        }
        input[type="date"][data-lpignore="true"]::-webkit-inner-spin-button,
        input[type="date"][data-lpignore="true"]::-webkit-clear-button,
        input[type="time"][data-lpignore="true"]::-webkit-inner-spin-button {
          z-index: 1 !important;
        }
        /* Hide LastPass icons on date/time fields */
        div[data-lastpass-icon-root],
        div[data-lastpass-root] {
          display: none !important;
        }
        input[type="date"][data-lpignore="true"],
        input[type="time"][data-lpignore="true"] {
          cursor: pointer !important;
        }
      `}} />
    <Modal
      isOpen={open}
      onClose={handleClose}
      title={initialData ? "Edit Interview" : "Schedule Interview"}
      size="md"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button
            onClick={handleClose}
            className="bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {initialData ? "Update Interview" : "Schedule Interview"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {candidateName && (
          <div className="mb-4">
            <p className="text-sm text-slate-600">Schedule an interview for</p>
            <p className="text-lg font-semibold text-slate-900">{candidateName}</p>
          </div>
        )}

        {/* Error Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Interviewer Field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Interviewer</label>
          <Input
            value={formData.interviewer}
            onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
            placeholder="Enter interviewer name"
            className={errors.interviewer ? 'border-red-500' : ''}
          />
          {errors.interviewer && <p className="text-sm text-red-500 mt-1">{errors.interviewer}</p>}
        </div>

        {/* Date Field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <div className="relative">
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`${errors.date ? 'border-red-500' : ''} pr-10`}
              data-lpignore="true"
              data-form-type="other"
              autoComplete="off"
              style={{ position: 'relative', zIndex: 1 }}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Calendar className="w-5 h-5 text-neutral-400" />
            </div>
          </div>
          {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
        </div>

        {/* Time Field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
          <div className="relative">
            <Input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className={`${errors.time ? 'border-red-500' : ''} pr-10`}
              data-lpignore="true"
              data-form-type="other"
              autoComplete="off"
              style={{ position: 'relative', zIndex: 1 }}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Clock className="w-5 h-5 text-neutral-400" />
            </div>
          </div>
          {errors.time && <p className="text-sm text-red-500 mt-1">{errors.time}</p>}
        </div>

        {/* Meeting Link Field */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Link</label>
          <div className="relative">
            <Input
              value={formData.meetingLink}
              onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
              placeholder="Enter meeting link or click icon to generate"
              className="pr-10"
            />
            <button
              type="button"
              onClick={generateMeetingLink}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-70 transition-opacity"
              title="Generate meeting link"
            >
              <Video className="w-5 h-5 text-blue-600" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">Auto-generated meeting link</p>
        </div>
      </div>
    </Modal>
    </>
  );
}

