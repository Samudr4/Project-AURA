"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description?: string;
}

interface DocumentItem {
  id: string;
  projectId: string;
  filename: string;
  mimeType: string;
  fileSize: string; // returned as string from bigint
  status: string;
  createdAt: string;
}

interface DocumentChunk {
  id: string;
  chunkIndex: number;
  chunkSize: number;
  content: string;
}

export default function KnowledgePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  
  // Loading & Action states
  const [projectsLoading, setProjectsLoading] = useState<boolean>(true);
  const [docsLoading, setDocsLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  // File Input references
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Chunk Inspector state
  const [inspectingDoc, setInspectingDoc] = useState<DocumentItem | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [chunksLoading, setChunksLoading] = useState<boolean>(false);

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      setProjectsLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/projects`);
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setProjects(data.data);
          setActiveProjectId(data.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch documents for the active project
  const fetchDocuments = async (projId: string) => {
    if (!projId) return;
    setDocsLoading(true);
    setToastError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/documents?projectId=${projId}`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data);
      } else {
        setToastError(data.error || "Failed to load knowledge base files");
      }
    } catch (err) {
      console.error(err);
      setToastError("Network error: Failed to connect to server");
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    if (activeProjectId) {
      fetchDocuments(activeProjectId);
    }
  }, [activeProjectId]);

  // Toast auto-clear
  useEffect(() => {
    if (toastSuccess || toastError) {
      const timer = setTimeout(() => {
        setToastSuccess(null);
        setToastError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastSuccess, toastError]);

  // Handle local text file reads & uploads
  const handleUploadFile = async (file: File) => {
    if (!activeProjectId) {
      setToastError("Please select or create a project first");
      return;
    }

    // Accept txt, md, json, log, csv, etc.
    const allowedExtensions = ['.txt', '.md', '.json', '.log', '.csv', '.yaml', '.yml', '.js', '.ts', '.py'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(extension) && !file.type.startsWith('text/')) {
      setToastError("Only text-based files (txt, md, json, etc.) are supported for local semantic index parsing.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        const res = await fetch(`${BACKEND_URL}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: activeProjectId,
            filename: file.name,
            mimeType: file.type || 'text/plain',
            content: text
          })
        });
        const data = await res.json();
        if (data.success) {
          setDocuments(prev => [data.data, ...prev]);
          setToastSuccess(`File "${file.name}" indexed successfully!`);
        } else {
          setToastError(data.error || "Upload failed");
        }
      } catch (err) {
        console.error(err);
        setToastError("Network error: Ingestion pipeline failed");
      } finally {
        setUploading(false);
      }
    };

    reader.onerror = () => {
      setToastError("Failed to read file contents");
      setUploading(false);
    };

    reader.readAsText(file);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFile(e.target.files[0]);
    }
  };

  // Inspect Chunks
  const inspectChunks = async (doc: DocumentItem) => {
    setInspectingDoc(doc);
    setChunksLoading(true);
    setChunks([]);
    try {
      const res = await fetch(`${BACKEND_URL}/documents/${doc.id}/chunks`);
      const data = await res.json();
      if (data.success) {
        setChunks(data.data);
      } else {
        setToastError(data.error || "Failed to load chunks");
      }
    } catch (err) {
      console.error(err);
      setToastError("Network error loading document chunks");
    } finally {
      setChunksLoading(false);
    }
  };

  // Delete Document
  const handleDeleteDocument = async (id: string) => {
    if (!window.confirm("Purging this document will remove all semantic index chunks from DB. Proceed?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/documents/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setDocuments(prev => prev.filter(d => d.id !== id));
        setToastSuccess("Document purged successfully");
        if (inspectingDoc?.id === id) {
          setInspectingDoc(null);
          setChunks([]);
        }
      } else {
        setToastError(data.error || "Failed to purge document");
      }
    } catch (err) {
      console.error(err);
      setToastError("Network error: Failed to purge file");
    }
  };

  // Utility to format sizes
  const formatBytes = (bytesStr: string) => {
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return '0 Bytes';
    if (bytes < 1024) return `${bytes} Bytes`;
    const kb = (bytes / 1024).toFixed(1);
    return `${kb} KB`;
  };

  return (
    <div className="flex h-screen bg-black text-gray-200 overflow-hidden font-sans relative">
      
      {/* Success/Error Alerts */}
      {toastSuccess && (
        <div className="fixed top-6 right-6 bg-emerald-950/85 border border-emerald-800 text-emerald-300 px-5 py-3 rounded-2xl text-xs shadow-2xl backdrop-blur-md z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          ✓ {toastSuccess}
        </div>
      )}
      {toastError && (
        <div className="fixed top-6 right-6 bg-red-950/85 border border-red-800 text-red-300 px-5 py-3 rounded-2xl text-xs shadow-2xl backdrop-blur-md z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          ⚠️ {toastError}
        </div>
      )}

      {/* 1. Left Control Panel Sidebar */}
      <aside className="w-80 bg-zinc-950 border-r border-zinc-900 flex flex-col p-5 shrink-0 overflow-y-auto">
        <div className="mb-6">
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 mb-6 group transition-colors">
            <span className="transition-transform group-hover:-translate-x-0.5">←</span> Back to Dashboard
          </Link>
          
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Workspace Scope</h2>
          {projectsLoading ? (
            <div className="h-10 bg-zinc-900/60 rounded-xl animate-pulse border border-zinc-800/40"></div>
          ) : (
            <div className="relative">
              <select
                value={activeProjectId}
                onChange={e => setActiveProjectId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-all cursor-pointer appearance-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Drag & Drop Upload Zone */}
        <div className="flex-1 flex flex-col pt-2 border-t border-zinc-900">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Ingest Document</h3>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-950/10' 
                : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/10 hover:bg-zinc-900/20'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".txt,.md,.json,.log,.csv,.yaml,.yml,.js,.ts,.py"
            />
            
            {uploading ? (
              <div className="space-y-3">
                <div className="h-8 w-8 rounded-full border-2 border-zinc-800 border-t-indigo-500 animate-spin mx-auto"></div>
                <p className="text-xs text-zinc-400 font-medium">Running Chunking Ingestion...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-2xl">📄</div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-300">Drag & drop files here</p>
                  <p className="text-[10px] text-zinc-500">or click to browse local files</p>
                </div>
                <span className="inline-block text-[9px] bg-zinc-900 text-zinc-500 border border-zinc-800/80 px-2 py-0.5 rounded font-mono">
                  TXT, MD, JSON, TS, PY
                </span>
              </div>
            )}
          </div>
          
          <div className="mt-4 p-4 rounded-xl bg-zinc-900/20 border border-zinc-900 text-[10px] text-zinc-500 leading-relaxed">
            * Documents are automatically parsed into 1000-character semantic chunks and indexed scope-wise to provide isolated contextual retrieval.
          </div>
        </div>
      </aside>

      {/* 2. Main Ingested Files Dashboard */}
      <main className="flex-1 flex flex-col bg-black overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-8 bg-zinc-950/40 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Knowledge Base
            </h1>
            <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-2.5 py-0.5 rounded-full font-medium">
              RAG Engine Context
            </span>
          </div>

          <div className="text-xs text-zinc-500">
            {documents.length} Files Configured
          </div>
        </header>

        {/* Documents Table */}
        <div className="flex-1 overflow-y-auto p-8">
          {docsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-zinc-900/40 rounded-xl animate-pulse border border-zinc-900"></div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4 text-xl">
                📚
              </div>
              <h3 className="text-sm font-bold text-zinc-400">Knowledge Base Empty</h3>
              <p className="text-zinc-600 text-xs max-w-sm mt-1">
                Upload developer files or project context guidelines in the left sidebar to provide custom long-term knowledge to Aura.
              </p>
            </div>
          ) : (
            <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950/20">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950/40 text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">
                    <th className="px-6 py-4">Filename</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Size</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Uploaded At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  {documents.map((doc) => {
                    const ext = doc.filename.substring(doc.filename.lastIndexOf('.')).toUpperCase() || 'FILE';
                    return (
                      <tr key={doc.id} className="hover:bg-zinc-900/10 transition-colors">
                        <td className="px-6 py-4 font-medium text-zinc-200">{doc.filename}</td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded text-zinc-400 font-mono">
                            {ext.replace('.', '')}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono">{formatBytes(doc.fileSize)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950/30 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded-full font-semibold">
                            <span className="h-1 w-1 bg-emerald-400 rounded-full animate-pulse"></span>
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500">
                          {new Date(doc.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => inspectChunks(doc)}
                              className="bg-zinc-900 hover:bg-zinc-850 text-indigo-400 hover:text-indigo-300 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-zinc-850 transition-colors"
                            >
                              Inspect Chunks
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="bg-zinc-900 hover:bg-zinc-950 text-zinc-500 hover:text-red-400 text-[10px] font-medium px-2.5 py-1.5 rounded-lg border border-transparent transition-colors"
                            >
                              Purge
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* 3. Chunk Inspector Drawer Panel */}
      {inspectingDoc && (
        <aside className="w-1/3 bg-zinc-950 border-l border-zinc-900 flex flex-col shrink-0 z-40 animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-900/20 shrink-0">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Chunk Inspector</span>
              <h3 className="text-xs font-bold text-zinc-200 truncate">{inspectingDoc.filename}</h3>
            </div>
            <button
              onClick={() => setInspectingDoc(null)}
              className="text-zinc-500 hover:text-zinc-350 text-sm p-1.5 hover:bg-zinc-900 rounded-lg transition-colors"
            >
              ✕
            </button>
          </header>

          {/* Drawer Body (Chunks List) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {chunksLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-zinc-900/60 rounded-2xl animate-pulse border border-zinc-900"></div>
                ))}
              </div>
            ) : chunks.length === 0 ? (
              <div className="text-center text-xs text-zinc-600 py-12">
                No chunks available for this file.
              </div>
            ) : (
              <div className="space-y-5">
                {chunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-4 space-y-3 transition-all hover:bg-zinc-900/30"
                  >
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                      <span>Index segment: #{chunk.chunkIndex + 1}</span>
                      <span>{chunk.chunkSize} chars</span>
                    </div>
                    <pre className="text-[11px] leading-relaxed text-zinc-400 font-mono whitespace-pre-wrap bg-zinc-950/40 p-3 rounded-xl border border-zinc-900/40 overflow-x-auto">
                      {chunk.content}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}

    </div>
  );
}
