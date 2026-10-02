import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      
      {/* Header Area */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-medium text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-500 text-sm">Your one-stop overview for all your Research Projects.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="h-4 w-4" />
          New Research Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-8">
            <div className="text-5xl font-normal text-slate-800 mb-2">0</div>
            <div className="text-xl text-slate-500 font-medium">Research projects</div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-slate-200">
          <CardContent className="p-8">
            <div className="text-5xl font-normal text-slate-800 mb-2">0</div>
            <div className="text-xl text-slate-500 font-medium">Applications</div>
          </CardContent>
        </Card>
      </div>

      {/* Research Projects Section */}
      <div className="pt-4">
        <h2 className="text-2xl font-medium text-slate-900 mb-8">Research Projects</h2>
        
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-slate-500 mb-6 text-sm">You don't have any projects yet.</p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
            Create Your First Project
          </Button>
        </div>
      </div>
      
    </div>
  );
}
