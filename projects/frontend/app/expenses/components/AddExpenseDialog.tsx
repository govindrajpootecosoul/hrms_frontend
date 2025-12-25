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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (expense: any) => void;
}

const categories = ['Travel', 'Meals', 'Client Visit', 'Office Supplies', 'Internet', 'Other'];
const paymentModes = ['Cash', 'Card', 'UPI', 'Bank Transfer'];

export default function AddExpenseDialog({ open, onOpenChange, onSave }: AddExpenseDialogProps) {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    category: '',
    date: '',
    amount: '',
    paymentMode: '',
    projectCode: '',
    description: '',
    receiptName: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      employeeName: '',
      employeeId: '',
      category: '',
      date: '',
      amount: '',
      paymentMode: '',
      projectCode: '',
      description: '',
      receiptName: '',
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    ['employeeName', 'category', 'date', 'amount', 'paymentMode'].forEach((field) => {
      if (!(formData as any)[field]) {
        newErrors[field] = 'Required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const expense = {
      id: `EXP${Date.now().toString().slice(-4)}`,
      employeeName: formData.employeeName,
      employeeId: formData.employeeId || `EMP${Math.floor(Math.random() * 900 + 100)}`,
      category: formData.category,
      date: formData.date,
      amount: Number(formData.amount),
      paymentMode: formData.paymentMode,
      projectCode: formData.projectCode,
      description: formData.description,
      receiptUrl: formData.receiptName ? `/uploads/${formData.receiptName}` : undefined,
      status: 'Pending',
    };

    onSave(expense);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Capture non-advance based expense with supporting details.
          </DialogDescription>
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
                placeholder="Auto-generated if blank"
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>
            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount (₹) *</Label>
              <Input
                type="number"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
            </div>
            <div>
              <Label>Payment Mode *</Label>
              <Select
                value={formData.paymentMode}
                onValueChange={(value) => setFormData({ ...formData, paymentMode: value })}
              >
                <SelectTrigger className={errors.paymentMode ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentModes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentMode && <p className="text-xs text-red-500 mt-1">{errors.paymentMode}</p>}
            </div>
          </div>

  <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Project / Client Code</Label>
              <Input
                value={formData.projectCode}
                onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
              />
            </div>
            <div>
              <Label>Receipt Upload</Label>
              <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      receiptName: e.target.files?.[0]?.name || '',
                    })
                  }
                />
              </div>
              {formData.receiptName && (
                <p className="text-xs text-muted-foreground mt-1">
                  Selected: {formData.receiptName}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              rows={3}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Expense</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


