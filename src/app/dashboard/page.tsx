import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, ArrowRight, FileText } from 'lucide-react';
import { cookies } from 'next/headers';
import { createServerClient } from '@insforge/sdk/ssr';

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-medium text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-500 text-sm">Your one-stop overview for all your Projects.</p>
        </div>
        <Link href="/reviews/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-8">
            <div className="text-5xl font-normal text-slate-800 mb-2">{projectList.length}</div>
            <div className="text-xl text-slate-500 font-medium">Projects</div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-slate-200">
          <CardContent className="p-8">
            <div className="text-5xl font-normal text-slate-800 mb-2">{projectList.reduce((acc: number, p: any) => acc + (p.assessments?.length || 0), 0)}</div>
            <div className="text-xl text-slate-500 font-medium">Applications</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Section */}
      <div className="pt-4">
        <h2 className="text-2xl font-medium text-slate-900 mb-8">Projects</h2>
        
        {projectList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed rounded-xl border-slate-200">
            <p className="text-slate-500 mb-6 text-sm">You don't have any projects yet.</p>
            <Link href="/reviews/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                Create Your First Project
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {projectList.map((project: any) => (
              <Link href={`/reviews/${project.id}`} key={project.id} className="block group">
                <Card className="hover:border-blue-300 hover:shadow-sm transition-all border-slate-200">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                        <p className="text-sm text-slate-500">
                          {new Date(project.created_at).toLocaleDateString()} • {project.assessments?.length || 0} Assessments
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors transform group-hover:translate-x-1" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}
