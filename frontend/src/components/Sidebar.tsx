'use client';
/* Frontend module: handles UI rendering, client-side state, and calls to the TimeBank API. */
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { LayoutDashboard, Briefcase, MessageSquare, Clock, Star, UserCircle, Settings, Users, AlertTriangle, BarChart3, ShieldCheck, ChevronLeft, ChevronRight, LogOut, LifeBuoy } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';

// Navigation item definition used by both member and admin sidebars.
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
  group: 'main' | 'account';
}

// Member navigation set for standard users.
const memberNav: NavItem[] = [
  { id: 'nav-home', label: 'Home', href: '/', icon: LayoutDashboard, group: 'main' },
  { id: 'nav-services', label: 'Service Listings', href: '/service-listings', icon: Briefcase, group: 'main' },
  { id: 'nav-community', label: 'Community', href: '/community', icon: Users, group: 'main' },
  { id: 'nav-support', label: 'Support Hub', href: '/support', icon: LifeBuoy, group: 'main' },
  { id: 'nav-messages', label: 'Messages', href: '/messages', icon: MessageSquare, group: 'main' },
  { id: 'nav-credits', label: 'My Credits', href: '/credits', icon: Clock, group: 'main' },
  { id: 'nav-reviews', label: 'Reviews', href: '/reviews', icon: Star, group: 'main' },
  { id: 'nav-profile', label: 'My Profile', href: '/profile', icon: UserCircle, group: 'account' },
  { id: 'nav-settings', label: 'Settings', href: '/settings', icon: Settings, group: 'account' },
];

// Admin navigation set for platform operators.
const adminNav: NavItem[] = [
  { id: 'nav-admin-dash', label: 'Admin Dashboard', href: '/admin-dashboard', icon: LayoutDashboard, group: 'main' },
  { id: 'nav-admin-members', label: 'Members', href: '/admin-members', icon: Users, group: 'main' },
  { id: 'nav-admin-community', label: 'Community', href: '/community', icon: Users, group: 'main' },
  { id: 'nav-admin-support', label: 'Support Hub', href: '/support', icon: LifeBuoy, group: 'main' },
  { id: 'nav-admin-services', label: 'Service Listings', href: '/service-listings', icon: Briefcase, group: 'main' },
  { id: 'nav-admin-disputes', label: 'Disputes', href: '/admin-disputes', icon: AlertTriangle, group: 'main' },
  { id: 'nav-admin-analytics', label: 'Analytics', href: '/admin-analytics', icon: BarChart3, group: 'main' },
  { id: 'nav-admin-settings', label: 'Platform Settings', href: '/admin-settings', icon: Settings, group: 'account' },
];

interface SidebarProps {
  variant?: 'member' | 'admin';
}

export default function Sidebar({ variant = 'member' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile } = useCurrentUserProfile();
  const navItems = variant === 'admin' ? adminNav : memberNav;

  const mainItems = navItems.filter((i) => i.group === 'main');
  const accountItems = navItems.filter((i) => i.group === 'account');

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const handleLogout = () => {
    logout();
    router.push('/sign-up-login-screen');
  };

  return (
    <aside className="hidden lg:flex flex-col bg-sidebar-bg border-r border-stone-800 transition-all duration-300 ease-in-out flex-shrink-0" style={{ width: collapsed ? '64px' : '240px' }}>
      <div className="flex items-center h-16 px-3 border-b border-stone-800 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <AppLogo size={32} className="flex-shrink-0" />
          {!collapsed && <span className="font-bold text-sidebar-fg text-base tracking-tight truncate">TimeBank</span>}
        </div>
      </div>

      {!collapsed && variant === 'admin' && (
        <div className="mx-3 mt-3 px-2 py-1 rounded-md bg-amber-900/30 border border-amber-700/30">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-primary flex-shrink-0" />
            <span className="text-xs font-medium text-primary">Admin View</span>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {!collapsed && <p className="text-xs font-500 text-sidebar-muted uppercase tracking-widest px-2 pb-1.5">{variant === 'admin' ? 'Management' : 'Navigation'}</p>}
        {mainItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.id} href={item.href} title={collapsed ? item.label : undefined} className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative ${active ? 'bg-sidebar-activeBg text-sidebar-activeFg' : 'text-sidebar-fg hover:bg-sidebar-hoverBg hover:text-white'}`}>
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        {!collapsed && accountItems.length > 0 && (
          <p className="text-xs font-500 text-sidebar-muted uppercase tracking-widest px-2 pt-4 pb-1.5">Account</p>
        )}
        {accountItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.id} href={item.href} title={collapsed ? item.label : undefined} className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative ${active ? 'bg-sidebar-activeBg text-sidebar-activeFg' : 'text-sidebar-fg hover:bg-sidebar-hoverBg hover:text-white'}`}>
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-stone-800 flex-shrink-0 space-y-2">
        {!collapsed && (
          <div className="px-2 py-2 rounded-lg bg-stone-900/50 border border-stone-800">
            <p className="text-xs text-sidebar-muted">Signed in as</p>
            <p className="text-sm font-semibold text-sidebar-fg truncate">{profile?.displayName ?? user?.displayName ?? 'New user'}</p>
            <p className="text-xs text-sidebar-muted truncate">{profile?.email ?? user?.email ?? 'Create an account'}</p>
          </div>
        )}
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium text-sidebar-fg hover:bg-sidebar-hoverBg hover:text-white transition-colors">
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <button onClick={() => setCollapsed(!collapsed)} className="absolute bottom-4 -right-3 w-6 h-6 rounded-full bg-card border border-border shadow-card hidden lg:flex items-center justify-center text-muted-foreground hover:text-foreground">
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
