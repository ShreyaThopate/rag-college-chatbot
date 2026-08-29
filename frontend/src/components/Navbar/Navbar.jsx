import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  MessageSquare,
  LayoutDashboard,
  FileText,
  User as UserIcon,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to={isAuthenticated ? '/chat' : '/'} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                CollegeGPT
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-500/20 text-brand-300 rounded border border-brand-500/30">
                SAOE Pune
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight">Sinhgad Academy of Engineering</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-1 sm:space-x-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/chat"
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/chat')
                    ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Student Chat</span>
              </Link>

              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin')
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>

                  <Link
                    to="/admin/documents"
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/admin/documents')
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Documents</span>
                  </Link>
                </>
              )}

              {/* User Menu / Profile */}
              <div className="flex items-center pl-2 border-l border-slate-800 space-x-2">
                <Link
                  to="/profile"
                  className={`flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors ${
                    isActive('/profile') ? 'ring-2 ring-brand-500/50' : ''
                  }`}
                  title="View Profile"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block text-left text-xs">
                    <p className="font-medium text-slate-200 leading-tight">{user?.name}</p>
                    <span
                      className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        isAdmin
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isAdmin ? 'Admin' : 'Student'}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center space-x-1.5 px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-lg shadow-md shadow-brand-600/20 transition-all duration-200"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
