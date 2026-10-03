'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, XCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';

export default function RequirementCard({ mapping }: { mapping: any }) {
  const [expanded, setExpanded] = useState(false);
  
  const lastAction = mapping.reviewActions?.sort((a: any, b: any) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];
  
  const currentStatus = lastAction?.new_status || mapping.status;
  const isCorrected = !!lastAction;

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'complete': return { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, text: 'Complete' };
      case 'weak': return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle, text: 'Needs Review' };
      case 'missing': return { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, text: 'Missing' };
      case 'not_applicable': return { color: 'bg-slate-100 text-slate-800 border-slate-200', icon: CheckCircle2, text: 'Not Applicable' };
      default: return { color: 'bg-slate-100 text-slate-800 border-slate-200', icon: CheckCircle2, text: status };
    }
  };

  const { color, icon: StatusIcon, text } = getStatusConfig(currentStatus);

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className={`h-1.5 w-full ${color.split(' ')[0]}`} />
      <CardContent className="p-0">
        
        {/* Header */}
        <div 
          className="p-5 cursor-pointer flex items-start justify-between gap-4"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold">
                {mapping.requirement.importance}
              </Badge>
              {isCorrected && (
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-blue-50 text-blue-700">
                  Human Reviewed
                </Badge>
              )}
            </div>
            <h3 className="font-medium text-base text-slate-900 leading-snug">
              {mapping.requirement.text}
            </h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={`${color} px-2.5 py-1 text-xs shadow-none flex items-center gap-1.5`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {text}
            </Badge>
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="px-5 pb-5 border-t border-slate-100 pt-5 bg-slate-50/50">
            
            {/* AI Explanation */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">AI Explanation</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-md border border-slate-200">
                  {mapping.explanation}
                </p>
              </div>
              
              {mapping.missing_evidence && (
                <div>
                  <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1.5">Missing Info</h4>
                  <p className="text-sm text-red-700 leading-relaxed bg-red-50 p-3 rounded-md border border-red-100">
                    {mapping.missing_evidence}
                  </p>
                </div>
              )}

              {/* Evidence Quotes */}
              {mapping.evidence?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Evidence Found</h4>
                  <div className="space-y-3">
                    {mapping.evidence.map((ev: any, idx: number) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-md p-3 relative group">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-xs font-medium text-slate-700">Document ID: {ev.document_id?.slice(-8)}</span>
                          <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Page {ev.page_number}</span>
                        </div>
                        <blockquote className="text-sm text-slate-600 border-l-2 border-blue-200 pl-3 italic">
                          "{ev.quote}"
                        </blockquote>
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] uppercase">
                            View Source
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Human Review Actions */}
              <div className="pt-4 mt-6 border-t border-slate-200 flex flex-wrap gap-3">
                <Button variant="outline" size="sm" className="bg-white hover:bg-green-50 hover:text-green-700 hover:border-green-200">
                  Confirm AI
                </Button>
                <Button variant="outline" size="sm" className="bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200">
                  Correct Mapping
                </Button>
                <Button variant="outline" size="sm" className="bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200">
                  Reject & Add Note
                </Button>
              </div>

            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
