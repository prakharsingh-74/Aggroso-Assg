'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, XCircle, FileText, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RequirementCard({ mapping }: { mapping: any }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const lastAction = mapping.reviewActions?.sort((a: any, b: any) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];

  const currentStatus = lastAction?.new_status || mapping.status;
  const isCorrected = !!lastAction;

  const handleAction = async (newStatus: string, reason: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/reviews/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mappingId: mapping.id,
          oldStatus: currentStatus,
          newStatus,
          reason,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to record action');
      }

      router.refresh();
    } catch (err) {
      console.error('Failed to update review status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'complete':
        return { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2, text: 'Complete' };
      case 'weak':
        return { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: AlertCircle, text: 'Needs Review' };
      case 'missing':
        return { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, text: 'Missing' };
      case 'not_applicable':
        return { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: CheckCircle2, text: 'Not Applicable' };
      default:
        return { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: CheckCircle2, text: status };
    }
  };

  const { color, icon: StatusIcon, text } = getStatusConfig(currentStatus);

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-slate-200 bg-white">
      <div className={`h-1.5 w-full ${color.split(' ')[0]}`} />
      <CardContent className="p-0">
        
        <div
          className="p-5 cursor-pointer flex items-start justify-between gap-4"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold border-slate-300">
                {mapping.requirement?.importance || 'mandatory'}
              </Badge>
              {isCorrected && (
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  Human Reviewed
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-base text-slate-900 leading-snug">
              {mapping.requirement?.text || 'Requirement text'}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={`${color} px-2.5 py-1 text-xs shadow-none flex items-center gap-1.5 font-medium`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {text}
            </Badge>
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="px-5 pb-5 border-t border-slate-100 pt-5 bg-slate-50/50">
            <div className="space-y-4">
              
              {/* AI Explanation */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">AI Analysis & Explanation</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                  {mapping.explanation || 'No explanation provided.'}
                </p>
              </div>

              {mapping.missing_evidence && (
                <div>
                  <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1.5">Missing Info / Evidence Gap</h4>
                  <p className="text-sm text-red-700 leading-relaxed bg-red-50/70 p-3.5 rounded-lg border border-red-200">
                    {mapping.missing_evidence}
                  </p>
                </div>
              )}

              {/* Evidence Quotes */}
              {mapping.evidence && mapping.evidence.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Source Evidence</h4>
                  <div className="space-y-3">
                    {mapping.evidence.map((ev: any, idx: number) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs relative group">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-xs font-medium text-slate-700">Document ID: {ev.document_id?.slice(-8) || 'Source'}</span>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">Page {ev.page_number}</span>
                        </div>
                        <blockquote className="text-sm text-slate-700 border-l-2 border-blue-400 pl-3 italic leading-relaxed">
                          "{ev.quote}"
                        </blockquote>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Human Review Override Actions */}
              <div className="pt-4 mt-6 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Reviewer Status Actions</p>
                <div className="flex flex-wrap gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => handleAction('complete', 'Verified complete by reviewer')}
                    className="bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-xs font-medium border-slate-200"
                  >
                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                    Mark Complete
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => handleAction('weak', 'Marked for follow-up review')}
                    className="bg-white hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 text-xs font-medium border-slate-200"
                  >
                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                    Needs Review
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUpdating}
                    onClick={() => handleAction('missing', 'Marked as missing by reviewer')}
                    className="bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-xs font-medium border-slate-200"
                  >
                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                    Mark Missing
                  </Button>
                </div>
              </div>

            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
