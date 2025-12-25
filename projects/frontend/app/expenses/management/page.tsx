'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockData } from '@/lib/api';
import { Search, Plus, Trash2, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ClaimDetailDialog from '../components/ClaimDetailDialog';

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Approved: 'bg-green-100 text-green-800 border-green-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
};

export default function ManagementPage() {
  // Approvals state
  const [approvals, setApprovals] = useState(mockData.expensesModule.approvals);

  // Claims state
  const [claims, setClaims] = useState<any[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [claimStatus, setClaimStatus] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Policies state
  const [policies, setPolicies] = useState(mockData.expensesModule.policies);
  const [newCategory, setNewCategory] = useState({
    name: '',
    limitPerDay: '',
    limitPerMonth: '',
    requiresReceipt: true,
  });

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const api = (await import('@/lib/api')).default;
        const response = await api.get('/expenses/approvals');
        setApprovals(response.data);
      } catch (error) {
        console.warn('Using mock approvals data');
      }
    };

    const fetchClaims = async () => {
      try {
        const api = (await import('@/lib/api')).default;
        const response = await api.get('/expenses/claims');
        setClaims(response.data);
      } catch (error) {
        setClaims(mockData.expensesModule.claims);
      } finally {
        setClaimsLoading(false);
      }
    };

    const fetchPolicies = async () => {
      try {
        const api = (await import('@/lib/api')).default;
        const response = await api.get('/expenses/policies');
        setPolicies(response.data);
      } catch (error) {
        console.warn('Using mock policy data');
      }
    };

    fetchApprovals();
    fetchClaims();
    fetchPolicies();
  }, []);

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesSearch =
        claim.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        claim.id.toLowerCase().includes(search.toLowerCase());
      const matchesType = type === 'all' || claim.type === type;
      const matchesStatus = claimStatus === 'all' || claim.status === claimStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [claims, search, type, claimStatus]);

  const handleAddCategory = () => {
    if (!newCategory.name) return;
    setPolicies((prev: any) => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          id: `CAT${Date.now().toString().slice(-3)}`,
          name: newCategory.name,
          limitPerDay: Number(newCategory.limitPerDay || 0),
          limitPerMonth: Number(newCategory.limitPerMonth || 0),
          requiresReceipt: newCategory.requiresReceipt,
          paymentModes: prev.paymentModes,
        },
      ],
    }));
    setNewCategory({ name: '', limitPerDay: '', limitPerMonth: '', requiresReceipt: true });
  };

  const handleDeleteCategory = (id: string) => {
    setPolicies((prev: any) => ({
      ...prev,
      categories: prev.categories.filter((cat: any) => cat.id !== id),
    }));
  };

  const handleApprovalAction = (stage: 'manager' | 'hr' | 'finance', id: string, action: string) => {
    setApprovals((prev) => ({
      ...prev,
      [stage]: prev[stage].map((item: any) =>
        item.id === id ? { ...item, status: action } : item,
      ),
    }));
  };

  const approvalSummary = [
    { title: 'Pending Manager', count: approvals.manager.filter((i: any) => i.status === 'Pending').length },
    { title: 'Pending HR', count: approvals.hr.filter((i: any) => i.status === 'Pending').length },
    { title: 'Pending Finance', count: approvals.finance.filter((i: any) => i.status === 'Pending').length },
  ];

  const levelCards = [
    { title: 'Manager Queue', items: approvals.manager, stage: 'manager' as const },
    { title: 'HR Queue', items: approvals.hr, stage: 'hr' as const },
    { title: 'Finance Queue', items: approvals.finance, stage: 'finance' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Management</h1>
          <p className="text-muted-foreground">
            Approve claims, view settlements, and configure expense policies.
          </p>
        </div>
      </div>

      <Tabs defaultValue="approvals" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger 
            value="approvals"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Approvals
          </TabsTrigger>
          <TabsTrigger 
            value="claims"
            className="data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Claims
          </TabsTrigger>
          <TabsTrigger 
            value="policies"
            className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            Policies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {approvalSummary.map((item) => (
              <Card key={item.title}>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                  <h3 className="text-3xl font-bold mt-2">{item.count}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {levelCards.map((level) => (
              <Card key={level.title}>
                <CardHeader>
                  <CardTitle>{level.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {level.items.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No items in queue</p>
                  ) : (
                    level.items.map((item: any) => (
                      <div key={item.id} className="rounded-md border p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{item.employeeName}</p>
                            <p className="text-xs text-muted-foreground">Claim: {item.claimId}</p>
                          </div>
                          <Badge className={statusColors[item.status]}>
                            {item.status}
                          </Badge>
                        </div>
                        <div className="text-sm flex items-center justify-between">
                          <p>₹{item.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{item.submittedOn}</p>
                        </div>
                        {item.policyFlags && item.policyFlags.length > 0 && (
                          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {item.policyFlags[0]}
                          </div>
                        )}
                        {item.status === 'Pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleApprovalAction(level.stage, item.id, 'Approved')}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleApprovalAction(level.stage, item.id, 'Rejected')}
                            >
                              Reject
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => alert('Requesting more info (simulated)')}
                            >
                              <Info className="h-4 w-4 mr-1" />
                              Info
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="claims" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employee or claim ID"
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Non-Advance">Non-Advance</SelectItem>
                  <SelectItem value="Advance Settlement">Advance Settlement</SelectItem>
                </SelectContent>
              </Select>
              <Select value={claimStatus} onValueChange={setClaimStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending HR Approval">Pending HR Approval</SelectItem>
                  <SelectItem value="Pending Finance Approval">Pending Finance Approval</SelectItem>
                  <SelectItem value="Pending Manager Approval">Pending Manager Approval</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Claims</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {claimsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Loading claims...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Claim ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Total Expense</TableHead>
                        <TableHead>Against Advance</TableHead>
                        <TableHead>Pending Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted On</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClaims.map((claim) => (
                        <TableRow key={claim.id}>
                          <TableCell>{claim.employeeName}</TableCell>
                          <TableCell>{claim.id}</TableCell>
                          <TableCell>{claim.type}</TableCell>
                          <TableCell>{claim.category}</TableCell>
                          <TableCell>₹{claim.totalExpense?.toLocaleString()}</TableCell>
                          <TableCell>{claim.againstAdvance || '—'}</TableCell>
                          <TableCell>
                            {claim.pendingAmount
                              ? `₹${claim.pendingAmount.toLocaleString()}`
                              : '—'}
                          </TableCell>
                          <TableCell>{claim.status}</TableCell>
                          <TableCell>{claim.submittedOn}</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedClaim(claim);
                                setIsDetailOpen(true);
                              }}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {policies.categories.map((category: any) => (
                  <div key={category.id} className="rounded-md border p-3 flex items-start gap-4">
                    <div className="flex-1">
                      <p className="font-semibold">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Per Day: ₹{category.limitPerDay} • Monthly: ₹{category.limitPerMonth}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requires receipt: {category.requiresReceipt ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}

                <div className="rounded-md border p-3 space-y-3">
                  <p className="font-semibold text-sm">Add Category</p>
                  <Input
                    placeholder="Category name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Limit per day"
                      type="number"
                      value={newCategory.limitPerDay}
                      onChange={(e) => setNewCategory({ ...newCategory, limitPerDay: e.target.value })}
                    />
                    <Input
                      placeholder="Limit per month"
                      type="number"
                      value={newCategory.limitPerMonth}
                      onChange={(e) => setNewCategory({ ...newCategory, limitPerMonth: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      id="receipt-required"
                      type="checkbox"
                      checked={newCategory.requiresReceipt}
                      onChange={(e) => setNewCategory({ ...newCategory, requiresReceipt: e.target.checked })}
                    />
                    <Label htmlFor="receipt-required">Receipt required</Label>
                  </div>
                  <Button size="sm" onClick={handleAddCategory}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Travel Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Mileage Rate (₹/KM)</Label>
                    <Input
                      type="number"
                      value={policies.travelPolicy.mileageRate}
                      onChange={(e) =>
                        setPolicies({
                          ...policies,
                          travelPolicy: { ...policies.travelPolicy, mileageRate: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Lodging Cap (₹)</Label>
                    <Input
                      type="number"
                      value={policies.travelPolicy.lodgingCap}
                      onChange={(e) =>
                        setPolicies({
                          ...policies,
                          travelPolicy: { ...policies.travelPolicy, lodgingCap: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Meal Cap (₹)</Label>
                    <Input
                      type="number"
                      value={policies.travelPolicy.mealCap}
                      onChange={(e) =>
                        setPolicies({
                          ...policies,
                          travelPolicy: { ...policies.travelPolicy, mealCap: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>International Allowance ($)</Label>
                    <Input
                      type="number"
                      value={policies.travelPolicy.internationalAllowance}
                      onChange={(e) =>
                        setPolicies({
                          ...policies,
                          travelPolicy: {
                            ...policies.travelPolicy,
                            internationalAllowance: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                </div>
                <Textarea placeholder="Notes or exceptions" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Auto-Flagging Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {policies.autoFlagRules.map((rule: any) => (
                <div key={rule.id} className="rounded-md border p-3">
                  <p className="font-semibold text-sm">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">Condition: {rule.condition}</p>
                  <p className="text-xs text-muted-foreground">Action: {rule.action}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ClaimDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        claim={selectedClaim}
      />
    </div>
  );
}

