import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ArrowRight, FileText } from 'lucide-react';
import { cookies } from 'next/headers';
import { createServerClient } from '@insforge/sdk/ssr';

import ProjectCard from './ProjectCard';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const insforge = createServerClient({ cookies: cookieStore });
  
  const { data: { user } } = await insforge.auth.getCurrentUser();
  
  // Fetch projects
  const { data: projects } = await insforge.database
    .from('projects')
    .select('*, assessments(*)')
    .order('created_at', { ascending: false });

  const projectList = projects || [];
  return (
    <div className="space-y-10">
      
      {/* Header Area */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Workspace</h1>
        <Link href="/reviews/new">
          <Button className="gap-2 px-6 h-10">
            <Plus className="h-4 w-4" />
            Upload PDF File
          </Button>
        </Link>
      </div>

      {/* Projects Section */}
      <div>
        {projectList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed rounded-xl border-slate-200 bg-white">
            <p className="text-slate-500 mb-6 text-sm">You don't have any projects yet.</p>
            <Link href="/reviews/new">
              <Button className="px-8">
                Upload PDF File
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {projectList.map((project: any) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}
