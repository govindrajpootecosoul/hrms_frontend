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

interface SettleAdvanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  advance: any | null;
  onSettle: (payload: { advanceId: string; actualExpense: number; balance: number; balanceType: string }) => void;
}

export default function SettleAdvanceDialog({
  open,
  onOpenChange,
  advance,
  onSettle,
}: SettleAdvanceDialogProps) {
  const [actualExpense, setActualExpense] = useState('');

  const handleClose = () => {
    setActualExpense('');
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!advance) return;
    const actual = Number(actualExpense);
    if (!actual) return;
    const advanceAmount = advance.releasedAmount || advance.requestedAmount || 0;
    const balanceValue = advanceAmount - actual;
    const balance = Math.abs(balanceValue);
    const balanceType =
      balance === 0 ? 'Balanced' : balanceValue >= 0 ? 'Refund' : 'Recover';
    onSettle({
      advanceId: advance.id,
      actualExpense: actual,
      balance,
      balanceType,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settle Advance</DialogTitle>
          <DialogDescription>
            Upload actual spend against {advance?.employeeName}'s advance (₹{advance?.releasedAmount || advance?.requestedAmount}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Actual Expense (₹)</Label>
            <Input
              type="number"
              min="0"
              value={actualExpense}
              onChange={(e) => setActualExpense(e.target.value)}
            />
          </div>
          {advance && actualExpense && (
            <div className="text-sm rounded-md border bg-muted/30 px-3 py-2 space-y-1">
              <p>Advance Amount: ₹{(advance.releasedAmount || advance.requestedAmount).toLocaleString()}</p>
              <p>Entered Expense: ₹{Number(actualExpense).toLocaleString()}</p>
              <p>
                Balance Outcome:{' '}
                <strong>
                  {(advance.releasedAmount || advance.requestedAmount) - Number(actualExpense) >= 0
                    ? 'Refund to Company'
                    : 'Recover from Employee'}
                </strong>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit Settlement</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

