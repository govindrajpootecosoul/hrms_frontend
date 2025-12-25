'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockData } from '@/lib/api';
import { Search, Trash2, Edit, Plus, RefreshCcw } from 'lucide-react';
import AddExpenseDialog from '../components/AddExpenseDialog';
import AddAdvanceDialog from '../components/AddAdvanceDialog';
import SettleAdvanceDialog from '../components/SettleAdvanceDialog';

const statusColors: Record<string, string> = {
  Requested: 'bg-amber-100 text-amber-800 border-amber-200',
  Approved: 'bg-blue-100 text-blue-800 border-blue-200',
  Released: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Settled: 'bg-green-100 text-green-800 border-green-200',
  Closed: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function ExpensesAdvancesPage() {
  // Expenses state
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  // Advances state
  const [advances, setAdvances] = useState<any[]>([]);
  const [advancesLoading, setAdvancesLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState<any | null>(null);
  const [isSettleOpen, setIsSettleOpen] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const api = (await import('@/lib/api')).default;
        const response = await api.get('/expenses');
        setExpenses(response.data);
      } catch (error) {
        console.warn('Using mock expenses data');
        setExpenses(mockData.expensesModule.expenses);
      } finally {
        setExpensesLoading(false);
      }
    };

    const fetchAdvances = async () => {
      try {
        const api = (await import('@/lib/api')).default;
        const response = await api.get('/expenses/advances');
        setAdvances(response.data);
      } catch (error) {
        console.warn('Using mock advances data');
        setAdvances(mockData.expensesModule.advances);
      } finally {
        setAdvancesLoading(false);
      }
    };

    fetchExpenses();
    fetchAdvances();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(expenses.map((exp) => exp.category));
    return Array.from(cats);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch =
        exp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = category === 'all' || exp.category === category;
      const matchesStatus = status === 'all' || exp.status === status;

      const matchesDate =
        (!startDate || new Date(exp.date) >= new Date(startDate)) &&
        (!endDate || new Date(exp.date) <= new Date(endDate));

      return matchesSearch && matchesCategory && matchesStatus && matchesDate;
    });
  }, [expenses, searchTerm, category, status, startDate, endDate]);

  const handleAddExpense = (expense: any) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Delete this expense?')) {
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    }
  };

  const handleAddAdvance = (advance: any) => {
    setAdvances((prev) => [advance, ...prev]);
  };

  const handleSettle = (payload: any) => {
    setAdvances((prev) =>
      prev.map((adv) =>
        adv.id === payload.advanceId
          ? {
              ...adv,
              status: 'Settled',
              settlement: {
                actualExpense: payload.actualExpense,
                balance: payload.balance,
                balanceType: payload.balanceType,
              },
            }
          : adv,
      ),
    );
  };

  const getStatusVariant = (value: string) => {
    switch (value) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Paid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expenses & Advances</h1>
          <p className="text-muted-foreground">
            Manage employee expenses and advance requests.
          </p>
        </div>
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="advances">Advances</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-6 mt-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsExpenseDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search employee, description..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Expense List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {expensesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Loading expenses...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Receipt</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>
                            <div className="font-medium">{expense.employeeName}</div>
                            <p className="text-xs text-muted-foreground">{expense.projectCode || '—'}</p>
                          </TableCell>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>{expense.date}</TableCell>
                          <TableCell>₹{expense.amount.toLocaleString()}</TableCell>
                          <TableCell>{expense.paymentMode}</TableCell>
                          <TableCell>
                            {expense.receiptUrl ? (
                              <Button variant="outline" size="sm">View</Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Not uploaded</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusVariant(expense.status)}>
                              {expense.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="space-x-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(expense.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
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

        <TabsContent value="advances" className="space-y-6 mt-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Advance
            </Button>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Advance Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {advancesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Loading advances...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b">
                        <th className="py-2 px-4">Employee</th>
                        <th>Amount</th>
                        <th>Purpose</th>
                        <th>Requested On</th>
                        <th>Status</th>
                        <th>Settlement</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {advances.map((advance) => (
                        <tr key={advance.id} className="border-b last:border-0">
                          <td className="py-3 px-4">
                            <p className="font-semibold">{advance.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{advance.employeeId}</p>
                          </td>
                          <td>₹{advance.requestedAmount.toLocaleString()}</td>
                          <td>{advance.purpose}</td>
                          <td>{advance.requestedOn}</td>
                          <td>
                            <Badge className={statusColors[advance.status] || ''}>{advance.status}</Badge>
                          </td>
                          <td>
                            {advance.settlement ? (
                              <div className="text-xs">
                                <p>Actual: ₹{advance.settlement.actualExpense.toLocaleString()}</p>
                                <p>
                                  Balance: ₹{advance.settlement.balance} ({advance.settlement.balanceType})
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Pending</span>
                            )}
                          </td>
                          <td>
                            {advance.status === 'Released' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAdvance(advance);
                                  setIsSettleOpen(true);
                                }}
                              >
                                Settle
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddExpenseDialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen} onSave={handleAddExpense} />
      <AddAdvanceDialog open={isAddOpen} onOpenChange={setIsAddOpen} onSave={handleAddAdvance} />
      <SettleAdvanceDialog open={isSettleOpen} onOpenChange={setIsSettleOpen} advance={selectedAdvance} onSettle={handleSettle} />
    </div>
  );
}

