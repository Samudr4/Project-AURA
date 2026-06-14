"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
}

interface Agent {
  id: string;
  projectId: string;
  name: string;
  type: string;
  description: string;
  enabled: boolean;
}

interface TaskItem {
  id: string;
  projectId: string;
  agentId: string;
  status: string;
  type: string;
  payload: {
    input?: string;
  };
  result?: {
    output?: string;
    error?: string;
  };
  createdAt: string;
  completedAt?: string;
  agent?: Agent;
}

const PRESET_PROMPTS: Record<string, string[]> = {
  research: [
    "Verify performance stats of Next.js 15 streaming vs SSE.",
    "Compile comparison report of standard Redis cache vs Redis Stack.",
    "Analyze safety constraints of autonomous desktop control loops."
  ],
  coding: [
    "Refactor src/app.ts to isolate routes using sub-routers.",
    "Draft a unit test suite using Jest for document controller uploads.",
    "Optimize prisma database model connections using pool sizing."
  ],
  writing: [
    "Write a technical blog post detailing Aura's localized memory engine.",
    "Draft an introductory email newsletter copy for beta launch users.",
    "Summarize value canvas architecture for non-technical managers."
  ],
  startup: [
    "Generate a Business Model Canvas blueprint for Aura OS.",
    "Estimate monthly server margins with 10,000 active token pipelines.",
    "Outline investor deck pitch structure for localized RAG systems."
  ]
};

