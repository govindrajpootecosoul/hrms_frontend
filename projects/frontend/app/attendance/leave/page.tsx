'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeaveOverview from '../components/LeaveOverview';
import LeaveManagement from '../components/LeaveManagement';

export default function LeaveManagementPage() {
  const searchParams = useSearchParams();
  const [defaultTab, setDefaultTab] = useState('overview');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'manage') {
      setDefaultTab('manage');
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <p className="text-muted-foreground">Manage employee leave requests and approvals</p>
      </div>
      
      <Tabs defaultValue={defaultTab} value={defaultTab} onValueChange={setDefaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:via-indigo-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="manage"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:via-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
          >
            Leave Manage
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <LeaveOverview />
        </TabsContent>
        
        <TabsContent value="manage" className="mt-6">
          <LeaveManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

