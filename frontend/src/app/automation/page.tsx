"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
}

interface AutomationJob {
  id: string;
  name: string;
  cron: string;
  status: 'Active' | 'Inactive';
  description: string;
  lastRun: string;
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'system';
}

export default function AutomationPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  
  // Loading & State
  const [projectsLoading, setProjectsLoading] = useState<boolean>(true);
  const [jobsLoading, setJobsLoading] = useState<boolean>(false);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);

  // Terminal Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      timestamp: new Date(Date.now() - 3600000 * 12).toLocaleTimeString(),
      message: "Daily Activity Digest: Cron trigger executed successfully. Summarized chat history and parsed 4 user memory entries.",
      type: 'system'
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 24 * 5).toLocaleTimeString(),
      message: "Weekly RAG Index Maintenance: Cron trigger executed. Scanned 3 project collections, purged 15 redundant document chunks.",
      type: 'system'
    }
  ]);

  const [toastSuccess, setToastSuccess] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
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

  // Fetch cron jobs when project changes
  const fetchJobs = async (projId: string) => {
    if (!projId) return;
    setJobsLoading(true);
    setToastError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/automation?projectId=${projId}`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
      } else {
        setToastError(data.error || "Failed to load cron jobs");
      }
    } catch (err) {
      console.error(err);
      setToastError("Network error: Failed to connect to server");
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    if (activeProjectId) {
      fetchJobs(activeProjectId);
    }
  }, [activeProjectId]);

  // Scroll terminal logs to bottom on update
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

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

  // Toggle Job Status (Active / Inactive)
  const handleToggleJob = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? false : true;
    try {
      const res = await fetch(`${BACKEND_URL}/automation/${jobId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        setJobs(prev => prev.map(j => j.id === jobId ? data.data : j));
        setToastSuccess(`Job "${data.data.name}" set to ${data.data.status}`);
        
        // Append log
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, {
          timestamp: time,
          message: `Scheduler State: Modified job "${data.data.name}" configuration to ${data.data.status.toUpperCase()}.`,
          type: 'info'
        }]);
      } else {
        setToastError(data.error || "Failed to toggle job");
      }
    } catch (err) {
      console.error(err);
      setToastError("Network error toggling job status");
    }
  };

  // Run Cron Job Now
  const handleTriggerJob = async (jobId: string) => {
    setTriggeringId(jobId);
    
    const time = new Date().toLocaleTimeString();
    const targetName = jobs.find(j => j.id === jobId)?.name || 'Task';
    
    // Add logs indicating manual execution initiated
    setLogs(prev => [
      ...prev,
      { timestamp: time, message: `Manual trigger: Initiating execution loop for "${targetName}"...`, type: 'info' },
      { timestamp: time, message: `Manual trigger: Resolving scheduler context guidelines...`, type: 'info' }
    ]);

    try {
      const res = await fetch(`${BACKEND_URL}/automation/${jobId}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: activeProjectId })
      });
      const data = await res.json();
      if (data.success) {
        // Wait 1.2 seconds for realistic execution logs to append
        setTimeout(() => {
          setJobs(prev => prev.map(j => j.id === jobId ? data.data.job : j));
          setLogs(prev => [...prev, {
            timestamp: new Date(data.data.timestamp).toLocaleTimeString(),
            message: data.data.logMessage,
            type: 'success'
          }]);
          setToastSuccess(`Execution complete for "${targetName}"`);
          setTriggeringId(null);
        }, 1200);
      } else {
        setToastError(data.error || "Failed to execute cron job");
        setTriggeringId(null);
      }
    } catch (err) {
      console.error(err);
      setToastError("Network error triggering job execution");
      setTriggeringId(null);
    }
  };

  return (
    <div className="flex h-screen bg-black text-gray-200 overflow-hidden font-sans relative">
      
      {/* Toast notifications */}
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

        <div className="flex-1 flex flex-col pt-2 border-t border-zinc-900">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Scheduler Details</h3>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed">
            The Automation Engine schedules background operations scoped to user databases. Triggering manually updates memory profiles immediately.
          </p>

          <div className="mt-4 p-4 rounded-xl bg-zinc-900/20 border border-zinc-900 text-[10px] text-zinc-500 leading-relaxed">
            * <strong>Daily Digest:</strong> Analyzes chats to auto-extract memories.
            <br />
            * <strong>Weekly RAG:</strong> Runs similarity re-index loops.
            <br />
            * <strong>Git Sync:</strong> Clones project workspace files to sync indices.
          </div>
        </div>
      </aside>

      {/* 2. Main Automation Dashboard */}
      <main className="flex-1 flex flex-col bg-black overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-8 bg-zinc-950/40 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Automation Engine
            </h1>
            <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-2.5 py-0.5 rounded-full font-medium">
              Background Scheduler
            </span>
          </div>

          <div className="text-xs text-zinc-500">
            System Crontab Console
          </div>
        </header>

        {/* Workspace Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Cron Jobs Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobsLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-44 bg-zinc-900/40 rounded-2xl animate-pulse border border-zinc-900"></div>
              ))
            ) : (
              jobs.map((job) => {
                const isActive = job.status === 'Active';
                return (
                  <div
                    key={job.id}
                    className="bg-zinc-900/20 border border-zinc-850 rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-zinc-800 duration-300"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold text-zinc-200">{job.name}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-semibold border ${
                          isActive 
                            ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40' 
                            : 'bg-zinc-900 text-zinc-500 border-zinc-850'
                        }`}>
                          {job.status}
                        </span>
                      </div>

                      <p className="text-[10px] text-zinc-500 leading-normal mb-4">{job.description}</p>
                    </div>

                    {/* Card Footer */}
                    <div className="border-t border-zinc-900/60 pt-3 mt-auto space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-zinc-650 font-mono">
                        <span>Schedule: <strong>{job.cron}</strong></span>
                        <span className="truncate max-w-[150px]">Last Run: {job.lastRun !== 'Never' ? new Date(job.lastRun).toLocaleDateString() : 'Never'}</span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <button
                          onClick={() => handleToggleJob(job.id, job.status)}
                          className={`flex-1 text-[10px] font-semibold py-2 rounded-lg border transition-all ${
                            isActive
                              ? 'bg-zinc-900 hover:bg-zinc-950 border-zinc-850 text-red-400 hover:text-red-300'
                              : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-850 text-emerald-400 hover:text-emerald-300'
                          }`}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleTriggerJob(job.id)}
                          disabled={!!triggeringId}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-[10px] font-semibold py-2 rounded-lg transition-colors"
                        >
                          {triggeringId === job.id ? 'Running...' : 'Run Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Telemetry Terminal Block */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden flex flex-col h-72 shadow-xl">
            <header className="px-5 py-3 border-b border-zinc-900 bg-zinc-900/20 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500/80"></span>
                <span className="h-2 w-2 rounded-full bg-yellow-500/80"></span>
                <span className="h-2 w-2 rounded-full bg-green-500/80"></span>
                <span className="text-[10px] text-zinc-500 font-mono font-bold ml-2">CRONTAB TERMINAL OUTPUT</span>
              </div>
              <button
                onClick={() => setLogs([])}
                className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Clear Terminal
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5 font-mono text-[11px] leading-relaxed space-y-2 select-text bg-black/60 scrollbar-thin">
              {logs.length === 0 ? (
                <span className="text-zinc-700 select-none">No active logs. Firing manual crons appends output details here...</span>
              ) : (
                logs.map((entry, idx) => {
                  let typeColor = 'text-zinc-500';
                  if (entry.type === 'success') typeColor = 'text-emerald-400 font-semibold';
                  if (entry.type === 'info') typeColor = 'text-indigo-400';
                  return (
                    <div key={idx} className="flex gap-2">
                      <span className="text-zinc-700 shrink-0 select-none">[{entry.timestamp}]</span>
                      <span className={typeColor}>{entry.message}</span>
                    </div>
                  );
                })
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
