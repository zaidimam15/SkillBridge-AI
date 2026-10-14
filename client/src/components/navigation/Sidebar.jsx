import { NavLink, useNavigate } from 'react-router-dom';
import {
  Zap, LayoutDashboard, Upload, FileText, BarChart2, Map,
  Briefcase, Users, Bell, User, ChevronLeft, ChevronRight,
  LogOut, BookOpen, Code2, TrendingUp, Settings, Shield,
  Target, Activity, Layers, Server, Brain, GraduationCap,
  Building2, ClipboardList, Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate as useNav } from 'react-router-dom';

const studentLinks = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Upload Resume', icon: Upload, to: '/dashboard/upload' },
  { label: 'Resume History', icon: FileText, to: '/dashboard/resumes' },
  { label: 'Analysis History', icon: Activity, to: '/dashboard/history' },
  { label: 'Skill Gap', icon: Target, to: '/dashboard/skill-gap' },
  { label: 'Learning Roadmap', icon: Map, to: '/dashboard/roadmap' },
  { label: 'Capstone Projects', icon: Code2, to: '/dashboard/projects' },
  { label: 'Career Pathways', icon: TrendingUp, to: '/dashboard/careers' },
  { label: 'Notifications', icon: Bell, to: '/dashboard/notifications' },
  { label: 'Profile', icon: User, to: '/dashboard/profile' },
];

const recruiterLinks = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/recruiter' },
  { label: 'Create Job', icon: Briefcase, to: '/recruiter/create-job' },
  { label: 'My Jobs', icon: ClipboardList, to: '/recruiter/jobs' },
  { label: 'Notifications', icon: Bell, to: '/recruiter/notifications' },
];

const tpLinks = [
  { label: 'T&P Dashboard', icon: LayoutDashboard, to: '/tp' },
  { label: 'Student Readiness', icon: GraduationCap, to: '/tp/students' },
  { label: 'Skill Gap Analytics', icon: BarChart2, to: '/tp/skill-gaps' },
  { label: 'Training Priorities', icon: BookOpen, to: '/tp/training' },
  { label: 'Notifications', icon: Bell, to: '/tp/notifications' },
];

const adminLinks = [
  { label: 'Admin Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'User Management', icon: Users, to: '/admin/users' },
  { label: 'Skill Management', icon: Database, to: '/admin/skills' },
  { label: 'T&P View', icon: Building2, to: '/tp' },
  { label: 'Notifications', icon: Bell, to: '/admin/notifications' },
];

const getLinksByRole = (role) => {
  if (role === 'recruiter') return recruiterLinks;
  if (role === 'tp_admin') return tpLinks;
  if (role === 'super_admin') return [...adminLinks, ...tpLinks.slice(1)];
  return studentLinks;
};

const roleColors = {
  student: 'from-primary-500 to-indigo-600',
  recruiter: 'from-emerald-500 to-teal-600',
  tp_admin: 'from-amber-500 to-orange-600',
  super_admin: 'from-red-500 to-rose-600',
};

const roleLabels = {
  student: 'Student',
  recruiter: 'Recruiter',
  tp_admin: 'T&P Admin',
  super_admin: 'Super Admin',
};

export default function Sidebar({ role, isOpen, onClose, collapsed, onToggleCollapse }) {
  const { user, logout } = useAuth();
  const navigate = useNav();
  const links = getLinksByRole(role);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={`
      fixed top-0 left-0 h-full z-40 transition-all duration-300
      bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/50
      flex flex-col shadow-sm
      ${collapsed ? 'w-20' : 'w-64'}
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-700/50 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${roleColors[role] || 'from-primary-500 to-indigo-600'} flex items-center justify-center`}>
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">
                Skill<span className="gradient-text">Bridge</span>
              </span>
            </div>
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:flex hidden"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColors[role] || 'from-primary-500 to-indigo-600'} flex items-center justify-center text-white font-bold text-sm`}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{roleLabels[user?.role]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to.split('/').length === 2}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link group ${isActive ? 'sidebar-link-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? link.label : undefined}
          >
            {({ isActive }) => (
              <>
                <link.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                {!collapsed && <span>{link.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700/50">
        <button
          onClick={handleLogout}
          className={`sidebar-link w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
