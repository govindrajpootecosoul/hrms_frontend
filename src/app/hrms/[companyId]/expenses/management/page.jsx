'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckSquare, Info, X, AlertCircle, Search, Trash2, Plus } from 'lucide-react';
import { useCompany } from '@/lib/context/CompanyContext';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Textarea from '@/components/common/Textarea';

const ApprovalManagementPage = () => {
  const params = useParams();
  const companyId = params.companyId;
  const { currentCompany } = useCompany();
  
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals', 'claims', 'policies'
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Status');
  
  // Policies state
  const [categories, setCategories] = useState([
    { id: '1', name: 'Travel', limitPerDay: 3000, limitPerMonth: 20000, receiptRequired: true },
    { id: '2', name: 'Meals', limitPerDay: 1200, limitPerMonth: 8000, receiptRequired: true },
    { id: '3', name: 'Office Supplies', limitPerDay: 5000, limitPerMonth: 15000, receiptRequired: true },
    { id: '4', name: 'Client Entertainment', limitPerDay: 6000, limitPerMonth: 25000, receiptRequired: true },
  ]);
  const [newCategory, setNewCategory] = useState({
    name: '',
    limitPerDay: '',
    limitPerMonth: '',
    receiptRequired: true
  });
  const [travelPolicy, setTravelPolicy] = useState({
    mileageRate: '12',
    lodgingCap: '4500',
    mealCap: '1200',
    internationalAllowance: '80',
    notes: ''
  });

  // Mock approval data
  const approvalQueues = {
    manager: [
      {
        id: '1',
        claimant: 'Emily Chen',
        claimId: 'CLM011',
        amount: 980,
        date: '2025-01-18',
        status: 'Pending',
        alert: 'Over meal limit by ₹80'
      }
    ],
    hr: [
      {
        id: '2',
        claimant: 'Jane Smith',
        claimId: 'CLM009',
        amount: 4600,
        date: '2025-01-19',
        status: 'Pending',
        alert: null
      }
    ],
    finance: [
      {
        id: '3',
        claimant: 'John Doe',
        claimId: 'CLM010',
        amount: 1200,
        date: '2025-01-12',
        status: 'Pending',
        alert: null
      }
    ]
  };

  const handleApprove = (claimId, queue) => {
    alert(`Claim ${claimId} approved from ${queue} queue`);
  };

  const handleReject = (claimId, queue) => {
    alert(`Claim ${claimId} rejected from ${queue} queue`);
  };

  const handleInfo = (claim) => {
    alert(`Claim Details:\n\nClaimant: ${claim.claimant}\nClaim ID: ${claim.claimId}\nAmount: ₹${claim.amount}\nDate: ${claim.date}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">
            Approval Management
          </h1>
          <p className="text-sm text-slate-600">
            Approve claims, view settlements, and configure expense policies.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`
              px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg
              ${activeTab === 'approvals'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }
            `}
          >
            Approvals
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`
              px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg
              ${activeTab === 'claims'
                ? 'bg-green-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }
            `}
          >
            Claims
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`
              px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg
              ${activeTab === 'policies'
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }
            `}
          >
            Policies
          </button>
        </div>
      </div>

      {/* Approvals Tab Content */}
      {activeTab === 'approvals' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
              <h3 className="text-sm font-medium text-slate-600 mb-2">Pending Manager</h3>
              <div className="text-4xl font-bold text-slate-900">{approvalQueues.manager.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
              <h3 className="text-sm font-medium text-slate-600 mb-2">Pending HR</h3>
              <div className="text-4xl font-bold text-slate-900">{approvalQueues.hr.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 text-center">
              <h3 className="text-sm font-medium text-slate-600 mb-2">Pending Finance</h3>
              <div className="text-4xl font-bold text-slate-900">{approvalQueues.finance.length}</div>
            </div>
          </div>

          {/* Queue Detail Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Manager Queue */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Manager Queue</h3>
                <Badge size="sm" variant="warning">{approvalQueues.manager.length} Pending</Badge>
              </div>
              {approvalQueues.manager.map((claim) => (
                <div key={claim.id} className="space-y-4 border-b border-slate-200 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{claim.claimant}</p>
                      <p className="text-sm text-slate-600">Claim: {claim.claimId}</p>
                    </div>
                    <Badge size="sm" variant="warning">{claim.status}</Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">₹{claim.amount.toLocaleString()}</p>
                    <p className="text-sm text-slate-600 mt-1">Date: {claim.date}</p>
                  </div>
                  {claim.alert && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">{claim.alert}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(claim.claimId, 'Manager')}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                      icon={<CheckSquare className="w-4 h-4" />}
                      iconPosition="left"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(claim.claimId, 'Manager')}
                      className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                      icon={<X className="w-4 h-4" />}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleInfo(claim)}
                      className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                      icon={<Info className="w-4 h-4" />}
                    >
                      Info
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* HR Queue */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">HR Queue</h3>
                <Badge size="sm" variant="warning">{approvalQueues.hr.length} Pending</Badge>
              </div>
              {approvalQueues.hr.map((claim) => (
                <div key={claim.id} className="space-y-4 border-b border-slate-200 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{claim.claimant}</p>
                      <p className="text-sm text-slate-600">Claim: {claim.claimId}</p>
                    </div>
                    <Badge size="sm" variant="warning">{claim.status}</Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">₹{claim.amount.toLocaleString()}</p>
                    <p className="text-sm text-slate-600 mt-1">Date: {claim.date}</p>
                  </div>
                  {claim.alert && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">{claim.alert}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(claim.claimId, 'HR')}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                      icon={<CheckSquare className="w-4 h-4" />}
                      iconPosition="left"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(claim.claimId, 'HR')}
                      className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                      icon={<X className="w-4 h-4" />}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleInfo(claim)}
                      className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                      icon={<Info className="w-4 h-4" />}
                    >
                      Info
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Finance Queue */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Finance Queue</h3>
                <Badge size="sm" variant="warning">{approvalQueues.finance.length} Pending</Badge>
              </div>
              {approvalQueues.finance.map((claim) => (
                <div key={claim.id} className="space-y-4 border-b border-slate-200 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{claim.claimant}</p>
                      <p className="text-sm text-slate-600">Claim: {claim.claimId}</p>
                    </div>
                    <Badge size="sm" variant="warning">{claim.status}</Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">₹{claim.amount.toLocaleString()}</p>
                    <p className="text-sm text-slate-600 mt-1">Date: {claim.date}</p>
                  </div>
                  {claim.alert && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">{claim.alert}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(claim.claimId, 'Finance')}
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                      icon={<CheckSquare className="w-4 h-4" />}
                      iconPosition="left"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(claim.claimId, 'Finance')}
                      className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                      icon={<X className="w-4 h-4" />}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleInfo(claim)}
                      className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                      icon={<Info className="w-4 h-4" />}
                    >
                      Info
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Claims Tab Content */}
      {activeTab === 'claims' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search employee or claim ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                options={[
                  { value: 'All Types', label: 'All Types' },
                  { value: 'Advance Settlement', label: 'Advance Settlement' },
                  { value: 'Non-Advance', label: 'Non-Advance' }
                ]}
                value={typeFilter}
                onChange={setTypeFilter}
                placeholder="All Types"
              />
              <Select
                options={[
                  { value: 'All Status', label: 'All Status' },
                  { value: 'Pending HR Approval', label: 'Pending HR Approval' },
                  { value: 'Pending Finance Approval', label: 'Pending Finance Approval' },
                  { value: 'Pending Manager Approval', label: 'Pending Manager Approval' },
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Rejected', label: 'Rejected' }
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="All Status"
              />
            </div>
          </div>

          {/* Claims Table */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Claims</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Claim ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Total Expense</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Against Advance</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Pending Balance</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Submitted On</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-slate-900">Jane Smith</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">CLM009</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">Advance Settlement</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">Travel</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">₹4,600</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">ADV001</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">₹400</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge size="sm" className="bg-yellow-100 text-yellow-700">Pending HR Approval</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">2025-01-19</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-slate-900">John Doe</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">CLM010</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">Non-Advance</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">Internet</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">₹1,200</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-400">—</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-400">—</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge size="sm" className="bg-yellow-100 text-yellow-700">Pending Finance Approval</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700">2025-01-12</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Policies Tab Content */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Categories */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Expense Categories</h3>
              
              {/* Existing Categories */}
              <div className="space-y-3 mb-6">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 mb-1">{category.name}</div>
                      <div className="text-sm text-slate-600 space-y-1">
                        <div>Per Day: ₹{category.limitPerDay.toLocaleString()}</div>
                        <div>Monthly: ₹{category.limitPerMonth.toLocaleString()}</div>
                        <div>Requires receipt: {category.receiptRequired ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setCategories(categories.filter(c => c.id !== category.id))}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Category Form */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-4">Add Category</h4>
                <div className="space-y-4">
                  <Input
                    placeholder="Category name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="Limit per day"
                      value={newCategory.limitPerDay}
                      onChange={(e) => setNewCategory({ ...newCategory, limitPerDay: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Limit per month"
                      value={newCategory.limitPerMonth}
                      onChange={(e) => setNewCategory({ ...newCategory, limitPerMonth: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="receiptRequired"
                      checked={newCategory.receiptRequired}
                      onChange={(e) => setNewCategory({ ...newCategory, receiptRequired: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="receiptRequired" className="text-sm text-slate-700">
                      Receipt required
                    </label>
                  </div>
                  <Button
                    onClick={() => {
                      if (newCategory.name) {
                        setCategories([...categories, {
                          id: String(Date.now()),
                          ...newCategory,
                          limitPerDay: parseInt(newCategory.limitPerDay) || 0,
                          limitPerMonth: parseInt(newCategory.limitPerMonth) || 0
                        }]);
                        setNewCategory({ name: '', limitPerDay: '', limitPerMonth: '', receiptRequired: true });
                      }
                    }}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    icon={<Plus className="w-4 h-4" />}
                    iconPosition="left"
                  >
                    Add Category
                  </Button>
                </div>
              </div>
            </div>

            {/* Travel Policy */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Travel Policy</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mileage Rate (₹/KM)</label>
                  <Input
                    type="number"
                    value={travelPolicy.mileageRate}
                    onChange={(e) => setTravelPolicy({ ...travelPolicy, mileageRate: e.target.value })}
                    placeholder="12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lodging Cap (₹)</label>
                  <Input
                    type="number"
                    value={travelPolicy.lodgingCap}
                    onChange={(e) => setTravelPolicy({ ...travelPolicy, lodgingCap: e.target.value })}
                    placeholder="4500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Meal Cap (₹)</label>
                  <Input
                    type="number"
                    value={travelPolicy.mealCap}
                    onChange={(e) => setTravelPolicy({ ...travelPolicy, mealCap: e.target.value })}
                    placeholder="1200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">International Allowance ($)</label>
                  <Input
                    type="number"
                    value={travelPolicy.internationalAllowance}
                    onChange={(e) => setTravelPolicy({ ...travelPolicy, internationalAllowance: e.target.value })}
                    placeholder="80"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Notes or exceptions</label>
                  <Textarea
                    value={travelPolicy.notes}
                    onChange={(e) => setTravelPolicy({ ...travelPolicy, notes: e.target.value })}
                    rows={4}
                    placeholder="Enter any notes or exceptions..."
                    className="border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Auto-Flagging Rules */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Auto-Flagging Rules</h3>
            <div className="space-y-4">
              <div className="flex items-start justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <div className="font-medium text-slate-900 mb-1">Exceeds Category Limit</div>
                  <div className="text-sm text-slate-600">
                    <div className="mb-1"><span className="font-medium">Condition:</span> Amount &gt; category.limitPerDay</div>
                    <div><span className="font-medium">Action:</span> Flag for HR review</div>
                  </div>
                </div>
              </div>
              <div className="flex items-start justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <div className="font-medium text-slate-900 mb-1">Receipt Missing</div>
                  <div className="text-sm text-slate-600">
                    <div className="mb-1"><span className="font-medium">Condition:</span> Receipt not uploaded</div>
                    <div><span className="font-medium">Action:</span> Flag for employee follow-up</div>
                  </div>
                </div>
              </div>
              <div className="flex items-start justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <div className="font-medium text-slate-900 mb-1">Duplicate Expense</div>
                  <div className="text-sm text-slate-600">
                    <div className="mb-1"><span className="font-medium">Condition:</span> Same amount + date + category</div>
                    <div><span className="font-medium">Action:</span> Flag for finance audit</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalManagementPage;
