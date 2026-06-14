"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
}

interface Source {
  id: number;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  reliability: number;
}

interface ResearchResult {
  query: string;
  depth: string;
  report: string;
  sources: Source[];
  citationsCount: number;
}

const PRESET_QUERIES = [
  "Next.js 15 Server-Sent Events vs WebSockets latency metrics",
  "Isolating PostgreSQL tenant schemas using dynamic Prisma connections",
  "Comparing Claude 3.5 Sonnet vs OpenAI GPT-4o cost distributions"
];

export default function ResearchPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  
  // Search parameters
  const [query, setQuery] = useState<string>('');
  const [depth, setDepth] = useState<string>('simple');

  // Loading, progress & result states
  const [projectsLoading, setProjectsLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [result, setResult] = useState<ResearchResult | null>(null);

  const [toastError, setToastError] = useState<string | null>(null);

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
        console.error(err);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Handle research execution
  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId) {
      setToastError("Please select a project scope first");
      return;
    }
    if (!query.trim()) {
      setToastError("Please enter a research topic");
      return;
    }

    setLoading(true);
    setResult(null);
    setToastError(null);
    setProgressMsg("Formulating query dimensions...");

    // Progress updates simulation
    const timers = [
      setTimeout(() => setProgressMsg("Crawling Google & arXiv databases..."), 800),
      setTimeout(() => setProgressMsg("Ranking comparative sources..."), 1500),
      setTimeout(() => setProgressMsg("Assembling document citation graphs..."), 2200),
    ];

    try {
      const res = await fetch(`${BACKEND_URL}/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProjectId,
          query: query.trim(),
          depth
        })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setToastError(data.error || "Deep search query failed");
      }
    } catch (err) {
      console.error(err);
      setToastError("Network error: Failed to reach RAG crawler pipeline");
    } finally {
      timers.forEach(t => clearTimeout(t));
      setLoading(false);
    }
  };

  // Toast auto-clear
  useEffect(() => {
    if (toastError) {
      const timer = setTimeout(() => setToastError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastError]);

  return (
    <div className="flex h-screen bg-black text-gray-200 overflow-hidden font-sans relative">
      
      {/* Toast Alert */}
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

        {/* Input specifications segment */}
        <div className="flex-1 flex flex-col pt-2 border-t border-zinc-900">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Search Parameter</h3>
          </div>

          <form onSubmit={handleResearch} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Research Topic</label>
              <textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask Perplexity-style crawl questions..."
                rows={5}
                disabled={loading}
                className="w-full bg-zinc-900/40 border border-zinc-850 rounded-2xl px-4 py-3 text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Ingestion Depth</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'simple', label: 'Simple' },
                  { id: 'deep', label: 'Deep (Multi-Agent)' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDepth(item.id)}
                    disabled={loading}
                    className={`border px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      depth === item.id 
                        ? 'bg-zinc-800 border-zinc-650 text-white font-semibold shadow-sm' 
                        : 'bg-zinc-900/30 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets segment */}
            {!loading && (
              <div>
                <span className="block text-[9px] font-semibold text-zinc-600 uppercase tracking-wider mb-2">Sample Research Topics:</span>
                <div className="space-y-2">
                  {PRESET_QUERIES.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuery(q)}
                      className="w-full text-left text-[10px] text-zinc-400 hover:text-zinc-200 bg-zinc-900/20 border border-zinc-900/60 p-2.5 rounded-xl transition-all truncate"
                    >
                      🔍 {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl py-3.5 transition-colors shadow-lg shadow-indigo-900/10 mt-2"
            >
              {loading ? "Conducting search..." : "Conduct Deep Search"}
            </button>
          </form>
        </div>
      </aside>

      {/* 2. Main split view report window */}
      <main className="flex-1 flex flex-col bg-black overflow-hidden relative">
        
        {/* Header */}
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-8 bg-zinc-950/40 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Deep Research Console
            </h1>
            <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-2.5 py-0.5 rounded-full font-medium">
              Perplexity-style RAG
            </span>
          </div>

          <div className="text-xs text-zinc-500">
            Source Citations & Comparisons
          </div>
        </header>

        {/* Loading / Results Panels */}
        <div className="flex-1 flex overflow-hidden">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-pulse">
              <div className="h-8 w-8 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="space-y-1 text-center">
                <p className="text-xs font-semibold text-zinc-300">Searching web indices...</p>
                <p className="text-[10px] text-zinc-500 font-mono">{progressMsg}</p>
              </div>
            </div>
          ) : result ? (
            <div className="flex-1 flex overflow-hidden">
              
              {/* Left Pane: Compiled report */}
              <div className="flex-1 overflow-y-auto p-8 border-r border-zinc-900">
                <div className="border border-zinc-900 rounded-2xl p-6 bg-zinc-900/10 backdrop-blur leading-relaxed text-xs text-zinc-300 space-y-4 select-text whitespace-pre-wrap font-sans">
                  {result.report}
                </div>
              </div>

              {/* Right Pane: Citations compare cards */}
              <div className="w-96 flex flex-col bg-zinc-950/20 overflow-y-auto p-6 shrink-0 space-y-4">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Sources comparison ({result.citationsCount})</h3>
                
                {result.sources.map((src) => {
                  const badgeColors: Record<string, string> = {
                    'devdocs.io': 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30',
                    'arxiv.org': 'bg-sky-950/20 text-sky-400 border-sky-900/30',
                    'engineering.blog': 'bg-purple-950/20 text-purple-400 border-purple-900/30',
                    'w3.org': 'bg-amber-950/20 text-amber-400 border-amber-900/30'
                  };
                  return (
                    <a
                      key={src.id}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 rounded-2xl p-4 transition-all duration-300 block space-y-3 cursor-pointer"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-bold text-zinc-300 group-hover:text-indigo-400 transition-colors truncate max-w-[150px]">
                          [{src.id}] {src.title}
                        </span>
                        <span className={`text-[9px] border px-1.5 py-0.5 rounded font-mono font-semibold ${badgeColors[src.domain] || 'bg-zinc-900 text-zinc-500'}`}>
                          {src.domain}
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-zinc-500 leading-normal line-clamp-3">
                        {src.snippet}
                      </p>

                      <div className="flex justify-between items-center text-[9px] border-t border-zinc-900/40 pt-2 text-zinc-600 font-mono">
                        <span>Reliability: {src.reliability}%</span>
                        <span className="text-zinc-500 group-hover:translate-x-0.5 transition-transform">Visit Link →</span>
                      </div>
                    </a>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
              <span className="text-2xl">🔎</span>
              <h3 className="text-xs font-bold text-zinc-400">Deep Search Engine</h3>
              <p className="text-[11px] text-zinc-600 max-w-sm">
                Enter your research criteria in the left panel to scan sources, resolve citations, and compile an executive summary.
              </p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
