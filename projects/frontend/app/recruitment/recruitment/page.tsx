'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CandidateProvider } from '../context/CandidateContext';
import SourcingScreening from '../components/SourcingScreening';
import RecruitmentHiring from '../components/RecruitmentHiring';
import Onboarding from '../components/Onboarding';

export default function RecruitmentPage() {
  return (
    <CandidateProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Recruitment</h1>
          <p className="text-muted-foreground">Manage hiring pipeline and candidate lifecycle</p>
        </div>
        <Tabs defaultValue="sourcing" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger 
              value="sourcing"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:via-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
            >
              Sourcing & Screening
            </TabsTrigger>
            <TabsTrigger 
              value="hiring"
              className="data-[state=active]:bg-[#073349] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
            >
              Recruitment & Hiring
            </TabsTrigger>
            <TabsTrigger 
              value="onboarding"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:via-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:font-semibold transition-all"
            >
              Onboarding
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sourcing" className="mt-6">
            <SourcingScreening />
          </TabsContent>
          
          <TabsContent value="hiring" className="mt-6">
            <RecruitmentHiring />
          </TabsContent>
          
          <TabsContent value="onboarding" className="mt-6">
            <Onboarding />
          </TabsContent>
        </Tabs>
      </div>
    </CandidateProvider>
  );
}

