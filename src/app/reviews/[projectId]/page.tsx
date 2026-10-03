import { notFound } from 'next/navigation';
import { insforge } from '@/lib/insforge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  ChevronLeft, 
  FileText, 
  CheckCircle2, 
  HelpCircle, 
  History as HistoryIcon,
  ShieldAlert
} from 'lucide-react';
import RequirementCard from './RequirementCard';
import Link from 'next/link';

export default async function ReviewDashboard({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { data: project, error } = await insforge.database
    .from('projects')
    .select(`
      *,
      documents (*),
      assessments (
        *,
        clarification_questions (*),
        unsupported_claims (*),
        mappings:evidence_mappings (
          *,
          requirement:requirements(*),
          evidence:evidences(*),
          reviewActions:review_actions(*)
        )
      )
    `)
    .eq('id', projectId)
    .single();

  if (!project || error) return notFound();

  // Get the most recent assessment
  const sortedAssessments = (project.assessments || []).sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const assessment = sortedAssessments[0];
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

  (assessment.mappings || []).forEach((mapping: any) => {
    // Human corrections take precedence
    const actions = mapping.reviewActions || [];
    const lastAction = actions.sort(
      (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
    const finalStatus = lastAction ? lastAction.new_status : mapping.status;

    if (mapping.requirement?.importance === 'mandatory' && finalStatus !== 'not_applicable') {
      totalMandatory++;
      if (finalStatus === 'complete') {
        completeMandatory++;
      }
    }
  });

  const completionPercentage = totalMandatory === 0 ? 100 : Math.round((completeMandatory / totalMandatory) * 100);

  // Collect history records across all requirement mappings
  const allHistory = (assessment.mappings || [])
    .flatMap((m: any) =>
      (m.reviewActions || []).map((action: any) => ({
        ...action,
        requirementText: m.requirement?.text || 'Requirement'
      }))
    )
    .sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());

  const documentsList = project.documents || [];
  const unsupportedList = assessment.unsupported_claims || [];
  const questionsList = assessment.clarification_questions || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="mb-4">
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold truncate max-w-[300px] sm:max-w-md">{project.name}</h1>
              <p className="text-sm text-slate-500">Assessment ID: {assessment.id.slice(-8)}</p>
            </div>
            <Badge variant={assessment.status === 'STALE' ? 'destructive' : 'secondary'} className="text-sm">
              {assessment.status === 'STALE' ? 'Assessment Stale' : 'Active'}
            </Badge>
          </div>
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

        {/* Completion Progress Card */}
        <Card className="shadow-sm border-slate-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2 text-slate-900">Completion</h2>
                <div className="flex items-center gap-4">
                  <Progress value={completionPercentage} className="h-4 flex-1 bg-transparent" />
                  <span className="font-bold text-2xl w-16 text-right text-slate-900">{completionPercentage}%</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  {completeMandatory} / {totalMandatory} mandatory requirements satisfied
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <Tabs defaultValue="requirements" className="w-full">
          <TabsList className="mb-6 w-full justify-start overflow-x-auto h-auto p-1 bg-slate-200/60 rounded-xl">
            <TabsTrigger value="requirements" className="py-2.5 px-4 text-sm font-medium">
              Requirements ({assessment.mappings?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="documents" className="py-2.5 px-4 text-sm font-medium">
              Supporting Documents ({documentsList.length})
            </TabsTrigger>
            <TabsTrigger value="unsupported" className="py-2.5 px-4 text-sm font-medium">
              Unsupported Claims ({unsupportedList.length})
            </TabsTrigger>
            <TabsTrigger value="questions" className="py-2.5 px-4 text-sm font-medium">
              Questions ({questionsList.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="py-2.5 px-4 text-sm font-medium">
              History ({allHistory.length})
            </TabsTrigger>
          </TabsList>

          {/* 1. Requirements Tab */}
          <TabsContent value="requirements" className="space-y-4 outline-none">
            {(assessment.mappings || []).map((mapping: any) => (
              <RequirementCard key={mapping.id} mapping={mapping} />
            ))}
            {!(assessment.mappings?.length) && (
              <div className="text-center py-12 text-slate-500 border border-slate-200 rounded-xl bg-white shadow-sm">
                No requirements mapped yet.
              </div>
            )}
          </TabsContent>

          {/* 2. Supporting Documents Tab */}
          <TabsContent value="documents" className="space-y-4 outline-none">
            {documentsList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border border-slate-200 rounded-xl bg-white shadow-sm">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-700">No documents found</p>
                <p className="text-xs text-slate-400 mt-1">Uploaded files for this review will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentsList.map((doc: any) => (
                  <Card key={doc.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="p-3 bg-red-50 text-red-500 rounded-xl flex-shrink-0">
                          <FileText className="w-6 h-6 stroke-[1.5]" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-800 text-sm truncate">{doc.filename}</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Uploaded {new Date(doc.created_at || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`ml-2 flex-shrink-0 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 ${
                          doc.type === 'GUIDELINE'
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : doc.type === 'DRAFT_APPLICATION'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-100 text-slate-700'
                        }`}
                      >
                        {doc.type === 'DRAFT_APPLICATION' ? 'Draft App' : doc.type}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 3. Unsupported Claims Tab */}
          <TabsContent value="unsupported" className="space-y-4 outline-none">
            {unsupportedList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border border-slate-200 rounded-xl bg-white shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <p className="font-semibold text-slate-800">No unsupported claims detected!</p>
                <p className="text-xs text-slate-400 mt-1">All statements in the application have verified evidence.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {unsupportedList.map((item: any, idx: number) => (
                  <Card key={item.id || idx} className="border-amber-200 bg-amber-50/20 shadow-sm">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <h4 className="font-semibold text-slate-900 text-sm">{item.claim}</h4>
                        </div>
                        <Badge variant="outline" className="border-amber-300 bg-amber-100 text-amber-900 text-xs font-medium flex-shrink-0">
                          Unverified Claim
                        </Badge>
                      </div>
                      {item.quote && (
                        <div className="p-3 bg-white border border-amber-200 rounded-lg text-xs font-mono text-slate-700">
                          <span className="font-sans font-semibold text-amber-800 mr-2">Application Quote:</span>
                          "{item.quote}"
                        </div>
                      )}
                      {item.explanation && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          <span className="font-semibold text-slate-800">Analysis:</span> {item.explanation}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 4. Clarification Questions Tab */}
          <TabsContent value="questions" className="space-y-4 outline-none">
            {questionsList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border border-slate-200 rounded-xl bg-white shadow-sm">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-800">No clarification questions generated.</p>
                <p className="text-xs text-slate-400 mt-1">AI found no missing requirements that need further clarification.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questionsList.map((q: any, idx: number) => (
                  <Card key={q.id || idx} className="border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          Q{idx + 1}
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <h4 className="font-semibold text-slate-900 text-sm leading-relaxed">
                            {typeof q === 'string' ? q : q.question}
                          </h4>
                          <p className="text-xs text-slate-400">
                            Generated by AI analysis from grant guidelines
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* 5. History Tab */}
          <TabsContent value="history" className="space-y-4 outline-none">
            {allHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border border-slate-200 rounded-xl bg-white shadow-sm">
                <HistoryIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-800">No history records yet.</p>
                <p className="text-xs text-slate-400 mt-1">Manual overrides and reviewer actions will be logged here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allHistory.map((item: any, idx: number) => (
                  <Card key={item.id || idx} className="border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-slate-500 font-medium truncate">Requirement: {item.requirementText}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="capitalize font-medium text-slate-600">{item.old_status || 'Initial'}</span>
                          <span className="text-slate-400">→</span>
                          <span className="capitalize font-bold text-blue-600">{item.new_status}</span>
                        </div>
                        {item.reason && <p className="text-xs text-slate-500 italic">"{item.reason}"</p>}
                      </div>
                      <div className="text-right text-xs text-slate-400 flex-shrink-0">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}
