import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  LayoutDashboard,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  MessageSquare,
  Upload,
  ArrowRight,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';

export const Admin = () => {
  const [stats, setStats] = useState(null);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      setStats(res.data.stats || {});
      setRecentQuestions(res.data.recentQuestions || []);
      setRecentDocs(res.data.recentDocuments || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Documents',
      value: stats?.totalDocuments ?? 0,
      icon: FileText,
      color: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    },
    {
      title: 'Ready Documents',
      value: stats?.readyDocuments ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Processing',
      value: stats?.processingDocuments ?? 0,
      icon: Clock,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Failed',
      value: stats?.failedDocuments ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      title: 'Total Questions',
      value: stats?.totalQuestions ?? 0,
      icon: MessageSquare,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Administrator Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Admin Portal
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Monitor college knowledge base status, vector indexes, and student inquiry traffic.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/documents"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/25 transition-all duration-200"
          >
            <Upload className="w-4 h-4" />
            <span>Manage & Upload Documents</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border mb-3 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-slate-400">{card.title}</p>
              <p className="text-2xl font-bold text-white mt-1">
                {loading ? <span className="text-slate-600">...</span> : card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* RAG Vector Index Overview Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">RAG Vector Knowledge Base Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              SentenceTransformer (all-MiniLM-L6-v2) embedding model is active with 384-dimensional dense vectors.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <span className="text-xs text-slate-400">Total Indexed Chunks</span>
            <p className="text-xl font-bold text-brand-300">{stats?.totalVectors ?? 0}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Retrieval Top-K</span>
            <p className="text-xl font-bold text-emerald-300">5 Chunks</p>
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Documents & Recent Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Knowledge Base Documents */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-brand-400" />
              <h2 className="text-sm font-semibold text-white">Recent Knowledge Documents</h2>
            </div>
            <Link
              to="/admin/documents"
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {loading ? (
              <p className="text-xs text-slate-500 py-4">Loading documents...</p>
            ) : recentDocs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No documents uploaded yet.</p>
            ) : (
              recentDocs.map((doc) => (
                <div key={doc._id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-medium text-slate-200 truncate">{doc.title}</p>
                    <p className="text-[10px] text-slate-500">
                      {doc.category} • {doc.chunkCount || 0} chunks
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      doc.processingStatus === 'READY'
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : doc.processingStatus === 'PROCESSING'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {doc.processingStatus}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Student Questions */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-white">Recent Student Inquiries</h2>
          </div>

          <div className="divide-y divide-slate-800/80">
            {loading ? (
              <p className="text-xs text-slate-500 py-4">Loading inquiries...</p>
            ) : recentQuestions.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No inquiries asked yet.</p>
            ) : (
              recentQuestions.map((q) => (
                <div key={q._id} className="py-3 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs text-slate-200 truncate">"{q.content}"</p>
                    <p className="text-[10px] text-slate-500">
                      Asked by <span className="text-slate-400">{q.user}</span> •{' '}
                      {new Date(q.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
