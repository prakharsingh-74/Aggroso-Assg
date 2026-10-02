'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileText, X, AlertCircle } from 'lucide-react';

export default function NewReviewPage() {
  const router = useRouter();
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

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const FileCard = ({ file, onRemove }: { file: File, onRemove: () => void }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-md">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-blue-500" />
        <div className="text-sm">
          <p className="font-medium text-slate-700 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
          <p className="text-slate-500 text-xs">{formatSize(file.size)} • PDF</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onRemove} className="text-slate-500 hover:text-red-500">
        <X className="w-4 h-4" />
      </Button>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideline || !application) {
      setError('Guideline and Draft Application are required.');
      return;
    }

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
      router.push(`/reviews/${data.projectId}/processing`);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Start a Review</h1>
          <p className="text-slate-600 mt-2">Upload your documents to begin the completeness assessment.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>Only PDF files are supported.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="flex items-center gap-2 p-4 text-red-700 bg-red-50 rounded-md text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Label className="text-base font-semibold">1. Grant Guideline (Required)</Label>
                <p className="text-sm text-slate-500">The official requirements from the funder.</p>
                {!guideline ? (
                  <Input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, setGuideline)} className="cursor-pointer" />
                ) : (
                  <FileCard file={guideline} onRemove={() => setGuideline(null)} />
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">2. Draft Application (Required)</Label>
                <p className="text-sm text-slate-500">The application document you want to review.</p>
                {!application ? (
                  <Input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, setApplication)} className="cursor-pointer" />
                ) : (
                  <FileCard file={application} onRemove={() => setApplication(null)} />
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-base font-semibold">3. Supporting Documents (Optional)</Label>
                <p className="text-sm text-slate-500">Upload multiple files like budgets, registration certificates, etc.</p>
                <Input type="file" accept="application/pdf" multiple onChange={handleMultipleFilesChange} className="cursor-pointer" />
                
                {supportingDocs.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {supportingDocs.map((file, i) => (
                      <FileCard key={i} file={file} onRemove={() => removeSupportingDoc(i)} />
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" size="lg" disabled={isSubmitting || !guideline || !application} className="w-full sm:w-auto">
                  {isSubmitting ? 'Uploading...' : 'Start Analysis'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
