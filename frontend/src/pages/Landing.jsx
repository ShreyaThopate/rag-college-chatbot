import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  BookOpen,
  Database,
  FileCheck2,
  Cpu,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const Landing = () => {
  const { isAuthenticated } = useAuth();

  const ragSteps = [
    {
      title: '1. Ingest Documents',
      desc: 'Admin uploads official college circulars, fee charts, and admission rules (PDF/DOCX).',
      icon: BookOpen,
    },
    {
      title: '2. Chunk & Embed',
      desc: 'Text is parsed page-by-page, chunked, and vectorized using Sentence Transformers.',
      icon: Layers,
    },
    {
      title: '3. Semantic Search',
      desc: 'Student questions trigger cosine similarity retrieval to fetch the top-5 verified chunks.',
      icon: Search,
    },
    {
      title: '4. Grounded AI Answer',
      desc: 'LLM generates precise responses citing exact document titles and page numbers.',
      icon: Cpu,
    },
  ];

  const features = [
    {
      title: 'Admissions & Eligibility',
      desc: 'Instant answers on B.Tech, MCA, MBA eligibility, required certificates, and deadlines.',
    },
    {
      title: 'Fee Structure & Schedules',
      desc: 'Detailed tuition breakdowns, hostel mess charges, payment deadlines, and refund rules.',
    },
    {
      title: 'Examinations & Grading',
      desc: 'Exam form submission dates, 75% attendance policy, CGPA grading scales, and re-evaluation.',
    },
    {
      title: 'Campus Life & Hostels',
      desc: 'Hostel amenities, 24/7 library timings, curfew regulations, mess menus, and health services.',
    },
    {
      title: 'Scholarships & Aid',
      desc: 'Merit-cum-Means waivers, Women in STEM fellowships, and sports excellence criteria.',
    },
    {
      title: 'Strict Grounding & Zero Hallucination',
      desc: 'If college documents do not contain the answer, CollegeGPT explicitly tells the student.',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs sm:text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Sinhgad Academy of Engineering, Pune — Verified RAG Knowledge Base</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
            Instant, Grounded Answers for Your{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Campus Journey
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            CollegeGPT delivers precise, verified campus answers for <strong>Sinhgad Academy of Engineering (SAOE), Kondhwa, Pune</strong> (DTE Code: 6187, SPPU Affiliated). Every response is strictly grounded in official documents with exact citations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/chat' : '/login'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-base shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-[1.02]"
            >
              <span>{isAuthenticated ? 'Open Student Chat' : 'Start Asking Questions'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-base flex items-center justify-center space-x-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* RAG Architecture Visualizer */}
      <section className="py-16 border-y border-slate-800/60 bg-slate-900/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              How the CollegeGPT RAG Pipeline Works
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
              Unlike generic chatbots that guess, CollegeGPT enforces a strict four-stage retrieval and verification pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ragSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-brand-500/40 transition-all duration-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Comprehensive Campus Knowledge Areas
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Everything students and parents need to know, available 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-2 text-brand-400 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <h3 className="text-sm font-semibold text-slate-100">{feat.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-500">
        <p>© 2026 CollegeGPT — AI-Powered Retrieval Augmented Campus Assistant. All rights reserved.</p>
      </footer>
    </div>
  );
};
