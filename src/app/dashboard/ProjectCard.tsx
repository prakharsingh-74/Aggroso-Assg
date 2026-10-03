'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    created_at?: string;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleTrashClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteError(null);
    setShowModal(true);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete file.');
      }

      setShowModal(false);
      router.refresh();
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      setDeleteError(err.message || 'Could not delete the file. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDeleting) {
      setShowModal(false);
    }
  };

  return (
    <>
      <div className="relative group">
        <Link href={`/reviews/${project.id}`} className="block">
          <Card className="relative hover:shadow-md transition-all border-slate-200 flex flex-col items-center justify-center p-6 h-48 bg-white cursor-pointer group-hover:border-slate-300">
            
            {/* Delete Icon Button */}
            <button
              type="button"
              onClick={handleTrashClick}
              title="Delete File"
              className="absolute top-3 right-3 p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-80 group-hover:opacity-100 z-10 focus:outline-none"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <FileText className="w-12 h-12 text-red-500 mb-4 stroke-[1.5]" />
            <h3 className="font-semibold text-slate-800 text-center text-sm px-2 line-clamp-2 w-full">
              {project.name}
            </h3>
          </Card>
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={handleCancel}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">Delete Document</h3>
                <p className="text-xs text-slate-500">Confirm file deletion</p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{project.name}"</span>? This action cannot be undone.
            </p>

            {deleteError && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isDeleting}
                className="h-10 px-4 border-slate-200"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="h-10 px-5 bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                {isDeleting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
