'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ClaimDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: any | null;
}

export default function ClaimDetailDialog({ open, onOpenChange, claim }: ClaimDetailDialogProps) {
  if (!claim) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Claim #{claim.id}</DialogTitle>
          <DialogDescription>Detailed view of the claim, receipts, and approvals.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Employee</p>
              <p className="font-semibold">{claim.employeeName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="font-semibold">{claim.category}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Expense</p>
              <p className="font-semibold">₹{claim.totalExpense?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge>{claim.status}</Badge>
            </div>
          </div>

          {claim.lineItems && claim.lineItems.length > 0 && (
            <div>
              <p className="font-semibold mb-2">Line Items</p>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-2 px-3">Category</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claim.lineItems.map((item: any) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="px-3 py-2">{item.category}</td>
                        <td>₹{item.amount}</td>
                        <td>{item.date}</td>
                        <td>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {claim.approvalTimeline && (
            <div>
              <p className="font-semibold mb-2">Approval Timeline</p>
              <ul className="space-y-2 text-sm">
                {claim.approvalTimeline.map((entry: any, idx: number) => (
                  <li key={idx} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <div>
                      <p className="font-semibold">{entry.stage}</p>
                      <p className="text-xs text-muted-foreground">{entry.owner}</p>
                    </div>
                    <div className="text-right">
                      <Badge>{entry.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{entry.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {claim.comments && (
            <div>
              <p className="font-semibold mb-2">Comments</p>
              <div className="space-y-2 text-sm">
                {claim.comments.map((comment: any, idx: number) => (
                  <div key={idx} className="rounded-md border px-3 py-2">
                    <p className="font-semibold">{comment.from}</p>
                    <p>{comment.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{comment.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


