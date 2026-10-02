import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import RequirementCard from './RequirementCard';

export default async function ReviewDashboard({ params }: { params: { projectId: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
    include: {
      assessments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          mappings: {
            include: { requirement: true, evidence: true, reviewActions: true }
          }
        }
      }
    }
  });

  if (!project) return notFound();

  const assessment = project.assessments[0];
  if (!assessment) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold">Assessment Pending</h1>
        <p>This project does not have a completed assessment yet.</p>
      </div>
    );
  }

  // Deterministic calculation
  let totalMandatory = 0;
  let completeMandatory = 0;

  assessment.mappings.forEach(mapping => {
    // Human corrections take precedence
    const lastAction = mapping.reviewActions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    const finalStatus = lastAction ? lastAction.newStatus : mapping.status;
    
    if (mapping.requirement.importance === 'mandatory' && finalStatus !== 'not_applicable') {
      totalMandatory++;
      if (finalStatus === 'complete') {
        completeMandatory++;
      }
    }
  });

  const completionPercentage = totalMandatory === 0 ? 100 : Math.round((completeMandatory / totalMandatory) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-5xl">
          <div>
            <h1 className="text-xl font-bold truncate max-w-[300px] sm:max-w-md">{project.name}</h1>
            <p className="text-sm text-slate-500">Assessment ID: {assessment.id.slice(-8)}</p>
          </div>
          <Badge variant={assessment.status === 'STALE' ? 'destructive' : 'secondary'} className="text-sm">
            {assessment.status === 'STALE' ? 'Assessment Stale' : 'Active'}
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        
        {assessment.status === 'STALE' && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-semibold text-sm">Assessment is stale</p>
                <p className="text-xs">Source documents have changed since this assessment was created.</p>
              </div>
            </div>
            <button className="text-sm bg-red-100 px-4 py-2 rounded font-medium hover:bg-red-200 transition-colors">
              Run Assessment Again
            </button>
          </div>
        )}

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">Completion</h2>
                <div className="flex items-center gap-4">
                  <Progress value={completionPercentage} className="h-4 flex-1 bg-slate-100" />
                  <span className="font-bold text-2xl w-16 text-right">{completionPercentage}%</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  {completeMandatory} / {totalMandatory} mandatory requirements satisfied
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="requirements" className="w-full">
          <TabsList className="mb-6 w-full justify-start overflow-x-auto h-auto p-1">
            <TabsTrigger value="requirements" className="py-2.5 px-4 text-sm">Requirements</TabsTrigger>
            <TabsTrigger value="documents" className="py-2.5 px-4 text-sm">Supporting Documents</TabsTrigger>
            <TabsTrigger value="unsupported" className="py-2.5 px-4 text-sm">Unsupported Claims</TabsTrigger>
            <TabsTrigger value="questions" className="py-2.5 px-4 text-sm">Questions</TabsTrigger>
            <TabsTrigger value="history" className="py-2.5 px-4 text-sm">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="requirements" className="space-y-4 outline-none">
            {assessment.mappings.map(mapping => (
              <RequirementCard key={mapping.id} mapping={mapping} />
            ))}
            {assessment.mappings.length === 0 && (
              <div className="text-center py-12 text-slate-500 border rounded-lg bg-white shadow-sm">
                No requirements mapped yet.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="text-center py-12 text-slate-500 border rounded-lg bg-white shadow-sm">
              Documents tracker coming soon.
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
