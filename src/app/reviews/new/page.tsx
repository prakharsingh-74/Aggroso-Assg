'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileText, Trash2, AlertCircle } from 'lucide-react';

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const FileItem = ({ file, onRemove }: { file: File; onRemove: () => void }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-md shadow-sm hover:border-slate-300 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div className="text-sm min-w-0">
          <p className="font-medium text-slate-700 truncate max-w-[200px]">{file.name}</p>
          <p className="text-slate-500 text-xs">{formatSize(file.size)} • PDF</p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-md transition-colors flex-shrink-0"
        title="Delete File"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

const PreviewFrame = ({ file, onDelete }: { file: File; onDelete?: () => void }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
        </div>
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
            title="Delete File"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      <div className="flex-1 bg-slate-50/50 p-2">
        {previewUrl && (
          <iframe
            src={`${previewUrl}#toolbar=0&navpanes=0`}
            className="w-full h-full border border-slate-200 rounded-lg shadow-sm bg-white"
            title={file.name}
          />
        )}
      </div>
    </div>
  );
};

export default function NewReviewPage() {
  const router = useRouter();
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [guideline, setGuideline] = useState<File | null>(null);
  const [application, setApplication] = useState<File | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: File | null) => void) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf' && file.size > 0) {
      setter(file);
      setError(null);
    } else {
      setter(null);
      if (file && file.type !== 'application/pdf') setError('Only PDF files are supported.');
      if (file && file.size === 0) setError('The file is empty.');
    }
  };

  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.type === 'application/pdf' && f.size > 0);
    if (validFiles.length !== files.length) {
      setError('Some files were rejected. Only non-empty PDFs are allowed.');
    } else {
      setError(null);
    }
    setSupportingDocs(prev => [...prev, ...validFiles]);
  };

  const removeSupportingDoc = (index: number) => {
    setSupportingDocs(prev => prev.filter((_, i) => i !== index));
  };

  const removeFile = (fileToRemove: File) => {
    if (guideline === fileToRemove) {
      setGuideline(null);
      if (step === 'preview') setStep('upload');
    } else if (application === fileToRemove) {
      setApplication(null);
      if (step === 'preview') setStep('upload');
    } else {
      setSupportingDocs(prev => prev.filter(f => f !== fileToRemove));
    }
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideline || !application) {
      setError('Guideline and Draft Application are required.');
      return;
    }
    setStep('preview');
  };

  const handleSubmit = async () => {
    if (!guideline || !application) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('guideline', guideline);
      formData.append('application', application);
      supportingDocs.forEach(doc => formData.append('supporting', doc));

      const res = await fetch('/api/projects', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to start review.');
      }

      const data = await res.json();
      router.push(`/reviews/${data.projectId}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setIsSubmitting(false);
      setStep('upload'); // go back on error
    }
  };

  const allFiles = [guideline, application, ...supportingDocs].filter(Boolean) as File[];

  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-slate-900/40 flex items-center justify-center p-4 backdrop-blur-sm">
        <Card className="w-full max-w-lg shadow-2xl border-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Upload Documents</CardTitle>
            <CardDescription>Select your PDF files to begin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePreview} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 text-red-700 bg-red-50 rounded-md text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-sm font-semibold">1. Grant Guideline (Required)</Label>
                {!guideline ? (
                  <Input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, setGuideline)} className="cursor-pointer" />
                ) : (
                  <FileItem file={guideline} onRemove={() => setGuideline(null)} />
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">2. Draft Application (Required)</Label>
                {!application ? (
                  <Input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, setApplication)} className="cursor-pointer" />
                ) : (
                  <FileItem file={application} onRemove={() => setApplication(null)} />
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">3. Supporting Documents (Optional)</Label>
                <Input type="file" accept="application/pdf" multiple onChange={handleMultipleFilesChange} className="cursor-pointer" />

                {supportingDocs.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {supportingDocs.map((file, i) => (
                      <FileItem key={i} file={file} onRemove={() => removeSupportingDoc(i)} />
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button type="submit" size="lg" disabled={!guideline || !application} className="w-full h-12">
                  Preview Documents
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col p-4 lg:p-8">
      <div className="max-w-[1600px] mx-auto w-full h-full flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Document Preview</h1>
            <p className="text-slate-500 mt-1 text-sm">Review your selected PDFs before starting the analysis.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={() => setStep('upload')} className="flex-1 sm:flex-none h-11 px-6">
              Back to Upload
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !guideline || !application} className="flex-1 sm:flex-none h-11 px-8">
              {isSubmitting ? 'Analyzing...' : 'Start AI Analysis'}
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-0 flex flex-col overflow-hidden">
          <div className={`w-full h-full grid gap-6 ${
            allFiles.length === 1 ? 'grid-cols-1 grid-rows-1' :
            allFiles.length === 2 ? 'grid-cols-2 grid-rows-1' :
            allFiles.length === 3 ? 'grid-cols-3 grid-rows-1' :
            allFiles.length === 4 ? 'grid-cols-2 grid-rows-2' :
            'grid-cols-3 grid-rows-2'
          }`}>
            {allFiles.map((f, i) => (
              <div key={i} className="w-full h-full min-h-0">
                <PreviewFrame file={f} onDelete={() => removeFile(f)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
