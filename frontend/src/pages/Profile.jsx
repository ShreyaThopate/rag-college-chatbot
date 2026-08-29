import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Mail, Shield, Calendar, Sparkles, MessageSquare, LayoutDashboard } from 'lucide-react';

export const Profile = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Account Profile</h1>
        <p className="text-sm text-slate-400 mt-1">Your registered CollegeGPT user details and session state.</p>
      </div>

      {/* User Info Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-500/25">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  isAdmin
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
              >
                {isAdmin ? 'Administrator' : 'Student'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Email Address</p>
              <p className="text-xs font-semibold text-slate-200">{user?.email}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Access Level</p>
              <p className="text-xs font-semibold text-slate-200">
                {isAdmin ? 'Full Knowledge Base & Admin Control' : 'Student Knowledge Retrieval Access'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="pt-4 flex flex-wrap gap-3">
          <Link
            to="/chat"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Student Chat</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin Dashboard</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
