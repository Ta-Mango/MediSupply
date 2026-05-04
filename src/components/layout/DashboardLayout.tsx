import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  BarChart3, 
  Package2, 
  ShoppingCart, 
  Users, 
  LogOut, 
  Settings,
  Bell,
  Search
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  icon: any;
  label: string;
  href: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
}

export default function DashboardLayout({ children, navItems }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-neutral-200">
          <h1 className="text-xl font-bold tracking-tight">PharmaChain</h1>
          <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1 font-semibold">{profile?.role}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/10" 
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input 
                type="text" 
                placeholder="Search orders, medicines, clients..." 
                className="w-full bg-neutral-50 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-neutral-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-neutral-500 hover:bg-neutral-50 rounded-full relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-bold">
              {profile?.displayName?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
