'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { FileText, Trash2, Loader2 } from 'lucide-react';
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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Are you sure you want to delete "${project.name}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete project');
      }

      router.refresh();
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Could not delete the file. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative group">
      <Link href={`/reviews/${project.id}`} className="block">
        <Card className="relative hover:shadow-md transition-all border-slate-200 flex flex-col items-center justify-center p-6 h-48 bg-white cursor-pointer group-hover:border-slate-300">
          
          {/* Delete Icon Button */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete File"
            className="absolute top-3 right-3 p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-80 group-hover:opacity-100 z-10 focus:outline-none"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-600" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>

          <FileText className="w-12 h-12 text-red-500 mb-4 stroke-[1.5]" />
          <h3 className="font-semibold text-slate-800 text-center text-sm px-2 line-clamp-2 w-full">
            {project.name}
          </h3>
        </Card>
      </Link>
    </div>
  );
}
