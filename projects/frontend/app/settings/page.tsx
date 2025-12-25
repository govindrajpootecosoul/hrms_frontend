'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scan, RefreshCcw, Bot, Sparkles, Globe, ShieldCheck, BadgeDollarSign, ToggleRight } from 'lucide-react';

const toolFeatures = [
  {
    title: 'OCR Receipt Scanning',
    description: 'Auto-read receipts, extract GST, and prefill claim forms.',
    icon: Scan,
    status: 'Beta',
    actions: ['Enable OCR', 'View Accuracy Logs'],
  },
  {
    title: 'Mileage Calculator',
    description: 'Google Maps powered per KM claims with fuel slab reference.',
    icon: RefreshCcw,
    status: 'Live',
    actions: ['Configure Rates', 'Sync Maps API'],
  },
  {
    title: 'Smart Compliance Bot',
    description: 'AI assistant that reviews receipts for anomalies.',
    icon: Bot,
    status: 'Preview',
    actions: ['Enable Bot', 'View Alerts'],
  },
  {
    title: 'Auto Expense Bundler',
    description: 'Groups related expenses and recommends claim templates.',
    icon: Sparkles,
    status: 'Planned',
    actions: ['Join Waitlist'],
  },
];

const settingsFeatures = [
  {
    title: 'Multi-Currency Support',
    description: 'Lock FX rate per claim and display reimbursements in INR/USD/EUR.',
    icon: Globe,
    toggles: ['Auto FX Refresh (Daily)', 'Allow Employee Override'],
  },
  {
    title: 'Policy Auto-Flagging',
    description: 'Define guardrails, escalation owners, and automated reminders.',
    icon: ShieldCheck,
    toggles: ['Flag High-Risk Vendors', 'Escalate after 48 hrs'],
  },
  {
    title: 'Budget Guardrails',
    description: 'Track cost centers vs monthly budgets with alerting.',
    icon: BadgeDollarSign,
    toggles: ['Notify Finance @ 80%', 'Freeze claims at 100%'],
  },
  {
    title: 'Auto-Approval Rules',
    description: 'Whitelist low-value claims and recurring internet stipends.',
    icon: ToggleRight,
    toggles: ['Auto-approve < ₹500', 'Auto-approve WFH internet'],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings & Tools</h1>
        <p className="text-muted-foreground">Configure automation, policies, and expense tools.</p>
      </div>

      <Tabs defaultValue="tools" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="config">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toolFeatures.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card key={tool.title}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{tool.title}</CardTitle>
                        <CardDescription>{tool.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{tool.status}</Badge>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {tool.actions?.map((action) => (
                      <Button key={action} variant="outline" size="sm">
                        {action}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="config" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settingsFeatures.map((setting) => {
              const Icon = setting.icon;
              return (
                <Card key={setting.title}>
                  <CardHeader className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{setting.title}</CardTitle>
                      <CardDescription>{setting.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {setting.toggles?.map((toggle) => (
                      <div
                        key={toggle}
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <span>{toggle}</span>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