export default function AgentsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  
  // Loading & View states
  const [projectsLoading, setProjectsLoading] = useState<boolean>(true);
  const [agentsLoading, setAgentsLoading] = useState<boolean>(false);
  const [tasksLoading, setTasksLoading] = useState<boolean>(false);
  
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [taskInput, setTaskInput] = useState<string>('');
  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [taskProgress, setTaskProgress] = useState<string>('');
  const [viewingResult, setViewingResult] = useState<string | null>(null);

  const [toastSuccess, setToastSuccess] = useState<string | null>(null);
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

  // Fetch agents & tasks when project changes
  const fetchAgentsAndTasks = async (projId: string) => {
    if (!projId) return;
    setAgentsLoading(true);
    setTasksLoading(true);
    setToastError(null);
    try {
      // 1. Fetch agents
      const agentRes = await fetch(`${BACKEND_URL}/agents?projectId=${projId}`);
      const agentData = await agentRes.json();
      if (agentData.success) {
        setAgents(agentData.data);
        if (agentData.data.length > 0) {
          setSelectedAgent(agentData.data[0]);
        }
      }

      // 2. Fetch tasks
      const taskRes = await fetch(`${BACKEND_URL}/agents/tasks?projectId=${projId}`);
      const taskData = await taskRes.json();
      if (taskData.success) {
        setTasks(taskData.data);
      }
    } catch (err) {
      console.error(err);
      setToastError("Failed to synchronize agent database schema");
    } finally {
      setAgentsLoading(false);
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    if (activeProjectId) {
      fetchAgentsAndTasks(activeProjectId);
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

  // Toggle Agent Enabled status
  const handleToggleAgent = async (agentId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`${BACKEND_URL}/agents/${agentId}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setAgents(prev => prev.map(a => a.id === agentId ? data.data : a));
        if (selectedAgent?.id === agentId) {
          setSelectedAgent(data.data);
        }
        setToastSuccess(`${data.data.name} is now ${data.data.enabled ? 'enabled' : 'disabled'}`);
      } else {
        setToastError(data.error || "Failed to update agent");
      }
    } catch (err) {
      console.error(err);
      setToastError("Network error toggling agent status");
    }
  };

  // Launch Task
  const handleLaunchTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;
    if (!selectedAgent.enabled) {
      setToastError("Cannot run task on disabled agent");
      return;
    }
    if (!taskInput.trim()) {
      setToastError("Please enter task specifications");
      return;
    }

    setRunningTaskId('pending');
    setViewingResult(null);
    setTaskProgress("Initializing worker thread...");

    try {
      const res = await fetch(`${BACKEND_URL}/agents/${selectedAgent.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProjectId,
          inputPayload: taskInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        const spawnedTask: TaskItem = data.data;
        setRunningTaskId(spawnedTask.id);
        
        // Add to historical task logs list optimistically
        setTasks(prev => [spawnedTask, ...prev]);
        setTaskInput('');

        // Progress checkpoints simulation
        setTimeout(() => setTaskProgress("Parsing workspace database & memories..."), 1000);
        setTimeout(() => setTaskProgress("Running context-guided solver loops..."), 2000);
        setTimeout(() => setTaskProgress("Compiling structured markdown output..."), 3000);

        // Poll for task completion in a simple loop (simulating background workers)
        pollTaskStatus(spawnedTask.id);
      } else {
        setToastError(data.error || "Failed to trigger task");
        setRunningTaskId(null);
      }
    } catch (err) {
      console.error(err);
      setToastError("Network error: Failed to trigger task execution");
      setRunningTaskId(null);
    }
  };

  // Poll for background task completion
  const pollTaskStatus = async (taskId: string) => {
    let completed = false;
    let attempts = 0;
    while (!completed && attempts < 10) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
      try {
        const res = await fetch(`${BACKEND_URL}/agents/tasks?projectId=${activeProjectId}`);
        const data = await res.json();
        if (data.success) {
          const matched = data.data.find((t: TaskItem) => t.id === taskId);
          if (matched && matched.status !== 'running') {
            setTasks(data.data);
            if (matched.status === 'completed') {
              setViewingResult(matched.result?.output || null);
              setToastSuccess("Task completed successfully!");
            } else {
              setToastError(matched.result?.error || "Task run failed");
            }
            completed = true;
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    setRunningTaskId(null);
  };

  return (
    <div className="flex h-screen bg-black text-gray-200 overflow-hidden font-sans relative">
      
      {/* Toast Alerts */}
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

        {/* Dynamic Agents list to configure */}
        <div className="flex-1 flex flex-col pt-2 border-t border-zinc-900">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">AI Agents</h3>
          </div>

          {agentsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-zinc-900/60 rounded-xl animate-pulse border border-zinc-900"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto">
              {agents.map((item) => {
                const colors: Record<string, string> = {
                  research: 'text-sky-400 bg-sky-950/10 border-sky-900/30',
                  coding: 'text-amber-400 bg-amber-950/10 border-amber-900/30',
                  writing: 'text-purple-400 bg-purple-950/10 border-purple-900/30',
                  startup: 'text-emerald-400 bg-emerald-950/10 border-emerald-900/30'
                };
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedAgent(item)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative ${
                      selectedAgent?.id === item.id 
                        ? 'bg-zinc-900/80 border-zinc-700 shadow-md' 
                        : 'bg-zinc-900/20 border-zinc-900 hover:border-zinc-800'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-zinc-200">{item.name}</span>
                      <label className="relative inline-flex items-center cursor-pointer scale-75" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => handleToggleAgent(item.id, item.enabled)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                      </label>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal line-clamp-2">{item.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* 2. Main Agent Execution Window */}
      <main className="flex-1 flex flex-col bg-black overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-8 bg-zinc-950/40 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Agent Framework Console
            </h1>
            <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-2.5 py-0.5 rounded-full font-medium">
              LangGraph Orchestration
            </span>
          </div>

          <div className="text-xs text-zinc-500">
            Active Workspace Scope
          </div>
        </header>

        {/* Central Workspace Panel */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Form & Prompt inputs */}
          <div className="flex-1 flex flex-col p-8 border-r border-zinc-900 overflow-y-auto">
            {selectedAgent ? (
              <div className="space-y-6 max-w-2xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-zinc-100">{selectedAgent.name}</h2>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold border ${
                      selectedAgent.enabled 
                        ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40' 
                        : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                    }`}>
                      {selectedAgent.enabled ? 'ACTIVE WORKER' : 'DISABLED'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{selectedAgent.description}</p>
                </div>

                <form onSubmit={handleLaunchTask} className="space-y-4 pt-4 border-t border-zinc-900">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Configure Task Specifications</label>
                    <textarea
                      value={taskInput}
                      onChange={e => setTaskInput(e.target.value)}
                      placeholder={`e.g., ${PRESET_PROMPTS[selectedAgent.type]?.[0] || 'Explain project goals'}`}
                      rows={5}
                      disabled={!selectedAgent.enabled || !!runningTaskId}
                      className="w-full bg-zinc-900/40 border border-zinc-850 rounded-2xl px-4 py-3 text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all resize-none"
                    />
                  </div>

                  {/* Preset prompt pills */}
                  {selectedAgent.enabled && !runningTaskId && (
                    <div>
                      <span className="block text-[9px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">Preset Prompts:</span>
                      <div className="flex flex-col gap-2">
                        {PRESET_PROMPTS[selectedAgent.type]?.map((prompt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setTaskInput(prompt)}
                            className="w-full text-left text-[11px] text-zinc-400 hover:text-zinc-200 bg-zinc-900/30 hover:bg-zinc-900/50 border border-zinc-850 rounded-xl px-3 py-2 transition-colors truncate"
                          >
                            💡 {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!selectedAgent.enabled || !!runningTaskId || !taskInput.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl py-3.5 transition-colors shadow-lg shadow-indigo-900/10"
                  >
                    {runningTaskId ? "Orchestrating Graph Steps..." : `Launch ${selectedAgent.name}`}
                  </button>
                </form>

                {/* Progress simulator overlay */}
                {runningTaskId && (
                  <div className="border border-zinc-900 bg-zinc-950/40 backdrop-blur rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-indigo-400 font-semibold tracking-wider uppercase">Executing Graph State</span>
                      <div className="h-4 w-4 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                    
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span className="text-zinc-300">Initialized agent runtime environment</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-indigo-400 animate-pulse">●</span>
                        <span className="text-zinc-200 font-medium">{taskProgress}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <span className="text-2xl mb-4">🤖</span>
                <h3 className="text-xs font-bold text-zinc-400">Select an Agent</h3>
                <p className="text-[11px] text-zinc-600">Select a specialized AI graph worker from the left panel to execute tasks.</p>
              </div>
            )}
          </div>

          {/* Results Output Viewer Panel */}
          <div className="w-1/2 flex flex-col bg-zinc-950/20 overflow-y-auto p-8">
            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-4">Task Result Workspace</h3>
            
            {viewingResult ? (
              <div className="border border-zinc-900 rounded-2xl p-6 bg-zinc-900/10 backdrop-blur leading-relaxed text-xs text-zinc-300 space-y-4 select-text whitespace-pre-wrap font-sans">
                {viewingResult}
              </div>
            ) : (
              <div className="h-full border border-dashed border-zinc-900 rounded-2xl flex flex-col items-center justify-center text-center p-8">
                <span className="text-xl text-zinc-600 mb-2">📋</span>
                <p className="text-[11px] text-zinc-500">Launch a task, or click "View Output" in the task history log table below to render details.</p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Task Execution History logs (bottom segment) */}
        <section className="h-60 border-t border-zinc-900 bg-zinc-950 flex flex-col overflow-hidden shrink-0">
          <header className="px-6 py-3 border-b border-zinc-900/60 bg-zinc-950/60 flex items-center justify-between shrink-0">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Execution History Log</span>
            <span className="text-[10px] text-zinc-600">{tasks.length} runs cataloged</span>
          </header>

          <div className="flex-1 overflow-y-auto px-6 py-2">
            {tasksLoading ? (
              <div className="space-y-2 py-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-10 bg-zinc-900/60 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-600 text-xs">
                No historical records of agent runs located.
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="text-zinc-500 text-[10px] font-semibold border-b border-zinc-900 bg-zinc-950 py-2">
                    <th className="py-2.5">Agent Type</th>
                    <th className="py-2.5">Specs Prompt</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Duration</th>
                    <th className="py-2.5">Date Executed</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-zinc-400">
                  {tasks.map((task) => {
                    const statusColor = task.status === 'completed' 
                      ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30'
                      : task.status === 'running'
                        ? 'text-indigo-400 bg-indigo-950/20 border-indigo-900/30 animate-pulse'
                        : 'text-red-400 bg-red-950/20 border-red-900/30';

                    const duration = task.completedAt 
                      ? `${Math.round((new Date(task.completedAt).getTime() - new Date(task.createdAt).getTime()) / 1000)}s`
                      : 'running...';

                    return (
                      <tr key={task.id} className="hover:bg-zinc-900/20 transition-colors">
                        <td className="py-2.5 font-medium text-zinc-300">
                          {task.agent?.name || task.type}
                        </td>
                        <td className="py-2.5 truncate max-w-xs text-[11px] text-zinc-500">
                          {task.payload.input}
                        </td>
                        <td className="py-2.5">
                          <span className={`text-[9px] px-2 py-0.5 rounded border font-semibold uppercase ${statusColor}`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono text-[11px]">{duration}</td>
                        <td className="py-2.5 text-zinc-600 text-[11px]">
                          {new Date(task.createdAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-2.5 text-right">
                          {task.status === 'completed' && (
                            <button
                              onClick={() => setViewingResult(task.result?.output || null)}
                              className="text-indigo-400 hover:text-indigo-300 text-[10px] font-semibold bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 px-2 py-1 rounded-lg transition-colors"
                            >
                              View Output
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
