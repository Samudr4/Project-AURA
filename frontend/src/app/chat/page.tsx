"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

interface Chat {
  id: string;
  title: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  createdAt: string;
}

export default function ChatPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [newProjectName, setNewProjectName] = useState('');
  const [newChatTitle, setNewChatTitle] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  
  const [streamingText, setStreamingText] = useState('');
  const [activeModel, setActiveModel] = useState<{ name: string; provider: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

  // Fetch projects on mount
  const fetchProjects = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/projects`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        setProjects(data.data);
        setActiveProjectId(data.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  // Fetch chats when active project changes
  const fetchChats = async (projId: string) => {
    if (!projId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/chat?projectId=${projId}`);
      const data = await res.json();
      if (data.success) {
        setChats(data.data);
        if (data.data.length > 0) {
          setActiveChatId(data.data[0].id);
        } else {
          setActiveChatId('');
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Failed to load chats", err);
    }
  };

  // Fetch chat history when active chat changes
  const fetchHistory = async (chatId: string) => {
    if (!chatId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/chat/${chatId}/history`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      fetchChats(activeProjectId);
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (activeChatId) {
      fetchHistory(activeChatId);
    }
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      const res = await fetch(`${BACKEND_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProjectName })
      });
      const data = await res.json();
      if (data.success) {
        setProjects(prev => [data.data, ...prev]);
        setActiveProjectId(data.data.id);
        setNewProjectName('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatTitle.trim() || !activeProjectId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: activeProjectId, title: newChatTitle })
      });
      const data = await res.json();
      if (data.success) {
        setChats(prev => [data.data, ...prev]);
        setActiveChatId(data.data.id);
        setNewChatTitle('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChatId || !activeProjectId || loading) return;

    const userPrompt = inputMessage;
    setInputMessage('');
    setLoading(true);
    setStreamingText('');
    setActiveModel(null);

    // Optimistically insert user message into visual list
    const tempUserMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: userPrompt,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await fetch(`${BACKEND_URL}/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProjectId,
          chatId: activeChatId,
          message: userPrompt
        })
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        const lines = chunkValue.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr) {
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.type === 'info') {
                  setActiveModel({ name: parsed.model, provider: parsed.provider });
                } else if (parsed.type === 'token') {
                  setStreamingText(prev => prev + parsed.content);
                } else if (parsed.type === 'done') {
                  done = true;
                }
              } catch {
                // ignore parsing boundary tags
              }
            }
          }
        }
      }

      // Reload history to replace optimistic updates and stream caches with exact DB states
      fetchHistory(activeChatId);
    } catch (err) {
      console.error("Streaming message failed", err);
    } finally {
      setLoading(false);
      setStreamingText('');
      setActiveModel(null);
    }
  };

  return (
    <div className="flex h-screen bg-black text-gray-200 overflow-hidden font-sans">
      {/* 1. Projects Sidebar */}
      <aside className="w-64 bg-zinc-950 border-r border-zinc-900 flex flex-col p-4 space-y-6">
        <div>
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 flex items-center gap-2 mb-4">
            ← Back to Dashboard
          </Link>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Projects</h2>
          <form onSubmit={handleCreateProject} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="New project..."
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-zinc-700"
            />
            <button className="bg-zinc-800 hover:bg-zinc-700 px-3 rounded-lg text-xs">+</button>
          </form>
          <div className="space-y-1 overflow-y-auto max-h-48">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProjectId(p.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                  activeProjectId === p.id 
                    ? 'bg-zinc-900 text-white font-semibold border border-zinc-850' 
                    : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-300'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chats Session thread within active project */}
        {activeProjectId && (
          <div className="flex-1 flex flex-col min-h-0">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2">Chats</h2>
            <form onSubmit={handleCreateChat} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="New thread..."
                value={newChatTitle}
                onChange={e => setNewChatTitle(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-zinc-700"
              />
              <button className="bg-zinc-800 hover:bg-zinc-700 px-3 rounded-lg text-xs">+</button>
            </form>
            <div className="flex-1 overflow-y-auto space-y-1">
              {chats.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChatId(c.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs truncate transition-colors ${
                    activeChatId === c.id 
                      ? 'bg-zinc-900 text-white font-semibold border border-zinc-850' 
                      : 'text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-300'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* 2. Main Chat Panel */}
      <section className="flex-1 flex flex-col bg-black relative">
        {activeChatId ? (
          <>
            {/* Header displaying routed active model */}
            <header className="h-14 border-b border-zinc-900 flex items-center justify-between px-6 bg-zinc-950/40 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-zinc-100">
                  {chats.find(c => c.id === activeChatId)?.title}
                </h3>
                {activeModel && (
                  <span className="text-[10px] bg-indigo-950/40 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-900/40 font-semibold uppercase tracking-wider">
                    {activeModel.provider}: {activeModel.name}
                  </span>
                )}
              </div>
            </header>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xl p-4 rounded-2xl text-sm leading-relaxed border ${
                    m.role === 'user'
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-100 rounded-br-none'
                      : 'bg-zinc-950/40 backdrop-blur border-zinc-900 text-zinc-300 rounded-bl-none'
                  }`}>
                    {m.content}
                    {m.model && m.role === 'assistant' && (
                      <div className="text-[10px] text-zinc-600 mt-2 flex justify-end">
                        via {m.model}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Streaming Content Ingestion */}
              {streamingText && (
                <div className="flex justify-start">
                  <div className="max-w-xl p-4 rounded-2xl rounded-bl-none text-sm leading-relaxed border bg-zinc-950/40 backdrop-blur border-zinc-900 text-zinc-300">
                    {streamingText}
                    <span className="inline-block w-1.5 h-4 ml-1 bg-indigo-500 animate-pulse align-middle"></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Prompt Input Form */}
            <footer className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent border-t border-zinc-900/40">
              <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-3">
                <input
                  type="text"
                  placeholder="Ask Aura anything... (Aura will dynamically auto-switch models)"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl px-5 py-3 text-sm transition-colors"
                >
                  Send
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <h3 className="text-lg font-bold text-zinc-400">Select or Create a Chat Thread</h3>
            <p className="text-zinc-600 text-sm max-w-sm">
              Create a project workspace on the left sidebar, then spawn a chat thread to begin interacting with the model router.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
