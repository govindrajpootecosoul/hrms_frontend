'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddAdvanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (advance: any) => void;
}

export default function AddAdvanceDialog({ open, onOpenChange, onSave }: AddAdvanceDialogProps) {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    requestedAmount: '',
    purpose: '',
    expectedStartDate: '',
    expectedEndDate: '',
    mode: 'Bank Transfer',
    itineraryName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClose = () => {
    setFormData({
      employeeName: '',
      employeeId: '',
      requestedAmount: '',
      purpose: '',
      expectedStartDate: '',
      expectedEndDate: '',
      mode: 'Bank Transfer',
      itineraryName: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  const handleSave = () => {
    const requiredFields = ['employeeName', 'requestedAmount', 'purpose'];
    const newErrors: Record<string, string> = {};

    requiredFields.forEach((field) => {
      if (!(formData as any)[field]) newErrors[field] = 'Required';
    });

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const advance = {
      id: `ADV${Date.now().toString().slice(-3)}`,
      employeeName: formData.employeeName,
      employeeId: formData.employeeId || `EMP${Math.floor(Math.random() * 900 + 100)}`,
      requestedAmount: Number(formData.requestedAmount),
      purpose: formData.purpose,
      requestedOn: new Date().toISOString().split('T')[0],
      expectedStartDate: formData.expectedStartDate,
      expectedEndDate: formData.expectedEndDate,
      mode: formData.mode,
      status: 'Requested',
      itineraryUrl: formData.itineraryName ? `/uploads/${formData.itineraryName}` : undefined,
    };

    onSave(advance);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Advance Request</DialogTitle>
          <DialogDescription>Submit advance requirement before travel or project spend.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Employee Name *</Label>
              <Input
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                className={errors.employeeName ? 'border-red-500' : ''}
              />
              {errors.employeeName && <p className="text-xs text-red-500 mt-1">{errors.employeeName}</p>}
            </div>
            <div>
              <Label>Employee ID</Label>
              <Input
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Requested Amount (₹) *</Label>
              <Input
                type="number"
                min="0"
                value={formData.requestedAmount}
                onChange={(e) => setFormData({ ...formData, requestedAmount: e.target.value })}
                className={errors.requestedAmount ? 'border-red-500' : ''}
              />
              {errors.requestedAmount && <p className="text-xs text-red-500 mt-1">{errors.requestedAmount}</p>}
            </div>
            <div>
              <Label>Mode *</Label>
              <Select value={formData.mode} onValueChange={(value) => setFormData({ ...formData, mode: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Purpose *</Label>
            <Textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              className={errors.purpose ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.purpose && <p className="text-xs text-red-500 mt-1">{errors.purpose}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Expected Start Date</Label>
              <Input
                type="date"
                value={formData.expectedStartDate}
                onChange={(e) => setFormData({ ...formData, expectedStartDate: e.target.value })}
              />
            </div>
            <div>
              <Label>Expected End Date</Label>
              <Input
                type="date"
                value={formData.expectedEndDate}
                onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Attach Itinerary (optional)</Label>
            <Input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) =>
                setFormData({ ...formData, itineraryName: e.target.files?.[0]?.name || '' })
              }
            />
            {formData.itineraryName && (
              <p className="text-xs text-muted-foreground mt-1">Selected: {formData.itineraryName}</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


