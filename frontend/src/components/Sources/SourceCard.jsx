import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Bookmark, Percent } from 'lucide-react';

export const SourceCard = ({ source, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const confidenceScore = source.score ? Math.round(source.score * 100) : null;

  return (
    <div className="border border-slate-800 bg-slate-900/90 rounded-xl overflow-hidden shadow-sm hover:border-brand-500/40 transition-all duration-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0 text-brand-400">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5">
              <span>{source.documentName || 'Document'}</span>
              {source.page && (
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded font-normal">
                  Page {source.page}
                </span>
              )}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {source.category && (
                <span className="text-[10px] text-slate-400 font-medium">
                  {source.category}
                </span>
              )}
              {source.collegeId && (
                <span className="text-[9px] px-1.5 py-0.2 bg-brand-500/10 text-brand-300 rounded border border-brand-500/20 font-medium">
                  SAOE Pune
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {confidenceScore !== null && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                confidenceScore >= 60
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
              }`}
            >
              {confidenceScore}% match
            </span>
          )}
          <div className="text-slate-400 hover:text-slate-200 p-1">
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-3.5 pb-3 pt-1 border-t border-slate-800/80 bg-slate-950/60 text-xs text-slate-300 animate-fadeIn">
          <div className="flex items-center space-x-1 text-[11px] text-brand-400 mb-1.5 font-medium">
            <Bookmark className="w-3 h-3" />
            <span>Retrieved Excerpt Context</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/60 font-mono text-[11px] whitespace-pre-wrap">
            {source.excerpt || 'Context text retrieved from document.'}
          </p>
        </div>
      )}
    </div>
  );
};
