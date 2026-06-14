"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
}

interface ExecutionStep {
  stepIndex: number;
  action: string;
  target: string;
  status: 'success' | 'failed' | 'awaiting_approval';
  details: string;
  x?: number;
  y?: number;
}

interface ComputerSession {
  id: string;
  prompt: string;
  status: string;
  successRate: number;
  durationSec: number;
  retries: number;
  createdAt: string;
}

const PRESET_PROMPTS = [
  "Focus browser and search Next.js 15 latency metrics",
  "Purge temp log files inside build_cache",
  "Draft digest newsletter and send email"
];

export default function ComputerUsePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [projectsLoading, setProjectsLoading] = useState<boolean>(true);

  // Parameter Configurations
  const [actionPrompt, setActionPrompt] = useState<string>('');
  const [safetyLevel, setSafetyLevel] = useState<number>(3); // Level 3 default
  const [allowUnrestrictedShell, setAllowUnrestrictedShell] = useState<boolean>(false);

  // Run State & Telemetry Metrics
  const [loading, setLoading] = useState<boolean>(false);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'completed' | 'failed'>('idle');

  // Interactive Cursor Position in Simulator
  const [cursorX, setCursorX] = useState<number>(50);
  const [cursorY, setCursorY] = useState<number>(50);
  const [browserUrl, setBrowserUrl] = useState<string>('about:blank');
  const [browserContent, setBrowserContent] = useState<string>('idle'); // idle, chrome, nextjs, vs_code, email

  // Telemetry Dashboard
  const [sessionMetrics, setSessionMetrics] = useState({
    successRate: 97.4,
    durationSec: 14,
    retries: 0,
    screenshotsCount: 0
  });
  const [sessions, setSessions] = useState<ComputerSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState<boolean>(true);
  const [toastError, setToastError] = useState<string | null>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

  // Load projects & session logs on mount
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
        console.error("Failed to fetch projects:", err);
      } finally {
        setProjectsLoading(false);
      }
    };

    const fetchSessions = async () => {
      setSessionsLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/computer/sessions`);
        const data = await res.json();
        if (data.success) {
          setSessions(data.data);
        }
      } catch (err) {
        console.error("Failed to load computer sessions:", err);
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchProjects();
    fetchSessions();
  }, []);

  // Cursor movements simulator logic
  useEffect(() => {
    if (status !== 'running' || currentStepIndex === -1) return;
    const activeStep = steps[currentStepIndex];
    if (!activeStep) return;

    // Smooth cursor movement coordinates transition
    const targetX = activeStep.x !== undefined ? activeStep.x : 50;
    const targetY = activeStep.y !== undefined ? activeStep.y : 50;

    // Update browser simulator states based on execution steps
    if (activeStep.action === 'open_app') {
      if (activeStep.target.includes('Chrome')) {
        setBrowserContent('chrome');
        setBrowserUrl('google.com');
      } else if (activeStep.target.includes('VS Code')) {
        setBrowserContent('vs_code');
      }
    } else if (activeStep.action === 'navigate') {
      setBrowserUrl(activeStep.target);
      if (activeStep.target.includes('localhost')) {
        setBrowserContent('nextjs');
      }
    } else if (activeStep.action === 'filesystem_scan') {
      setBrowserContent('vs_code');
    }

    setCursorX(targetX);
    setCursorY(targetY);
  }, [currentStepIndex, steps, status]);

  // Trigger Action Loop
  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId) {
      setToastError("Please select a workspace project scope first");
      return;
    }
    if (!actionPrompt.trim()) {
      setToastError("Please specify a computer action task prompt");
      return;
    }

    setLoading(true);
    setSteps([]);
    setCurrentStepIndex(-1);
    setStatus('running');
    setBrowserUrl('about:blank');
    setBrowserContent('idle');
    setToastError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/computer/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProjectId,
          actionPrompt: actionPrompt.trim(),
          safetyLevel,
          allowUnrestrictedShell
        })
      });

      const data = await res.json();
      if (data.success) {
        const payload = data.data;
        setSteps(payload.steps);
        setSessionMetrics(payload.metrics);

        // Run sequential steps animation loop
        animateSteps(payload.steps, payload.status);
      } else {
        setToastError(data.error || "Failed to parse computer use prompt");
        setStatus('idle');
      }
    } catch (err) {
      console.error(err);
      setToastError("Network error: Failed to trigger browser executor");
      setStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  // Steps sequential display animation
  const animateSteps = (stepList: ExecutionStep[], finalBackendStatus: string) => {
    let index = 0;
    const runNext = () => {
      if (index >= stepList.length) {
        if (finalBackendStatus === 'paused') {
          setStatus('paused');
        } else {
          setStatus('completed');
        }
        return;
      }
      
      const step = stepList[index];
      if (step.status === 'awaiting_approval') {
        setCurrentStepIndex(index);
        setStatus('paused');
        return;
      }

      setCurrentStepIndex(index);
      index++;
      setTimeout(runNext, 1800); // 1.8 seconds delay per step animation
    };
    runNext();
  };

  // Human approval controls override
  const handleApproval = async (approved: boolean) => {
    if (currentStepIndex === -1) return;
    const updatedSteps = [...steps];
    const targetStep = updatedSteps[currentStepIndex];

    if (approved) {
      targetStep.status = 'success';
      targetStep.details = 'Action confirmed and authorized by operator.';
      setSteps(updatedSteps);
      setStatus('running');

      // Continue animation loop for remaining steps
      setTimeout(() => {
        setStatus('completed');
        // Refresh session logs list
        refreshSessions();
      }, 1500);
    } else {
      targetStep.status = 'failed';
      targetStep.details = 'Action rejected by operator.';
      setSteps(updatedSteps);
      setStatus('failed');
      setSessionMetrics(prev => ({ ...prev, successRate: 0.0 }));
    }
  };

  const refreshSessions = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/computer/sessions`);
      const data = await res.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Autoclear toast
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

        {/* Action input parameters */}
        <div className="flex-1 flex flex-col pt-4 border-t border-zinc-900 space-y-5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Operator Inputs</h3>
          </div>

          <form onSubmit={handleLaunch} className="space-y-4">
            <div>
              <label className="block text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Automation Target Prompt</label>
              <textarea
                value={actionPrompt}
                onChange={e => setActionPrompt(e.target.value)}
                placeholder="e.g. Open browser and search Next.js 15 SSE docs..."
                rows={4}
                disabled={status === 'running'}
                className="w-full bg-zinc-900/40 border border-zinc-850 rounded-2xl px-4 py-3 text-xs text-zinc-300 placeholder-zinc-750 focus:outline-none focus:border-zinc-700 resize-none"
              />
            </div>

            {/* Presets */}
            {status !== 'running' && (
              <div className="space-y-2">
                <span className="block text-[8px] font-semibold text-zinc-600 uppercase tracking-wider">Sample Operators:</span>
                {PRESET_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActionPrompt(p)}
                    className="w-full text-left text-[9px] text-zinc-450 hover:text-zinc-200 bg-zinc-900/10 border border-zinc-900/60 p-2 rounded-xl transition-all truncate"
                  >
                    🖱️ {p}
                  </button>
                ))}
              </div>
            )}

            {/* Safety Levels Slider */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                <span>Safety Ingestion Level</span>
                <span className="text-indigo-400 font-mono">Level {safetyLevel}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={safetyLevel}
                onChange={e => setSafetyLevel(Number(e.target.value))}
                disabled={status === 'running'}
                className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <p className="text-[8px] text-zinc-600 italic">
                {safetyLevel === 0 ? "Level 0: Unchecked Read-only actions." : 
                 safetyLevel <= 2 ? "Level 1-2: Normal network calls allowed." : 
                 "Level 3+: Filesystem write & delete require validation."}
              </p>
            </div>

            {/* Security Shell Access */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-900/80">
              <span className="text-[9px] font-semibold text-zinc-550 uppercase tracking-wider">Shell Access</span>
              <label className="relative inline-flex items-center cursor-pointer scale-75">
                <input
                  type="checkbox"
                  checked={allowUnrestrictedShell}
                  onChange={e => setAllowUnrestrictedShell(e.target.checked)}
                  disabled={status === 'running'}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-650 peer-checked:after:bg-white"></div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || status === 'running' || !actionPrompt.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl py-3.5 transition-colors shadow-lg shadow-indigo-900/20"
            >
              {status === 'running' ? "Running Automation..." : "Launch Operator"}
            </button>
          </form>
        </div>
      </aside>

      {/* 2. Main Desktop Simulator Frame */}
      <main className="flex-1 flex flex-col bg-black overflow-hidden relative">
        
        {/* Header */}
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-8 bg-zinc-950/40 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Operator Desktop Simulator
            </h1>
            <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-full font-medium font-mono">
              /api/v1/computer
            </span>
          </div>

          <div className="text-xs text-zinc-500 font-mono flex items-center gap-2">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${status === 'running' ? 'bg-indigo-500 animate-ping' : status === 'paused' ? 'bg-amber-500' : 'bg-zinc-700'}`}></span>
            Status: <span className="uppercase text-zinc-300 font-semibold">{status}</span>
          </div>
        </header>

        {/* Simulator Grid split */}
        <div className="flex-1 flex overflow-hidden">
          
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-zinc-950/20 overflow-y-auto">
            
            {/* The Desktop simulator window */}
            <div className="relative border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/20 shadow-2xl w-full aspect-[16/10] max-w-2xl flex flex-col">
              
              {/* Window title bar */}
              <div className="h-10 bg-zinc-950 border-b border-zinc-900 px-4 flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/80"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="bg-zinc-900 border border-zinc-850 px-5 py-1 rounded-lg text-[9px] text-zinc-400 font-mono w-72 truncate text-center">
                  {browserUrl}
                </div>
                <div className="w-12"></div>
              </div>

              {/* Window Content Display Screen */}
              <div className="flex-1 bg-zinc-950/70 p-5 relative overflow-hidden flex items-center justify-center select-none font-sans">
                
                {browserContent === 'idle' && (
                  <div className="text-center space-y-2.5">
                    <span className="text-3xl block">🖥️</span>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Simulator Standing By</h4>
                    <p className="text-[9px] text-zinc-700 max-w-xs leading-normal">Spawning Chrome and Editor canvases automatically on launch command runs.</p>
                  </div>
                )}

                {browserContent === 'chrome' && (
                  <div className="w-full h-full border border-zinc-900 rounded-xl bg-zinc-900/30 p-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-lg shadow-md shadow-red-950/20">Chrome</div>
                    <div className="w-64 h-8 bg-zinc-950/80 border border-zinc-850 rounded-xl px-4 flex items-center text-zinc-400 text-[9px] font-semibold shadow">Search URL or terms...</div>
                  </div>
                )}

                {browserContent === 'nextjs' && (
                  <div className="w-full h-full border border-zinc-900 rounded-xl bg-zinc-900/25 p-5 space-y-4 select-none">
                    <div className="border-b border-zinc-900 pb-3 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-zinc-200">AURA WORKSPACE INTERFACE</span>
                      <span className="text-[8px] bg-indigo-950 border border-indigo-900 px-1.5 py-0.5 rounded text-indigo-400 font-semibold uppercase">System Analytics</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl space-y-1">
                        <span className="text-[8px] text-zinc-550 uppercase tracking-wider block font-bold">Total Cost</span>
                        <span className="text-base font-bold font-mono text-zinc-300">$0.14</span>
                      </div>
                      <div className="bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl space-y-1">
                        <span className="text-[8px] text-zinc-550 uppercase tracking-wider block font-bold">Active Providers</span>
                        <span className="text-xs font-bold text-emerald-400">OpenAI, Anthropic</span>
                      </div>
                    </div>
                  </div>
                )}

                {browserContent === 'vs_code' && (
                  <div className="w-full h-full border border-zinc-900 rounded-xl bg-zinc-950/90 flex flex-col font-mono text-[9px] text-zinc-400 p-4 select-none">
                    <div className="border-b border-zinc-900 pb-2 flex items-center justify-between text-zinc-500">
                      <span>💻 VS Code Editor</span>
                      <span>UTF-8</span>
                    </div>
                    <div className="flex-1 pt-3 space-y-1.5">
                      <p className="text-indigo-400 font-semibold">// Optimizing controller batches...</p>
                      <p><span className="text-zinc-600">1</span> <span className="text-purple-400">import</span> &#123; prisma &#125; <span className="text-purple-400">from</span> <span className="text-emerald-400">&apos;../config/db.js&apos;</span>;</p>
                      <p><span className="text-zinc-600">2</span> <span className="text-purple-400">export const</span> <span className="text-yellow-400">flush</span> = <span className="text-purple-400">async</span> () =&gt; &#123;</p>
                      <p><span className="text-zinc-600">3</span> &nbsp;&nbsp;<span className="text-purple-400">await</span> prisma.task.updateMany(&#123; ... &#125;);</p>
                      <p><span className="text-zinc-600">4</span> &#125;;</p>
                    </div>
                  </div>
                )}

                {/* Animated pointer cursor */}
                {status === 'running' && (
                  <div
                    style={{
                      left: `${cursorX}%`,
                      top: `${cursorY}%`
                    }}
                    className="absolute h-5 w-5 pointer-events-none select-none transition-all duration-700 ease-in-out z-30"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg animate-pulse">
                      <path d="M0 0 L6.5 15 L9.5 9 L15.5 6.5 Z" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5"/>
                    </svg>
                  </div>
                )}

                {/* Human-in-the-loop approval popover card overlay */}
                {status === 'paused' && currentStepIndex !== -1 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-5 z-45 animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
                      <div className="flex gap-3 items-start">
                        <span className="text-xl">🛡️</span>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-200">Security Approval Required</h4>
                          <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                            The task execution requested a restricted operation: <br />
                            <strong className="text-indigo-400">{steps[currentStepIndex]?.action}</strong> targetting <strong className="text-zinc-300">"{steps[currentStepIndex]?.target}"</strong>.
                          </p>
                        </div>
                      </div>

                      <p className="text-[9px] text-zinc-650 pl-8 leading-normal">
                        Confirm if you authorize AURA to run this operation inside your sandboxed workspace scope.
                      </p>

                      <div className="flex gap-2.5 justify-end pl-8">
                        <button
                          type="button"
                          onClick={() => handleApproval(false)}
                          className="bg-zinc-950 border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-white px-4 py-2 rounded-xl text-[10px] font-semibold transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproval(true)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-[10px] font-semibold transition-colors shadow shadow-indigo-950"
                        >
                          Approve Action
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* 3. Right Sidebar split details */}
          <aside className="w-96 border-l border-zinc-900 flex flex-col bg-zinc-950/35 overflow-hidden shrink-0">
            
            <div className="flex flex-col flex-1 min-h-0">
              
              {/* Actions List Grid */}
              <div className="flex-1 flex flex-col min-h-0 border-b border-zinc-900">
                <div className="h-10 border-b border-zinc-900/80 px-4 flex items-center bg-zinc-950/50 shrink-0">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Orchestration Actions Log</span>
                </div>

                {/* Log list viewport */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 select-text font-mono text-[9px]">
                  {steps.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <span className="text-xl text-zinc-700 mb-1.5">📋</span>
                      <p className="text-[9px] text-zinc-600">Start the operator to view step-by-step filesystem and browser execution logs.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {steps.map((step, idx) => {
                        const isCurrent = currentStepIndex === idx;
                        const statusColors = step.status === 'success' 
                          ? 'text-emerald-400' 
                          : step.status === 'awaiting_approval'
                            ? 'text-amber-400 animate-pulse font-bold'
                            : 'text-zinc-650';

                        return (
                          <div
                            key={idx}
                            className={`border rounded-xl p-3 transition-colors ${
                              isCurrent 
                                ? 'bg-indigo-950/15 border-indigo-500/80 shadow' 
                                : 'bg-zinc-900/10 border-zinc-900'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-zinc-300">Step {step.stepIndex}: {step.action.toUpperCase()}</span>
                              <span className={`uppercase font-bold ${statusColors}`}>{step.status}</span>
                            </div>
                            <p className="text-zinc-500 font-sans leading-normal">{step.details}</p>
                            <div className="text-[8px] text-zinc-650 mt-1 border-t border-zinc-900/40 pt-1 flex gap-3">
                              <span>Target: {step.target}</span>
                              {step.x !== undefined && <span>Pos: ({step.x}, {step.y})</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom statistics panel */}
              <div className="h-56 flex flex-col bg-zinc-950/60 shrink-0 min-h-0">
                <div className="h-9 border-b border-zinc-900/80 px-4 flex items-center bg-zinc-950/90 shrink-0">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Metrics Telemetry</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Gauge stats grids */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-2 text-center">
                      <p className="text-[7px] font-bold text-zinc-550 uppercase tracking-wider">Success Rate</p>
                      <p className="text-[11px] font-bold font-mono text-zinc-200 mt-0.5">{sessionMetrics.successRate.toFixed(1)}%</p>
                    </div>
                    <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-2 text-center">
                      <p className="text-[7px] font-bold text-zinc-550 uppercase tracking-wider">Duration</p>
                      <p className="text-[11px] font-bold font-mono text-zinc-200 mt-0.5">{sessionMetrics.durationSec}s</p>
                    </div>
                    <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-2 text-center">
                      <p className="text-[7px] font-bold text-zinc-550 uppercase tracking-wider">Screenshots</p>
                      <p className="text-[11px] font-bold font-mono text-indigo-400 mt-0.5">{sessionMetrics.screenshotsCount}</p>
                    </div>
                  </div>

                  {/* Sessions logs */}
                  <div className="space-y-1.5">
                    <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Historical Sessions Logs</span>
                    {sessionsLoading ? (
                      <div className="h-16 bg-zinc-900/25 rounded-xl animate-pulse"></div>
                    ) : (
                      <div className="border border-zinc-900/80 rounded-xl overflow-hidden">
                        <table className="w-full text-[8px] font-mono text-zinc-400">
                          <thead>
                            <tr className="border-b border-zinc-900 bg-zinc-950/80 text-zinc-550 text-left">
                              <th className="py-1 px-2">Prompt Command</th>
                              <th className="py-1 px-2 text-center">Duration</th>
                              <th className="py-1 px-2 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sessions.map((sess, idx) => (
                              <tr key={idx} className="border-b border-zinc-900/40 hover:bg-zinc-900/10 last:border-b-0">
                                <td className="py-1 px-2 text-zinc-300 truncate max-w-[150px]">{sess.prompt}</td>
                                <td className="py-1 px-2 text-center">{sess.durationSec}s</td>
                                <td className={`py-1 px-2 text-right font-bold ${sess.status === 'completed' ? 'text-emerald-400' : 'text-amber-500'}`}>{sess.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}
