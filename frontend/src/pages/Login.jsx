import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/chat';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin' && from === '/chat') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      const user = await login(demoEmail, demoPassword);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/chat');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-slate-800">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/25">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome to CollegeGPT</h1>
            <p className="text-sm text-slate-400 mt-1">Sign in to your campus intelligence portal</p>
          </div>

          {/* Quick Demo Login Presets */}
          <div className="mb-6 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student@college.edu', 'Student@123')}
                disabled={loading}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Demo Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@college.edu', 'Admin@123')}
                disabled={loading}
                className="flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Demo Admin</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Create student account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
