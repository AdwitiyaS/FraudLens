import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertCircle,
  List,
  FileSearch,
  ShieldCheck,
  Activity,
  BarChart2,
  Menu,
  X,
  ExternalLink,
  UploadCloud,
  LogOut,
} from 'lucide-react';
import BrandMark from './BrandMark';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/alerts',      icon: AlertCircle,     label: 'Live Alerts' },
  { to: '/transactions',icon: List,            label: 'Transactions' },
  { to: '/check',       icon: FileSearch,      label: 'Manual Check' },
  { to: '/cases',       icon: ShieldCheck,     label: 'Case Review' },
  { to: '/analytics',   icon: Activity,        label: 'Analytics' },
  { to: '/model-stats', icon: BarChart2,       label: 'Model Stats' },
  { to: '/upload',      icon: UploadCloud,     label: 'Upload Data' },
];

const linkBase =
  'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium focus-visible:ring-2 focus-visible:ring-[var(--ng-accent)] outline-none text-[var(--ng-muted)]';
const linkActive =
  'text-[var(--ng-text)] bg-[var(--ng-border)] shadow-inner';
const linkInactive =
  'hover:text-[var(--ng-text)] hover:bg-[var(--ng-border)]';

const SidebarContent = ({ onNavigate }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      if (onNavigate) onNavigate();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="flex flex-col h-full" role="navigation" aria-label="Main Navigation">
      {/* Brand */}
      <BrandMark />

    {/* Divider */}
    <div className="mx-5 border-t border-white/[0.06] mb-4" aria-hidden="true" />

    {/* Navigation Links */}
    <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar" aria-label="Primary Nav">
      {NAV_LINKS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          aria-label={`Navigate to ${label}`}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>

    {/* Footer section */}
    <div className="px-3 pb-5 space-y-2">
      <div className="mx-2 border-t border-white/[0.06] mb-3" aria-hidden="true" />

      {/* Back to Classic Dashboard */}
      <a
        href="http://localhost:5000/dashboard"
        aria-label="Back to Classic Dashboard"
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[var(--ng-muted)] hover:text-[var(--ng-text)] hover:bg-[var(--ng-border)] transition-colors text-xs font-medium focus-visible:ring-2 focus-visible:ring-slate-500 outline-none"
      >
        <ExternalLink size={14} aria-hidden="true" />
        <span>Classic Dashboard</span>
      </a>

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Sign Out */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-rose-400 hover:text-white hover:bg-rose-500/20 transition-all text-xs font-bold uppercase tracking-widest focus-visible:ring-2 focus-visible:ring-rose-500 outline-none"
      >
        <LogOut size={14} aria-hidden="true" />
        <span>Sign Out</span>
      </button>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 w-64 backdrop-blur-xl border-r border-[var(--ng-border)] hidden md:flex flex-col z-50 shadow-2xl" style={{ backgroundColor: 'var(--ng-bg)' }}>
        <SidebarContent />
      </aside>

      {/* ── Mobile Top Bar ──────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 h-14 backdrop-blur-xl border-b border-[var(--ng-border)] flex items-center justify-between px-4 md:hidden z-50" style={{ backgroundColor: 'var(--ng-bg)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-[var(--ng-accent)] to-blue-600 rounded-lg flex items-center justify-center">
            <ShieldCheck size={14} className="text-[var(--ng-text)]" aria-hidden="true" />
          </div>
          <span className="text-sm font-extrabold tracking-widest uppercase text-[var(--ng-text)]">
            NeuralGuard
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open Navigation Menu"
          aria-expanded={mobileOpen}
          className="text-[var(--ng-text)]/50 hover:text-[var(--ng-text)] transition-colors p-2 focus-visible:ring-2 focus-visible:ring-cyan-500 outline-none rounded-lg"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* ── Mobile Drawer Overlay ───────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside
            className="fixed inset-y-0 left-0 w-64 backdrop-blur-xl border-r border-[var(--ng-border)] flex flex-col z-50 md:hidden animate-in slide-in-from-left shadow-2xl"
            style={{ backgroundColor: 'var(--ng-bg)' }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            {/* Close button */}
            <div className="flex justify-end p-3">
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close Navigation Menu"
                className="text-[var(--ng-text)]/50 hover:text-[var(--ng-text)] transition-colors p-2 focus-visible:ring-2 focus-visible:ring-cyan-500 outline-none rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;
