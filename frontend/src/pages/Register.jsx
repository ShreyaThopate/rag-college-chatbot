import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register(name, email, password, role);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/chat');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="glass-panel p-8 rounded-2xl shadow-2xl border border-slate-800">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/25">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
            <p className="text-sm text-slate-400 mt-1">Join CollegeGPT to access verified campus insights</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>

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
                  placeholder="student@college.edu"
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
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    role === 'student'
                      ? 'bg-brand-600/20 border-brand-500 text-brand-300 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    role === 'admin'
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Administrator
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
