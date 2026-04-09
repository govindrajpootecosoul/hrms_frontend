'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/hrms-1/ui/dialog';
import { Button } from '@/components/hrms-1/ui/button';
import { Input } from '@/components/hrms-1/ui/input';
import { Label } from '@/components/hrms-1/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/hrms-1/ui/select';

interface CreateAdvanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (advance: any) => void;
}

export default function CreateAdvanceDialog({ open, onOpenChange, onSave }: CreateAdvanceDialogProps) {
  const generateAdvanceId = () => {
    return `ADV${Date.now().toString().slice(-6)}`;
  };

  const [formData, setFormData] = useState({
    advanceId: generateAdvanceId(),
    advanceTitle: '',
    budgetType: '',
    customBudgetType: '',
    totalAdvanceAmount: '',
    requestedBy: '',
    approvedBy: '',
    timeControl: '',
    startDate: '',
    endDate: '',
    financialYear: '',
    currency: 'INR',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      advanceId: generateAdvanceId(),
      advanceTitle: '',
      budgetType: '',
      customBudgetType: '',
      totalAdvanceAmount: '',
      requestedBy: '',
      approvedBy: '',
      timeControl: '',
      startDate: '',
      endDate: '',
      financialYear: '',
      currency: 'INR',
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.advanceTitle) newErrors.advanceTitle = 'Required';
    if (!formData.budgetType) {
      newErrors.budgetType = 'Required';
    } else if (formData.budgetType === 'Custom' && !formData.customBudgetType) {
      newErrors.customBudgetType = 'Please enter custom budget type';
    }
    if (!formData.totalAdvanceAmount) newErrors.totalAdvanceAmount = 'Required';
    if (!formData.requestedBy) newErrors.requestedBy = 'Required';
    if (!formData.startDate) newErrors.startDate = 'Required';
    if (!formData.endDate) newErrors.endDate = 'Required';
    if (!formData.financialYear) newErrors.financialYear = 'Required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Validate date range
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setErrors({ endDate: 'End date must be after start date' });
      return;
    }

    // Use custom budget type if Custom is selected, otherwise use the selected budget type
    const finalBudgetType = formData.budgetType === 'Custom' 
      ? formData.customBudgetType 
      : formData.budgetType;

    const advance = {
      id: formData.advanceId,
      advanceTitle: formData.advanceTitle,
      budgetType: finalBudgetType,
      totalAdvanceAmount: parseFloat(formData.totalAdvanceAmount),
      requestedBy: formData.requestedBy,
      approvedBy: formData.approvedBy,
      timeControl: formData.timeControl,
      startDate: formData.startDate,
      endDate: formData.endDate,
      financialYear: formData.financialYear,
      currency: formData.currency,
      createdAt: new Date().toISOString(),
    };

    onSave(advance);
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Advance</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new advance budget allocation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="advanceId">Advance ID</Label>
              <Input
                id="advanceId"
                value={formData.advanceId}
                readOnly
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Auto-generated</p>
            </div>
            <div>
              <Label htmlFor="advanceTitle">Advance Title *</Label>
              <Input
                id="advanceTitle"
                placeholder="e.g., Marketing Q1 Budget, Warehouse Ops Advance"
                value={formData.advanceTitle}
                onChange={(e) => {
                  setFormData({ ...formData, advanceTitle: e.target.value });
                  if (errors.advanceTitle) setErrors({ ...errors, advanceTitle: '' });
                }}
                className={errors.advanceTitle ? 'border-red-500' : ''}
              />
              {errors.advanceTitle && <p className="text-xs text-red-500 mt-1">{errors.advanceTitle}</p>}
            </div>
            <div>
              <Label htmlFor="budgetType">Budget Type *</Label>
              <Select 
                value={formData.budgetType} 
                onValueChange={(value) => {
                  setFormData({ ...formData, budgetType: value, customBudgetType: value === 'Custom' ? formData.customBudgetType : '' });
                  if (errors.budgetType) setErrors({ ...errors, budgetType: '', customBudgetType: '' });
                }}
              >
                <SelectTrigger className={errors.budgetType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select budget type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annual">Annual</SelectItem>
                  <SelectItem value="Project-based">Project-based</SelectItem>
                  <SelectItem value="Department-based">Department-based</SelectItem>
                  <SelectItem value="Event-based">Event-based</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {errors.budgetType && <p className="text-xs text-red-500 mt-1">{errors.budgetType}</p>}
              {formData.budgetType === 'Custom' && (
                <div className="mt-2">
                  <Input
                    id="customBudgetType"
                    placeholder="Enter custom budget type"
                    value={formData.customBudgetType}
                    onChange={(e) => {
                      setFormData({ ...formData, customBudgetType: e.target.value });
                      if (errors.customBudgetType) setErrors({ ...errors, customBudgetType: '' });
                    }}
                    className={errors.customBudgetType ? 'border-red-500' : ''}
                  />
                  {errors.customBudgetType && <p className="text-xs text-red-500 mt-1">{errors.customBudgetType}</p>}
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="totalAdvanceAmount">Total Advance Amount *</Label>
              <Input
                id="totalAdvanceAmount"
                type="number"
                placeholder="e.g., 10,00,000 per year / 10 LPA"
                value={formData.totalAdvanceAmount}
                onChange={(e) => {
                  setFormData({ ...formData, totalAdvanceAmount: e.target.value });
                  if (errors.totalAdvanceAmount) setErrors({ ...errors, totalAdvanceAmount: '' });
                }}
                className={errors.totalAdvanceAmount ? 'border-red-500' : ''}
              />
              {errors.totalAdvanceAmount && <p className="text-xs text-red-500 mt-1">{errors.totalAdvanceAmount}</p>}
            </div>
            <div>
              <Label htmlFor="requestedBy">Requested By *</Label>
              <Input
                id="requestedBy"
                placeholder="Enter requester name"
                value={formData.requestedBy}
                onChange={(e) => {
                  setFormData({ ...formData, requestedBy: e.target.value });
                  if (errors.requestedBy) setErrors({ ...errors, requestedBy: '' });
                }}
                className={errors.requestedBy ? 'border-red-500' : ''}
              />
              {errors.requestedBy && <p className="text-xs text-red-500 mt-1">{errors.requestedBy}</p>}
            </div>
            <div>
              <Label htmlFor="approvedBy">Approved By</Label>
              <Input
                id="approvedBy"
                placeholder="Enter approver name"
                value={formData.approvedBy}
                onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="timeControl">Time Control</Label>
              <Input
                id="timeControl"
                placeholder="e.g., Monthly, Quarterly, Yearly"
                value={formData.timeControl}
                onChange={(e) => setFormData({ ...formData, timeControl: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  setFormData({ ...formData, startDate: e.target.value });
                  if (errors.startDate) setErrors({ ...errors, startDate: '' });
                }}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => {
                  setFormData({ ...formData, endDate: e.target.value });
                  if (errors.endDate) setErrors({ ...errors, endDate: '' });
                }}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
            </div>
            <div>
              <Label htmlFor="financialYear">Financial Year *</Label>
              <Input
                id="financialYear"
                placeholder="e.g., 2024-25"
                value={formData.financialYear}
                onChange={(e) => {
                  setFormData({ ...formData, financialYear: e.target.value });
                  if (errors.financialYear) setErrors({ ...errors, financialYear: '' });
                }}
                className={errors.financialYear ? 'border-red-500' : ''}
              />
              {errors.financialYear && <p className="text-xs text-red-500 mt-1">{errors.financialYear}</p>}
            </div>
            <div>
              <Label htmlFor="currency">Currency *</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Create Advance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

