import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@insforge/sdk/ssr';
import { redirect } from 'next/navigation';
import { signOut } from '@/app/login/actions';
import { 
  LayoutDashboard, 
  LogOut, 
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const insforge = createServerClient({ cookies: cookieStore });
  
  const { data: { user } } = await insforge.auth.getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const initial = user.email ? user.email[0].toUpperCase() : 'U';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
            Logoipsum
          </div>
        </div>

        <div className="px-4 py-2">
          <Link href="/reviews/new" className="block w-full">
            <Button className="w-full justify-center gap-2 h-12">
              <Plus className="h-4 w-4" />
              Upload PDF File
            </Button>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-md text-slate-900 bg-slate-200">
            <LayoutDashboard className="h-5 w-5" />
            Workspace
          </Link>
        </nav>

        <div className="p-4 space-y-2">
          <form action={signOut}>
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </form>
          
          <div className="mt-4 flex items-center px-3 gap-3">
            <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center text-white font-medium">
              {initial}
            </div>
            <div className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
              {user.email}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Removed to match design */}


        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="max-w-6xl mx-auto p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
