"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
}

interface VoiceSession {
  id: string;
  durationSec: number;
  commandsCount: number;
  avgLatencyMs: number;
  accuracy: number;
  createdAt: string;
}

interface TranscriptItem {
  sender: 'user' | 'aura';
  text: string;
  timestamp: string;
}

interface WebSpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
  };
}

interface WebSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: WebSpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export default function VoiceConsolePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [projectsLoading, setProjectsLoading] = useState<boolean>(true);

  // Voice States
  const [systemState, setSystemState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [interactionMode, setInteractionMode] = useState<'push-to-talk' | 'continuous' | 'wake-word'>('push-to-talk');
  
  // Voice Controls
  const [persona, setPersona] = useState<string>('default');
  const [speed, setSpeed] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(0.8);

  // Live telemetry metrics
  const [metrics, setMetrics] = useState({
    accuracy: 98.2,
    sttLatency: 280,
    ttsLatency: 410,
    sessionLength: 0
  });

  // Telemetry logs
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState<boolean>(true);

  // Conversation transcripts
  const [transcript, setTranscript] = useState<TranscriptItem[]>([
    { sender: 'aura', text: "Voice session established. Project AURA is standing by. Speak or type your request.", timestamp: new Date().toLocaleTimeString() }
  ]);
  const [textFallbackInput, setTextFallbackInput] = useState<string>('');
  const [toastError, setToastError] = useState<string | null>(null);

  // Canvas context reference for Jarvis Visualizer
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Audio references
  const recognitionRef = useRef<any>(null);
  const isCurrentlyListening = useRef<boolean>(false);
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

  // 1. Fetch workspace scopes & session history logs
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
        console.error("Failed to load projects:", err);
      } finally {
        setProjectsLoading(false);
      }
    };

    const fetchSessions = async () => {
      setSessionsLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/voice/sessions`);
        const data = await res.json();
        if (data.success) {
          setSessions(data.data);
        }
      } catch (err) {
        console.error("Failed to load voice sessions logs:", err);
      } finally {
        setSessionsLoading(false);
      }
    };

    fetchProjects();
    fetchSessions();
  }, []);

  // Timer tracking session length
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({ ...prev, sessionLength: prev.sessionLength + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper formatting session duration
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 2. Jarvis Visualizer Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 80;

      // Draw subtle backing glowing rings
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius + 15, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(39, 39, 42, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      angle += 0.02;

      if (systemState === 'idle') {
        // zinc-purple slow pulse (breathing animation)
        const pulse = baseRadius + Math.sin(angle * 1.5) * 4;
        const grad = ctx.createRadialGradient(centerX, centerY, pulse - 30, centerX, centerY, pulse + 30);
        grad.addColorStop(0, 'rgba(99, 102, 241, 0.01)');
        grad.addColorStop(0.5, 'rgba(129, 140, 248, 0.1)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulse + 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerX, centerY, pulse, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

      } else if (systemState === 'listening') {
        // cyan active frequency wave spikes
        const pulse = baseRadius + Math.sin(angle * 3) * 2;
        ctx.beginPath();
        const segments = 100;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const noise = Math.sin(theta * 10 + angle * 10) * Math.cos(theta * 3) * 12;
          const r = pulse + (Math.random() * 2 - 1) * 2 + noise;
          const x = centerX + Math.cos(theta) * r;
          const y = centerY + Math.sin(theta) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.85)';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow

      } else if (systemState === 'thinking') {
        // swirling rotating segmented indigo arcs
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle * 2.5);
        ctx.beginPath();
        ctx.arc(0, 0, baseRadius + 5, 0, Math.PI * 0.4);
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, baseRadius + 5, Math.PI * 1.0, Math.PI * 1.4);
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();

      } else if (systemState === 'speaking') {
        // green audio waveform amplitudes
        const pulse = baseRadius;
        ctx.beginPath();
        const segments = 80;
        for (let i = 0; i <= segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          const frequency = Math.sin(theta * 6 - angle * 12) * Math.sin(theta * 2) * 14;
          const r = pulse + frequency;
          const x = centerX + Math.cos(theta) * r;
          const y = centerY + Math.sin(theta) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.9)';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(52, 211, 153, 0.45)';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [systemState]);

  // 3. Web Speech Recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition() as WebSpeechRecognition;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          isCurrentlyListening.current = true;
          setSystemState('listening');
        };

        recognition.onresult = (event: WebSpeechRecognitionEvent) => {
          const speechResult = event.results[0][0].transcript;
          if (speechResult) {
            handleVoiceCommand(speechResult);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech Recognition Error:", event.error);
          if (event.error !== 'no-speech') {
            setToastError(`Speech recognition error: ${event.error}`);
          }
          setSystemState('idle');
        };

        recognition.onend = () => {
          isCurrentlyListening.current = false;
          // Restart recognition if continuous mode is enabled and system is idle
          if (interactionMode === 'continuous' && systemState === 'listening') {
            try {
              recognition.start();
            } catch (err) {
              console.error(err);
            }
          } else if (systemState === 'listening') {
            setSystemState('idle');
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [interactionMode, systemState]);

  // Stop recognition or synthesis on mode switches
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      isCurrentlyListening.current = false;
      if (systemState === 'listening') setSystemState('idle');
    }
    stopSpeaking();
  }, [interactionMode]);

  // 4. Ingestion handlers
  const handleMicrophoneAction = () => {
    if (!activeProjectId) {
      setToastError("Please select a workspace project scope first");
      return;
    }

    if (!recognitionRef.current) {
      setToastError("Web Speech Recognition is not supported by your browser. Use text input fallback.");
      return;
    }

    if (isCurrentlyListening.current) {
      recognitionRef.current.stop();
      setSystemState('idle');
    } else {
      stopSpeaking();
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textFallbackInput.trim()) return;
    if (!activeProjectId) {
      setToastError("Please select a workspace project scope first");
      return;
    }

    stopSpeaking();
    const message = textFallbackInput.trim();
    setTextFallbackInput('');
    handleVoiceCommand(message);
  };

  // 5. Send command to backend & play response
  const handleVoiceCommand = async (command: string) => {
    // Optimistic user bubble
    setTranscript(prev => [...prev, { sender: 'user', text: command, timestamp: new Date().toLocaleTimeString() }]);
    setSystemState('thinking');

    try {
      const res = await fetch(`${BACKEND_URL}/voice/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProjectId,
          text: command,
          voice: persona,
          speed
        })
      });

      const data = await res.json();
      if (data.success) {
        const { response, metrics: returnMetrics } = data.data;

        // Update active telemetry
        setMetrics(prev => ({
          ...prev,
          accuracy: returnMetrics.accuracy,
          sttLatency: returnMetrics.sttLatencyMs,
          ttsLatency: returnMetrics.ttsLatencyMs
        }));

        // Append Aura speech reply
        setTranscript(prev => [...prev, { sender: 'aura', text: response, timestamp: new Date().toLocaleTimeString() }]);

        // Speak the reply aloud
        speakText(response);

        // Refresh session telemetry logs list
        const sessionsRes = await fetch(`${BACKEND_URL}/voice/sessions`);
        const sessionsData = await sessionsRes.json();
        if (sessionsData.success) {
          setSessions(sessionsData.data);
        }
      } else {
        setToastError(data.error || "Aura voice analyzer error");
        setSystemState('idle');
      }
    } catch (err) {
      console.error(err);
      setToastError("Network error: Failed to connect to Voice Interaction API");
      setSystemState('idle');
    }
  };

  // 6. Speak reply using Web Speech synthesis
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSystemState('idle');
      return;
    }

    window.speechSynthesis.cancel(); // Cancel any active audio first
    setSystemState('speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = volume;
    utterance.rate = speed;

    // Resolve matching synthesis voices if configured
    if (window.speechSynthesis.getVoices) {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Choose voice matching profile
        if (persona === 'creative') {
          utterance.voice = voices.find(v => v.name.includes('Google') || v.lang.startsWith('en')) || voices[0];
        } else {
          utterance.voice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        }
      }
    }

    utterance.onend = () => {
      setSystemState('idle');
      // If continuous mode, start listening again
      if (interactionMode === 'continuous' && recognitionRef.current && !isCurrentlyListening.current) {
        try {
          recognitionRef.current.start();
        } catch (err) {
          console.error(err);
        }
      }
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis Error:", e);
      setSystemState('idle');
    };

    ttsUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (systemState === 'speaking') {
      setSystemState('idle');
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
      
      {/* Toast Warning */}
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

        {/* Interaction Modes */}
        <div className="flex-1 flex flex-col pt-4 border-t border-zinc-900 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Interaction Modes</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'push-to-talk', label: 'Push-to-Talk', desc: 'Spacebar / Manual Trigger' },
                { id: 'continuous', label: 'Continuous Loop', desc: 'Always Listening' },
                { id: 'wake-word', label: 'Wake Word', desc: 'Triggers on phrase "AURA"' }
              ].map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setInteractionMode(mode.id as any)}
                  className={`w-full text-left p-3 border rounded-xl transition-all duration-200 ${
                    interactionMode === mode.id
                      ? 'bg-indigo-950/20 border-indigo-500/70 text-white font-medium shadow-md shadow-indigo-950/25'
                      : 'bg-zinc-900/10 border-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-850'
                  }`}
                >
                  <p className="text-[10px] font-bold">{mode.label}</p>
                  <p className="text-[8px] text-zinc-500 mt-0.5">{mode.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Personalities */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Voice Configurations</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-semibold text-zinc-650 uppercase tracking-wider mb-1.5">AURA Persona Profile</label>
                <select
                  value={persona}
                  onChange={e => setPersona(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-2 text-[10px] text-zinc-300 focus:outline-none focus:border-zinc-700"
                >
                  <option value="default">Jarvis (Professional Default)</option>
                  <option value="developer">Developer (Technical Focus)</option>
                  <option value="creative">Creative (Expressive/Animated)</option>
                  <option value="executive">Executive (Concise/Brief)</option>
                </select>
              </div>

              {/* Sliders */}
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[9px] font-semibold text-zinc-650 uppercase tracking-wider mb-1.5">
                    <span>Speech Speed</span>
                    <span className="text-zinc-400 font-mono">{speed.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={speed}
                    onChange={e => setSpeed(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[9px] font-semibold text-zinc-650 uppercase tracking-wider mb-1.5">
                    <span>Synthesizer Volume</span>
                    <span className="text-zinc-400 font-mono">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Visualizer and Telemetry Dashboard */}
      <main className="flex-1 flex flex-col bg-black overflow-hidden relative">
        
        {/* Header */}
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-8 bg-zinc-950/40 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Jarvis Voice Console
            </h1>
            <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-full font-medium font-mono">
              /api/v1/voice
            </span>
          </div>

          <div className="text-xs text-zinc-500 font-mono flex items-center gap-2">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${systemState !== 'idle' ? 'bg-indigo-500 animate-ping' : 'bg-zinc-700'}`}></span>
            State: <span className="uppercase text-zinc-300 font-semibold">{systemState}</span>
          </div>
        </header>

        {/* Console Workspace Splitting */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Visualizer Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-950/20 overflow-y-auto space-y-8">
            
            {/* Visualizer canvas */}
            <div className="relative h-64 w-64 rounded-full border border-zinc-900/60 bg-zinc-900/10 flex items-center justify-center shadow-2xl backdrop-blur-md">
              <canvas
                ref={canvasRef}
                width={250}
                height={250}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
              
              {/* Central Trigger Action Button */}
              <button
                type="button"
                onClick={handleMicrophoneAction}
                className={`h-28 w-28 rounded-full border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 group shadow-lg z-10 ${
                  systemState === 'listening'
                    ? 'bg-cyan-950/40 border-cyan-500/80 shadow-cyan-950/50 scale-105'
                    : systemState === 'thinking'
                    ? 'bg-indigo-950/30 border-indigo-500/80 cursor-wait'
                    : systemState === 'speaking'
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-emerald-950/50 scale-95'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-750 hover:bg-zinc-900/80 hover:scale-105 active:scale-95'
                }`}
              >
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {systemState === 'listening' ? '🎙️' : systemState === 'thinking' ? '🧠' : systemState === 'speaking' ? '🔊' : '🎙️'}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400 transition-colors">
                  {systemState === 'listening' ? 'Stop' : systemState === 'thinking' ? 'Thinking' : systemState === 'speaking' ? 'Mute' : 'Speak'}
                </span>
              </button>
            </div>

            {/* Instruction description help */}
            <div className="text-center space-y-1.5 max-w-sm">
              <p className="text-[10px] text-zinc-400 font-semibold">
                {interactionMode === 'push-to-talk' 
                  ? 'Manual Mode: Click the center microphone to talk' 
                  : interactionMode === 'continuous' 
                  ? 'Continuous: Always listening. Take pauses to interact' 
                  : 'Wake Word: Speak "AURA" out loud to trigger listening'}
              </p>
              <p className="text-[9px] text-zinc-650 leading-relaxed">
                Try command samples: <strong className="text-indigo-400/80">"Summarize my day"</strong>, <strong className="text-indigo-400/80">"Open VS Code"</strong>, or <strong className="text-indigo-400/80">"Research Anthropic"</strong>.
              </p>
            </div>

            {/* Text Fallback Interaction Input */}
            <form onSubmit={handleTextSubmit} className="w-full max-w-md flex gap-2 pt-4 border-t border-zinc-900/60">
              <input
                type="text"
                value={textFallbackInput}
                onChange={e => setTextFallbackInput(e.target.value)}
                placeholder="Type spoken commands fallback (e.g. hello)..."
                className="flex-1 bg-zinc-900/40 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-zinc-300 placeholder-zinc-750 focus:outline-none focus:border-zinc-700"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 px-4 rounded-xl text-xs font-bold text-white transition-colors"
              >
                Send
              </button>
            </form>
          </div>

          {/* 3. Right Sidebar split: Transcript & Telemetry */}
          <aside className="w-96 border-l border-zinc-900 flex flex-col bg-zinc-950/35 overflow-hidden shrink-0">
            
            {/* Split Pane Tabs */}
            <div className="flex flex-col flex-1 min-h-0">
              
              {/* Tab 1: Live transcript bubble feed */}
              <div className="flex-1 flex flex-col min-h-0 border-b border-zinc-900">
                <div className="h-10 border-b border-zinc-900/80 px-4 flex items-center justify-between bg-zinc-950/50 shrink-0">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Live Transcript Stream</span>
                  {systemState === 'speaking' && (
                    <button
                      type="button"
                      onClick={stopSpeaking}
                      className="text-[8px] bg-red-950/80 border border-red-900 text-red-300 hover:bg-red-900 hover:text-white px-2 py-0.5 rounded transition-all font-semibold uppercase"
                    >
                      ⏹️ Interrupt Audio
                    </button>
                  )}
                </div>

                {/* Transcript bubble viewport */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 select-text">
                  {transcript.map((item, index) => (
                    <div
                      key={index}
                      className={`flex flex-col max-w-[85%] rounded-2xl p-3 border leading-relaxed text-[10px] ${
                        item.sender === 'user'
                          ? 'bg-zinc-900/85 border-zinc-800 text-zinc-300 self-end rounded-tr-none'
                          : 'bg-indigo-950/10 border-indigo-900/30 text-indigo-200 self-start rounded-tl-none'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[8px] text-zinc-500 font-mono mb-1.5 select-none">
                        <span className="font-bold uppercase tracking-wider">{item.sender === 'user' ? '🎤 You' : '🤖 AURA'}</span>
                        <span>{item.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tab 2: Telemetry Performance Matrix */}
              <div className="h-64 flex flex-col bg-zinc-950/60 shrink-0 min-h-0">
                <div className="h-9 border-b border-zinc-900/80 px-4 flex items-center bg-zinc-950/90 shrink-0">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Telemetry & Stats</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Gauge grids */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-2.5 text-center">
                      <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">STT Latency</p>
                      <p className="text-xs font-bold font-mono text-zinc-200 mt-1">{metrics.sttLatency}ms</p>
                    </div>
                    <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-2.5 text-center">
                      <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">TTS Latency</p>
                      <p className="text-xs font-bold font-mono text-zinc-200 mt-1">{metrics.ttsLatency}ms</p>
                    </div>
                    <div className="border border-zinc-900 bg-zinc-900/10 rounded-xl p-2.5 text-center">
                      <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Accuracy</p>
                      <p className="text-xs font-bold font-mono text-emerald-400 mt-1">{metrics.accuracy.toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* Sessions table logs */}
                  <div className="space-y-1.5">
                    <span className="block text-[8px] font-bold text-zinc-500 uppercase tracking-wider">Historical Sessions Logs</span>
                    {sessionsLoading ? (
                      <div className="h-20 bg-zinc-900/20 border border-zinc-900/50 rounded-xl animate-pulse"></div>
                    ) : (
                      <div className="border border-zinc-900/80 rounded-xl overflow-hidden">
                        <table className="w-full text-[9px] font-mono text-zinc-400">
                          <thead>
                            <tr className="border-b border-zinc-900 bg-zinc-950/80 text-zinc-550 text-left">
                              <th className="py-1.5 px-2.5">Session ID</th>
                              <th className="py-1.5 px-2.5 text-center">Length</th>
                              <th className="py-1.5 px-2.5 text-center">Cmds</th>
                              <th className="py-1.5 px-2.5 text-right">Avg Lat</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sessions.map((sess, idx) => (
                              <tr key={idx} className="border-b border-zinc-900/40 hover:bg-zinc-900/10 last:border-b-0">
                                <td className="py-1.5 px-2.5 text-zinc-300 font-semibold">{sess.id}</td>
                                <td className="py-1.5 px-2.5 text-center">{formatDuration(sess.durationSec)}</td>
                                <td className="py-1.5 px-2.5 text-center">{sess.commandsCount}</td>
                                <td className="py-1.5 px-2.5 text-right font-bold text-indigo-400">{sess.avgLatencyMs}ms</td>
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
