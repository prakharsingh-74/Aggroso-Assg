'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Trash2, Pencil, Loader2, AlertTriangle } from 'lucide-react';
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

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState(project.name);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleRenameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNewName(project.name);
    setRenameError(null);
    setShowRenameModal(true);
  };

  const handleConfirmRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setRenameError('Document name cannot be empty.');
      return;
    }

    setIsRenaming(true);
    setRenameError(null);

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!res.ok) {
        throw new Error('Failed to update document name.');
      }

      setShowRenameModal(false);
      router.refresh();
    } catch (err: any) {
      console.error('Failed to rename project:', err);
      setRenameError(err.message || 'Could not rename document. Please try again.');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteError(null);
    setShowDeleteModal(true);
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

      setShowDeleteModal(false);
      router.refresh();
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      setDeleteError(err.message || 'Could not delete the file. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="relative group">
        <Link href={`/reviews/${project.id}`} className="block">
          <Card className="relative hover:shadow-md transition-all border-slate-200 flex flex-col items-center justify-center p-6 h-48 bg-white cursor-pointer group-hover:border-slate-300">
            
            <div className="absolute top-3 right-3 flex items-center gap-1 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={handleRenameClick}
                title="Rename Document"
                className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all focus:outline-none"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleDeleteClick}
                title="Delete Document"
                className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all focus:outline-none"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <FileText className="w-12 h-12 text-red-500 mb-4 stroke-[1.5]" />
            <h3 className="font-semibold text-slate-800 text-center text-sm px-2 line-clamp-2 w-full">
              {project.name}
            </h3>
          </Card>
        </Link>
      </div>

      {showRenameModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isRenaming) setShowRenameModal(false);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-150 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">Rename Document</h3>
                <p className="text-xs text-slate-500">Enter a new name for this file</p>
              </div>
            </div>

            <form onSubmit={handleConfirmRename} className="space-y-4">
              <Input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Document name"
                disabled={isRenaming}
                autoFocus
                className="w-full text-sm"
              />

              {renameError && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                  {renameError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowRenameModal(false)}
                  disabled={isRenaming}
                  className="h-10 px-4 border-slate-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isRenaming || !newName.trim()}
                  className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {isRenaming ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Save Name'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isDeleting) setShowDeleteModal(false);
          }}
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
                onClick={() => setShowDeleteModal(false)}
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
