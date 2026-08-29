import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  FileText,
  Upload,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Plus,
  X,
  FileUp,
  FolderOpen,
  Info,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Admissions',
  'Courses & Academics',
  'Departments & Faculty',
  'Fees',
  'Scholarships',
  'Placements',
  'Campus Facilities',
  'Rules & Policies',
  'Notices & Announcements',
  'Important Contacts',
  'Student FAQs',
  'General',
];

export const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Admissions');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadVersion, setUploadVersion] = useState('1.0');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory, selectedStatus, search]);

  // Polling if any document is in PROCESSING status
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.processingStatus === 'PROCESSING');
    let interval = null;
    if (hasProcessing) {
      interval = setInterval(() => {
        fetchDocuments(false);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [documents]);

  const fetchDocuments = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await api.get('/documents', {
        params: {
          collegeId: 'saoe_pune',
          category: selectedCategory,
          status: selectedStatus,
          search: search || undefined,
        },
      });
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please choose a document file (PDF, DOCX, or TXT).');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle || uploadFile.name);
      formData.append('collegeId', 'saoe_pune');
      formData.append('category', uploadCategory);
      formData.append('description', uploadDescription);
      formData.append('version', uploadVersion);

      await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset modal and reload
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadCategory('Admissions');
      setUploadDescription('');
      fetchDocuments();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This will purge all associated vectors from the vector database.`)) {
      try {
        await api.delete(`/documents/${id}`);
        fetchDocuments();
      } catch (err) {
        alert('Failed to delete document: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">College Knowledge Base</h1>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Document Manager
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Manage official college documents, vector index status, and chunk extractions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchDocuments(true)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/25 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Document</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or filename..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Category Filter */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <span className="text-xs text-slate-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <span className="text-xs text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-brand-500"
            >
              <option value="All">All Statuses</option>
              <option value="READY">Ready</option>
              <option value="PROCESSING">Processing</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/90 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Document</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Vectors / Chunks</th>
                <th className="py-3.5 px-4 font-semibold">Upload Date</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500 text-xs">
                    Loading knowledge base documents...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 text-xs">
                    <FolderOpen className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                    <p>No documents found matching the filter criteria.</p>
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-100 truncate max-w-xs">{doc.title}</p>
                          <p className="text-[11px] text-slate-500 truncate max-w-xs">{doc.fileName}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700/60">
                        {doc.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center space-x-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                          doc.processingStatus === 'READY'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : doc.processingStatus === 'PROCESSING'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {doc.processingStatus === 'READY' && <CheckCircle2 className="w-3 h-3" />}
                        {doc.processingStatus === 'PROCESSING' && <Clock className="w-3 h-3 animate-spin" />}
                        {doc.processingStatus === 'FAILED' && <AlertTriangle className="w-3 h-3" />}
                        <span>{doc.processingStatus}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs text-brand-300 font-medium">
                        {doc.chunkCount || 0} chunks
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteDocument(doc._id, doc.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Document & Purge Vectors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-800 p-6 shadow-2xl relative animate-scaleIn">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <FileUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Upload Knowledge Document</h2>
                <p className="text-xs text-slate-400">PDF, DOCX, or TXT documents for RAG ingestion</p>
              </div>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'border-slate-800 hover:border-brand-500/40 bg-slate-900/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 mx-auto text-brand-400 mb-2" />
                {uploadFile ? (
                  <div>
                    <p className="text-xs font-semibold text-white">{uploadFile.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {(uploadFile.size / 1024).toFixed(1)} KB • Click to choose another
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-medium text-slate-200">
                      Click to browse or drag & drop college document here
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">Supports PDF, DOCX, TXT up to 25MB</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Admission Guidelines 2026-2027"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Version</label>
                  <input
                    type="text"
                    value={uploadVersion}
                    onChange={(e) => setUploadVersion(e.target.value)}
                    placeholder="1.0"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Brief summary of what this document covers..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-brand-500/25 flex items-center space-x-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Process & Vectorize</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
