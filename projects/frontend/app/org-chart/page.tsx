'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Building2, Users, Briefcase } from 'lucide-react';
import { mockData } from '@/lib/api';
import TreeChart from './components/TreeChart';

// Transform department data into tree structure matching the image
const buildTreeStructure = (departments: any[]) => {
  // CEO node
  const ceo = {
    id: 'ceo',
    name: 'Rajesh Kumar',
    role: 'CEO',
    level: 0,
    children: [] as any[],
  };

  // Take first 2 departments to create 2 managers (matching image)
  const selectedDepts = departments.slice(0, 2);
  
  selectedDepts.forEach((dept, managerIdx) => {
    // Create Manager node (CXO level)
    const managerNode = {
      id: `manager-${dept.id}`,
      name: dept.cxo?.name || `Manager ${managerIdx + 1}`,
      role: 'MANAGER',
      level: 1,
      children: [] as any[],
    };

    // Create Foremen/Sales Officers (Directors level) - 2 per manager
    const directors = dept.directors || [];
    const seniorManagers = dept.seniorManagers || [];
    const allForemen = [...directors, ...seniorManagers].slice(0, 2);
    
    allForemen.forEach((foreman, foremanIdx) => {
      const foremanNode = {
        id: `foreman-${dept.id}-${foremanIdx}`,
        name: foreman.name,
        role: foreman.title.includes('Director') ? 'DIRECTOR' : 'SENIOR MANAGER',
        level: 2,
        children: [] as any[],
      };

      // Add Workers/Salers (Managers level) - distribute managers under each foreman
      const managers = dept.managers || [];
      const managersPerForeman = Math.ceil(managers.length / allForemen.length);
      const startIdx = foremanIdx * managersPerForeman;
      const endIdx = Math.min(startIdx + managersPerForeman, managers.length);
      
      foremanNode.children = managers
        .slice(startIdx, endIdx)
        .map((m: any, idx: number) => ({
          id: `worker-${dept.id}-${foremanIdx}-${idx}`,
          name: m.name,
          role: 'MANAGER',
          level: 3,
        }));

      managerNode.children.push(foremanNode);
    });

    ceo.children.push(managerNode);
  });

  return ceo;
};

