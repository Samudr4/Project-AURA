"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

interface Memory {
  id: string;
  projectId: string;
  type: string;
  content: string;
  importanceScore: number;
  source: string;
  createdAt: string;
}

export default function MemoryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [projectsLoading, setProjectsLoading] = useState<boolean>(true);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // New Memory form state
  const [newContent, setNewContent] = useState<string>('');
  const [newType, setNewType] = useState<string>('preference');
  const [newImportance, setNewImportance] = useState<number>(0.8);
  const [newSource, setNewSource] = useState<string>('user-manual');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // Edit states mapping memory ID -> edit form fields
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [editImportance, setEditImportance] = useState<number>(0.8);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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

  // Fetch memories when active project changes
  const fetchMemories = async (projId: string) => {
    if (!projId) return;
    setLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/memory?projectId=${projId}`);
      const data = await res.json();
      if (data.success) {
        setMemories(data.data);
      } else {
        setActionError(data.error || "Failed to load memories");
      }
    } catch (err) {
      console.error("Failed to load memories", err);
      setActionError("Network error: Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeProjectId) {
      fetchMemories(activeProjectId);
    }
  }, [activeProjectId]);

  // Clean success/error banners after 4 seconds
  useEffect(() => {
    if (actionSuccess || actionError) {
      const timer = setTimeout(() => {
        setActionSuccess(null);
        setActionError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess, actionError]);

  // Handle Memory Creation
  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId) {
      setActionError("Please select or create a project first");
      return;
    }
    if (!newContent.trim()) {
      setActionError("Memory content cannot be empty");
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProjectId,
          type: newType.toLowerCase(),
          content: newContent.trim(),
          importanceScore: newImportance,
          source: newSource
        })
      });
      const data = await res.json();
      if (data.success) {
        setMemories(prev => [data.data, ...prev]);
        setNewContent('');
        setNewImportance(0.8);
        setActionSuccess("Memory saved successfully");
      } else {
        setActionError(data.error || "Failed to create memory");
      }
    } catch (err) {
      console.error(err);
      setActionError("Network error: Failed to create memory");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Start Edit Mode
  const startEditing = (mem: Memory) => {
    setEditingId(mem.id);
    setEditContent(mem.content);
    setEditImportance(mem.importanceScore);
  };

  // Save Edit
  const handleUpdateMemory = async (id: string) => {
    if (!editContent.trim()) {
      setActionError("Content cannot be empty");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/memory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editContent.trim(),
          importanceScore: editImportance
        })
      });
      const data = await res.json();
      if (data.success) {
        setMemories(prev => prev.map(m => m.id === id ? data.data : m));
        setEditingId(null);
        setActionSuccess("Memory updated");
      } else {
        setActionError(data.error || "Failed to update memory");
      }
    } catch (err) {
      console.error(err);
      setActionError("Network error: Failed to update memory");
    }
  };

  // Handle Delete
  const handleDeleteMemory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this memory?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/memory/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setMemories(prev => prev.filter(m => m.id !== id));
        setActionSuccess("Memory deleted");
      } else {
        setActionError(data.error || "Failed to delete memory");
      }
    } catch (err) {
      console.error(err);
      setActionError("Network error: Failed to delete memory");
    }
  };

  // Calculate stats for categories
  const categoryCounts = useMemo(() => {
    const counts = { all: memories.length, preference: 0, fact: 0, decision: 0, other: 0 };
    memories.forEach(m => {
      const t = m.type.toLowerCase();
      if (t === 'preference') counts.preference++;
      else if (t === 'fact') counts.fact++;
      else if (t === 'decision') counts.decision++;
      else counts.other++;
    });
    return counts;
  }, [memories]);

  // Filter memories based on search query and category
  const filteredMemories = useMemo(() => {
    return memories.filter(m => {
      const matchesSearch = m.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (m.source && m.source.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'all' || m.type.toLowerCase() === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [memories, searchQuery, activeCategory]);

  return (
    <div className="flex h-screen bg-black text-gray-200 overflow-hidden font-sans">
      
      {/* 1. Left Control Panel Sidebar */}
      <aside className="w-80 bg-zinc-950 border-r border-zinc-900 flex flex-col p-5 space-y-6 shrink-0 overflow-y-auto">
        <div>
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
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all cursor-pointer appearance-none"
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

        {/* Create Manual Fact Form */}
        <div className="flex-1 flex flex-col pt-2 border-t border-zinc-900">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Store New Fact</h3>
          </div>

          <form onSubmit={handleCreateMemory} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Memory Text</label>
              <textarea
                placeholder="e.g., Prefers writing unit tests in Jest, hates mocha..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                rows={4}
                className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-3.5 py-2.5 text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Category Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'preference', label: 'Preference', color: 'border-amber-900/40 hover:border-amber-700/60 text-amber-400 bg-amber-950/10' },
                  { id: 'fact', label: 'Fact', color: 'border-sky-900/40 hover:border-sky-700/60 text-sky-400 bg-sky-950/10' },
                  { id: 'decision', label: 'Decision', color: 'border-emerald-900/40 hover:border-emerald-700/60 text-emerald-400 bg-emerald-950/10' },
                  { id: 'other', label: 'Other', color: 'border-purple-900/40 hover:border-purple-700/60 text-purple-400 bg-purple-950/10' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setNewType(item.id)}
                    className={`border px-3 py-2 rounded-xl text-xs font-medium transition-all ${item.color} ${
                      newType === item.id 
                        ? 'bg-zinc-800/60 border-zinc-600/80 text-white shadow-md' 
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Importance Weight</label>
                <span className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800/60 text-zinc-400 font-mono">
                  {Math.round(newImportance * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={newImportance}
                onChange={e => setNewImportance(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 bg-zinc-900 rounded-lg appearance-none cursor-pointer h-1.5"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Source Type</label>
              <select
                value={newSource}
                onChange={e => setNewSource(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 transition-all cursor-pointer"
              >
                <option value="user-manual">User Manual Input</option>
                <option value="system-instruction">System Instruction</option>
                <option value="config-file">Config File</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={formSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl py-3 transition-colors shadow-lg shadow-indigo-900/10 mt-2"
            >
              {formSubmitting ? "Saving Fact..." : "Commit Memory to DB"}
            </button>
          </form>
        </div>
      </aside>

      {/* 2. Main Content Dashboard */}
      <main className="flex-1 flex flex-col bg-black overflow-hidden relative">
        
        {/* Banner notifications */}
        {actionSuccess && (
          <div className="absolute top-4 right-4 bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 px-4 py-2.5 rounded-xl text-xs shadow-xl backdrop-blur-sm z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            ✓ {actionSuccess}
          </div>
        )}
        {actionError && (
          <div className="absolute top-4 right-4 bg-red-950/80 border border-red-800/80 text-red-300 px-4 py-2.5 rounded-xl text-xs shadow-xl backdrop-blur-sm z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            ⚠️ {actionError}
          </div>
        )}

        {/* Top Header bar */}
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-8 bg-zinc-950/40 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Aura Memory Console
            </h1>
            <span className="text-[10px] bg-zinc-900 border border-zinc-800/80 text-zinc-500 px-2.5 py-0.5 rounded-full font-medium">
              v1.0 (Workspace Database)
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search memories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-60 bg-zinc-900/60 border border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-all"
              />
              <svg className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Category Tabs / Filters */}
        <div className="px-8 py-3 border-b border-zinc-900 bg-zinc-950/20 shrink-0 flex items-center justify-between">
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All Memories', count: categoryCounts.all },
              { id: 'preference', label: 'Preferences', count: categoryCounts.preference, color: 'text-amber-400' },
              { id: 'fact', label: 'Facts', count: categoryCounts.fact, color: 'text-sky-400' },
              { id: 'decision', label: 'Decisions', count: categoryCounts.decision, color: 'text-emerald-400' },
              { id: 'other', label: 'Others', count: categoryCounts.other, color: 'text-purple-400' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === tab.id
                    ? 'bg-zinc-900 border border-zinc-800 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] bg-zinc-950 border border-zinc-900 px-1.5 py-0.5 rounded-full ${activeCategory === tab.id ? tab.color || 'text-zinc-300' : 'text-zinc-600'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="text-[11px] text-zinc-500">
            Showing {filteredMemories.length} of {memories.length} records
          </div>
        </div>

        {/* Grid of Memory Cards */}
        <div className="flex-1 overflow-y-auto p-8 bg-zinc-950/20">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-44 bg-zinc-900/40 rounded-2xl animate-pulse border border-zinc-900/60 p-5 space-y-4">
                  <div className="flex justify-between">
                    <div className="w-20 h-5 bg-zinc-850 rounded"></div>
                    <div className="w-12 h-5 bg-zinc-850 rounded"></div>
                  </div>
                  <div className="h-10 bg-zinc-850 rounded"></div>
                  <div className="w-32 h-4 bg-zinc-850 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredMemories.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4 text-xl">
                🧠
              </div>
              <h3 className="text-sm font-bold text-zinc-400">No Memories Found</h3>
              <p className="text-zinc-600 text-xs max-w-sm mt-1">
                {searchQuery || activeCategory !== 'all' 
                  ? "Try refining your search text or selected filter criteria." 
                  : "No long-term memories have been logged yet. Use the chat pane to prompt facts like 'I prefer Rust over C++' or manually enter a fact in the left sidebar."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMemories.map((mem) => {
                const isEditing = editingId === mem.id;
                const typeColorMap: Record<string, { bg: string, text: string, border: string }> = {
                  preference: { bg: 'bg-amber-950/20', text: 'text-amber-400', border: 'border-amber-500/20' },
                  fact: { bg: 'bg-sky-950/20', text: 'text-sky-400', border: 'border-sky-500/20' },
                  decision: { bg: 'bg-emerald-950/20', text: 'text-emerald-400', border: 'border-emerald-500/20' },
                  other: { bg: 'bg-purple-950/20', text: 'text-purple-400', border: 'border-purple-500/20' }
                };
                const typeStyle = typeColorMap[mem.type.toLowerCase()] || typeColorMap.other;

                return (
                  <div
                    key={mem.id}
                    className="group relative bg-zinc-900/30 hover:bg-zinc-900/50 backdrop-blur border border-zinc-800/80 hover:border-zinc-700/60 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-wider uppercase border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                          {mem.type}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-mono">Weight: {Math.round((isEditing ? editImportance : mem.importanceScore) * 100)}%</span>
                          <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 transition-all duration-300" 
                              style={{ width: `${(isEditing ? editImportance : mem.importanceScore) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      {isEditing ? (
                        <div className="space-y-3 mt-1 mb-4">
                          <textarea
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            rows={3}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition-all resize-none"
                          />
                          <div>
                            <input
                              type="range"
                              min="0.1"
                              max="1.0"
                              step="0.05"
                              value={editImportance}
                              onChange={e => setEditImportance(parseFloat(e.target.value))}
                              className="w-full accent-indigo-500 bg-zinc-950 rounded-lg appearance-none cursor-pointer h-1"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-zinc-300 text-xs leading-relaxed mb-5 font-medium whitespace-pre-wrap">
                          {mem.content}
                        </p>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="flex justify-between items-center border-t border-zinc-900/60 pt-3 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-600">
                          Source: <strong className="text-zinc-500 font-semibold">{mem.source || 'unknown'}</strong>
                        </span>
                        <span className="text-[9px] text-zinc-700">
                          {new Date(mem.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      {/* Action Triggers */}
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleUpdateMemory(mem.id)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(mem)}
                              className="opacity-0 group-hover:opacity-100 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] font-medium px-2.5 py-1.5 rounded-lg border border-transparent hover:border-zinc-800 transition-all duration-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMemory(mem.id)}
                              className="opacity-0 group-hover:opacity-100 hover:bg-zinc-800/60 text-zinc-500 hover:text-red-400 text-[10px] font-medium px-2.5 py-1.5 rounded-lg border border-transparent hover:border-zinc-800/30 transition-all duration-200"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
