import Link from 'next/link';
import { 
  LayoutDashboard, 
  Files, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Plus, 
  ChevronRight,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-800">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
              G
            </div>
            GrantFlow
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Button>
        </div>

        <div className="px-4 py-2">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start gap-2">
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="#" className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <Files className="h-4 w-4" />
              Recent Applications
            </div>
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link href="#" className="flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50">
            <div className="flex items-center gap-3">
              <Settings className="h-4 w-4" />
              Settings
            </div>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-2">
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50">
            <Plus className="h-4 w-4" />
            Organisation name
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50">
            <HelpCircle className="h-4 w-4" />
            Support
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-slate-600 hover:bg-slate-50">
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
          
          <div className="mt-4 flex items-center px-3 gap-3">
            <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center text-white font-medium">
              N
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-end px-6">
          <Button variant="ghost" size="icon" className="text-slate-500">
            <Bell className="h-5 w-5" />
          </Button>
        </header>

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