export default function OrgChartPage() {
  const [orgData, setOrgData] = useState<any>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOrgChart();
  }, []);

  const fetchOrgChart = async () => {
    try {
      // Try API first, fallback to mock data
      const api = (await import('@/lib/api')).default;
      try {
        const response = await api.get('/org-chart');
        setOrgData(response.data);
      } catch (error: any) {
        // If backend is not available, use mock data
        if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
          console.warn('Backend not available, using mock data for org chart');
          setOrgData(mockData.orgChart);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.warn('Using mock data for org chart');
      setOrgData(mockData.orgChart);
    }
  };

  const treeData = useMemo(() => {
    if (!orgData?.departments) return null;
    return buildTreeStructure(orgData.departments);
  }, [orgData]);

  const toggleDept = (deptId: string) => {
    setExpandedDepts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(deptId)) {
        newSet.delete(deptId);
        if (selectedDept === deptId) {
          setSelectedDept(null);
        }
      } else {
        newSet.add(deptId);
        setSelectedDept(deptId);
      }
      return newSet;
    });
  };

  const selectedDepartment = orgData?.departments?.find((d: any) => d.id === selectedDept);

  return (
    <div className="space-y-8 pb-8">
      {/* Modern Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 border border-primary/20">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Organisation Chart
              </h1>
              <p className="text-muted-foreground mt-1 text-lg">Company hierarchy and structure visualization</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Summary Cards - Modern Grid Layout */}
      {orgData?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 font-medium">Total Departments</p>
                  <p className="text-4xl font-bold mt-3">{orgData.summary.totalDepartments}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <Building2 className="h-8 w-8 opacity-90" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 font-medium">Total Employees</p>
                  <p className="text-4xl font-bold mt-3">{orgData.summary.totalEmployeesMapped}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <Users className="h-8 w-8 opacity-90" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 font-medium">CXO Leadership</p>
                  <p className="text-4xl font-bold mt-3">{orgData.summary.cxoCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <Briefcase className="h-8 w-8 opacity-90" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 font-medium">Directors</p>
                  <p className="text-4xl font-bold mt-3">{orgData.summary.directorCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <Users className="h-8 w-8 opacity-90" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          </Card>
        </div>
      )}

      {/* Tree Chart Visualization - Modern Card */}
      {treeData && (
        <Card className="border-2 border-primary/10 shadow-2xl overflow-hidden bg-gradient-to-br from-background to-muted/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/10 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70">
                  Organizational Hierarchy
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  Interactive visualization of company structure: CEO → Managers → Directors → Managers
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 bg-gradient-to-b from-background to-muted/10">
            <div className="relative min-h-[600px]">
              <TreeChart data={treeData} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Department Horizontal View - Modern Layout */}
      {orgData?.departments && (
        <Card className="border-2 border-primary/10 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-primary/10 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Department Hierarchy</CardTitle>
                <CardDescription className="text-base mt-1">
                  Click on a department to view its detailed vertical hierarchy
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Horizontal Department List - Modern Button Group */}
              <div className="flex flex-wrap gap-3 pb-6 border-b border-border/50">
                {orgData.departments.map((dept: any) => (
                  <Button
                    key={dept.id}
                    variant={selectedDept === dept.id ? 'default' : 'outline'}
                    onClick={() => toggleDept(dept.id)}
                    className={`flex items-center gap-2 transition-all duration-300 ${
                      selectedDept === dept.id
                        ? 'shadow-lg scale-105'
                        : 'hover:scale-105 hover:shadow-md'
                    }`}
                  >
                    {expandedDepts.has(dept.id) ? (
                      <ChevronDown className="h-4 w-4 transition-transform" />
                    ) : (
                      <ChevronRight className="h-4 w-4 transition-transform" />
                    )}
                    <span className="font-medium">{dept.name}</span>
                    <Badge 
                      variant={selectedDept === dept.id ? 'secondary' : 'outline'} 
                      className="ml-1 font-semibold"
                    >
                      {dept.headcount}
                    </Badge>
                  </Button>
                ))}
              </div>

              {/* Vertical Hierarchy for Selected Department - Modern Design */}
              {selectedDepartment && expandedDepts.has(selectedDept || '') && (
                <div className="mt-4 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="relative overflow-hidden p-6 bg-gradient-to-br from-primary/5 via-primary/3 to-background rounded-xl border-2 border-primary/20 shadow-lg">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-primary/10">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-1">{selectedDepartment.name}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{selectedDepartment.description}</p>
                        </div>
                      </div>
                    
                    {/* CXO Level */}
                    {selectedDepartment.cxo && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-primary mb-3 uppercase tracking-wide">
                          CXO Leadership
                        </h4>
                        <div className="pl-4 border-l-2 border-primary">
                          <div className="p-3 bg-primary/5 rounded-lg">
                            <p className="font-semibold">{selectedDepartment.cxo.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedDepartment.cxo.title}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Directors */}
                    {selectedDepartment.directors && selectedDepartment.directors.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">
                          Directors
                        </h4>
                        <div className="pl-4 border-l-2 border-blue-500 space-y-2">
                          {selectedDepartment.directors.map((director: any, idx: number) => (
                            <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                              <p className="font-semibold">{director.name}</p>
                              <p className="text-sm text-muted-foreground">{director.title}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Senior Managers */}
                    {selectedDepartment.seniorManagers && selectedDepartment.seniorManagers.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-green-600 mb-3 uppercase tracking-wide">
                          Senior Managers
                        </h4>
                        <div className="pl-4 border-l-2 border-green-500 space-y-2">
                          {selectedDepartment.seniorManagers.map((manager: any, idx: number) => (
                            <div key={idx} className="p-3 bg-green-50 rounded-lg">
                              <p className="font-semibold">{manager.name}</p>
                              <p className="text-sm text-muted-foreground">{manager.title}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Managers */}
                    {selectedDepartment.managers && selectedDepartment.managers.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-orange-600 mb-3 uppercase tracking-wide">
                          Managers
                        </h4>
                        <div className="pl-4 border-l-2 border-orange-500 space-y-2">
                          {selectedDepartment.managers.map((manager: any, idx: number) => (
                            <div key={idx} className="p-3 bg-orange-50 rounded-lg">
                              <p className="font-semibold">{manager.name}</p>
                              <p className="text-sm text-muted-foreground">{manager.title}</p>
                              {manager.teams && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {manager.teams} team(s)
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Leads */}
                    {selectedDepartment.leads && selectedDepartment.leads.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-purple-600 mb-3 uppercase tracking-wide">
                          Team Leads
                        </h4>
                        <div className="pl-4 border-l-2 border-purple-500 space-y-2">
                          {selectedDepartment.leads.map((lead: any, idx: number) => (
                            <div key={idx} className="p-3 bg-purple-50 rounded-lg">
                              <p className="font-semibold">{lead.name}</p>
                              <p className="text-sm text-muted-foreground">{lead.title}</p>
                              {lead.focus && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  Focus: {lead.focus}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

