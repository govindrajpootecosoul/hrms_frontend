'use client';

import { useState, useMemo } from 'react';
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
import { Textarea } from '@/components/hrms-1/ui/textarea';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/hrms-1/ui/tabs';
import { Card, CardContent } from '@/components/hrms-1/ui/card';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (expense: any) => void;
  advances?: any[];
  existingExpenses?: any[];
}

// Budget categories - these should map to the advance budget types
const budgetCategories = ['Annual', 'Project-based', 'Department-based', 'Event-based', 'Travel', 'Meals', 'Client Visit', 'Office Supplies', 'Internet', 'Other'];
const paymentModes = ['Cash', 'Bank', 'UPI', 'Card'];
const statusOptions = ['Draft', 'Submitted', 'Approved', 'Rejected', 'Reimbursed'];

export default function AddExpenseDialog({ open, onOpenChange, onSave, advances = [], existingExpenses = [] }: AddExpenseDialogProps) {
  const generateExpenseId = () => {
    return `EXP${Date.now().toString().slice(-6)}`;
  };

  const [formData, setFormData] = useState({
    expenseId: generateExpenseId(),
    dateOfExpense: '',
    amount: '',
    category: '',
    vendorPayee: '',
    paymentMode: '',
    referenceNo: '',
    billUpload: '',
    remarks: '',
    advanceId: '',
    projectCampaign: '',
    department: '',
    submittedBy: '',
    status: 'Draft',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate advance balance information
  const selectedAdvance = useMemo(() => {
    if (!formData.advanceId) return null;
    return advances.find(adv => adv.id === formData.advanceId || adv.advanceId === formData.advanceId);
  }, [formData.advanceId, advances]);

  // Calculate spent amount from existing expenses linked to this advance
  const spentAmount = useMemo(() => {
    if (!selectedAdvance) return 0;
    const advanceId = selectedAdvance.id || selectedAdvance.advanceId;
    return existingExpenses
      .filter(exp => (exp.advanceId === advanceId) && exp.id !== formData.expenseId)
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);
  }, [selectedAdvance, existingExpenses, formData.expenseId]);

  // Get allocated amount from advance
  const allocatedAmount = useMemo(() => {
    if (!selectedAdvance) return 0;
    // Check if it's a CreateAdvance type (has totalAdvanceAmount) or AdvanceRequest type (has requestedAmount)
    return selectedAdvance.totalAdvanceAmount || selectedAdvance.requestedAmount || selectedAdvance.releasedAmount || 0;
  }, [selectedAdvance]);

  // Calculate remaining balance
  const remainingBalance = useMemo(() => {
    if (!selectedAdvance) return null;
    const currentExpenseAmount = parseFloat(formData.amount) || 0;
    return allocatedAmount - spentAmount - currentExpenseAmount;
  }, [selectedAdvance, allocatedAmount, spentAmount, formData.amount]);

  const resetForm = () => {
    setFormData({
      expenseId: generateExpenseId(),
      dateOfExpense: '',
      amount: '',
      category: '',
      vendorPayee: '',
      paymentMode: '',
      referenceNo: '',
      billUpload: '',
      remarks: '',
      advanceId: '',
      projectCampaign: '',
      department: '',
      submittedBy: '',
      status: 'Draft',
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
    if (!formData.dateOfExpense) newErrors.dateOfExpense = 'Required';
    if (!formData.amount) newErrors.amount = 'Required';
    if (!formData.category) newErrors.category = 'Required';
    if (!formData.vendorPayee) newErrors.vendorPayee = 'Required';
    if (!formData.paymentMode) newErrors.paymentMode = 'Required';
    if (!formData.submittedBy) newErrors.submittedBy = 'Required';

    // Validate advance balance if advance is selected
    if (formData.advanceId && selectedAdvance) {
      const expenseAmount = parseFloat(formData.amount) || 0;
      if (remainingBalance !== null && remainingBalance < 0) {
        newErrors.amount = `Expense amount exceeds available balance. Remaining: ₹${(remainingBalance + expenseAmount).toLocaleString()}`;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const expense = {
      id: formData.expenseId,
      expenseId: formData.expenseId,
      dateOfExpense: formData.dateOfExpense,
      date: formData.dateOfExpense, // Keep for backward compatibility
      amount: parseFloat(formData.amount),
      category: formData.category,
      vendorPayee: formData.vendorPayee,
      paymentMode: formData.paymentMode,
      referenceNo: formData.referenceNo,
      invoiceNo: formData.referenceNo, // Alias
      billUpload: formData.billUpload ? `/uploads/${formData.billUpload}` : undefined,
      receiptUrl: formData.billUpload ? `/uploads/${formData.billUpload}` : undefined, // Keep for backward compatibility
      remarks: formData.remarks,
      advanceId: formData.advanceId,
      projectCampaign: formData.projectCampaign,
      projectCode: formData.projectCampaign, // Keep for backward compatibility
      department: formData.department,
      submittedBy: formData.submittedBy,
      status: formData.status,
      employeeName: formData.submittedBy, // Keep for backward compatibility
      createdAt: new Date().toISOString(),
    };

    onSave(expense);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Fill in the expense details below. All required fields are marked with *.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="expense-details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expense-details">Expense Details & Allocation</TabsTrigger>
            <TabsTrigger value="attachment">Attachment</TabsTrigger>
            <TabsTrigger value="approval">Approval</TabsTrigger>
          </TabsList>

          {/* Expense Details & Allocation Tab (Merged) */}
          <TabsContent value="expense-details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expenseId">Expense ID</Label>
                <Input
                  id="expenseId"
                  value={formData.expenseId}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">Auto-generated</p>
              </div>
              <div>
                <Label htmlFor="dateOfExpense">Date of Expense *</Label>
                <Input
                  id="dateOfExpense"
                  type="date"
                  value={formData.dateOfExpense}
                  onChange={(e) => {
                    setFormData({ ...formData, dateOfExpense: e.target.value });
                    if (errors.dateOfExpense) setErrors({ ...errors, dateOfExpense: '' });
                  }}
                  className={errors.dateOfExpense ? 'border-red-500' : ''}
                />
                {errors.dateOfExpense && <p className="text-xs text-red-500 mt-1">{errors.dateOfExpense}</p>}
              </div>
              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => {
                    setFormData({ ...formData, amount: e.target.value });
                    if (errors.amount) setErrors({ ...errors, amount: '' });
                  }}
                  className={errors.amount ? 'border-red-500' : ''}
                />
                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
              </div>
              <div>
                <Label htmlFor="category">Category * (must map to budget category)</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData({ ...formData, category: value });
                    if (errors.category) setErrors({ ...errors, category: '' });
                  }}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </div>
              <div>
                <Label htmlFor="vendorPayee">Vendor / Payee *</Label>
                <Input
                  id="vendorPayee"
                  placeholder="Enter vendor or payee name"
                  value={formData.vendorPayee}
                  onChange={(e) => {
                    setFormData({ ...formData, vendorPayee: e.target.value });
                    if (errors.vendorPayee) setErrors({ ...errors, vendorPayee: '' });
                  }}
                  className={errors.vendorPayee ? 'border-red-500' : ''}
                />
                {errors.vendorPayee && <p className="text-xs text-red-500 mt-1">{errors.vendorPayee}</p>}
              </div>
              <div>
                <Label htmlFor="paymentMode">Payment Mode *</Label>
                <Select
                  value={formData.paymentMode}
                  onValueChange={(value) => {
                    setFormData({ ...formData, paymentMode: value });
                    if (errors.paymentMode) setErrors({ ...errors, paymentMode: '' });
                  }}
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
              <div className="col-span-2">
                <Label htmlFor="referenceNo">Reference No / Invoice No</Label>
                <Input
                  id="referenceNo"
                  placeholder="Enter reference or invoice number"
                  value={formData.referenceNo}
                  onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                />
              </div>
            </div>

            {/* Allocation Section */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-4">Allocation</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="advanceId">Advance ID (auto-linked)</Label>
                  <Select
                    value={formData.advanceId || undefined}
                    onValueChange={(value) => setFormData({ ...formData, advanceId: value === 'NONE' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select advance or leave blank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NONE">None</SelectItem>
                      {advances.map((adv) => (
                        <SelectItem key={adv.id || adv.advanceId} value={adv.id || adv.advanceId}>
                          {adv.id || adv.advanceId} - {adv.advanceTitle || adv.purpose || ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">Link this expense to an advance if applicable</p>
                </div>
                <div>
                  <Label htmlFor="projectCampaign">Project / Campaign (if applicable)</Label>
                  <Input
                    id="projectCampaign"
                    placeholder="Enter project or campaign name"
                    value={formData.projectCampaign}
                    onChange={(e) => setFormData({ ...formData, projectCampaign: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="Enter department name"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              </div>

              {/* Advance Balance Information */}
              {selectedAdvance && (
                <Card className="mt-4">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Allocated Amount:</span>
                        <span className="text-sm font-semibold">₹{allocatedAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Already Spent:</span>
                        <span className="text-sm">₹{spentAmount.toLocaleString()}</span>
                      </div>
                      {formData.amount && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Current Expense:</span>
                          <span className="text-sm">₹{parseFloat(formData.amount || '0').toLocaleString()}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">Remaining Balance:</span>
                          <span className={`text-sm font-bold ${remainingBalance !== null && remainingBalance < 0 ? 'text-red-600' : remainingBalance !== null && remainingBalance === 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                            ₹{remainingBalance !== null ? remainingBalance.toLocaleString() : '0'}
                          </span>
                        </div>
                        {remainingBalance !== null && remainingBalance < 0 && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <span>Expense amount exceeds available balance!</span>
                          </div>
                        )}
                        {remainingBalance !== null && remainingBalance === 0 && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-yellow-600">
                            <AlertCircle className="h-4 w-4" />
                            <span>No remaining balance in this advance.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Attachment & Proof Tab */}
          <TabsContent value="attachment" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="billUpload">Bill Upload (PDF/Image)</Label>
                <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <input
                    id="billUpload"
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billUpload: e.target.files?.[0]?.name || '',
                      })
                    }
                    className="flex-1 text-sm"
                  />
                </div>
                {formData.billUpload && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Selected: {formData.billUpload}</span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  rows={4}
                  placeholder="Enter any additional remarks or notes..."
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>
            </div>
          </TabsContent>

          {/* Approval Flow Tab */}
          <TabsContent value="approval" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="submittedBy">Submitted By *</Label>
                <Input
                  id="submittedBy"
                  placeholder="Enter submitter name"
                  value={formData.submittedBy}
                  onChange={(e) => {
                    setFormData({ ...formData, submittedBy: e.target.value });
                    if (errors.submittedBy) setErrors({ ...errors, submittedBy: '' });
                  }}
                  className={errors.submittedBy ? 'border-red-500' : ''}
                />
                {errors.submittedBy && <p className="text-xs text-red-500 mt-1">{errors.submittedBy}</p>}
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Expense</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
