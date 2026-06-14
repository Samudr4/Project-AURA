"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
}

interface Detection {
  label: string;
  confidence: number;
  x: number; // percentage from left
  y: number; // percentage from top
  w: number; // width percentage
  h: number; // height percentage
}

interface VisionResult {
  imageName: string;
  analysis: string;
  detections: Detection[];
  ocrText: string[];
}

// Embedded clean SVGs representing preset images to make testing instantaneous & look stunning
const PRESET_IMAGES = [
  {
    id: 'dashboard',
    name: 'Aura Analytics Dashboard.svg',
    svg: `<svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="400" rx="16" fill="#09090b" stroke="#1d1d21" stroke-width="2"/>
      <rect x="25" y="25" width="220" height="35" rx="8" fill="#18181b" stroke="#27272a"/>
      <text x="40" y="47" fill="#f4f4f5" font-family="system-ui, sans-serif" font-size="11" font-weight="700" letter-spacing="0.05em">AURA WORKSPACE INTERFACE</text>
      <rect x="360" y="25" width="215" height="35" rx="8" fill="#18181b" stroke="#27272a"/>
      <text x="375" y="47" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="10" font-weight="500">System Analytics: Token Allocation</text>
      <rect x="25" y="80" width="310" height="200" rx="12" fill="#141416" stroke="#27272a"/>
      <path d="M45 240 L100 160 L160 190 L220 110 L280 150 L315 100" stroke="#6366f1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M45 240 L100 160 L160 190 L220 110 L280 150 L315 100 V 260 H 45 Z" fill="url(#chart-glow)" opacity="0.1"/>
      <circle cx="315" cy="100" r="5" fill="#818cf8"/>
      <rect x="360" y="80" width="215" height="200" rx="12" fill="#141416" stroke="#27272a"/>
      <text x="380" y="115" fill="#f4f4f5" font-family="system-ui, sans-serif" font-size="12" font-weight="700">Active Keys Status</text>
      <rect x="380" y="135" width="175" height="25" rx="6" fill="#1f1f23" stroke="#27272a"/>
      <text x="395" y="151" fill="#34d399" font-family="system-ui, sans-serif" font-size="9" font-weight="600">● OpenAI Key: Active</text>
      <rect x="380" y="170" width="175" height="25" rx="6" fill="#1f1f23" stroke="#27272a"/>
      <text x="395" y="186" fill="#34d399" font-family="system-ui, sans-serif" font-size="9" font-weight="600">● Anthropic Key: Active</text>
      <rect x="380" y="205" width="175" height="25" rx="6" fill="#1f1f23" stroke="#27272a"/>
      <text x="395" y="221" fill="#34d399" font-family="system-ui, sans-serif" font-size="9" font-weight="600">● Google Key: Active</text>
      <rect x="25" y="300" width="150" height="35" rx="8" fill="#4f46e5"/>
      <text x="48" y="321" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="700">Commit Memory</text>
      <defs>
        <linearGradient id="chart-glow" x1="180" y1="100" x2="180" y2="260" gradientUnits="userSpaceOnUse">
          <stop stop-color="#6366f1"/>
          <stop offset="1" stop-color="#6366f1" stop-opacity="0"/>
        </linearGradient>
      </defs>
    </svg>`
  },
  {
    id: 'database',
    name: 'Database Schema Relations.svg',
    svg: `<svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="400" rx="16" fill="#09090b" stroke="#1d1d21" stroke-width="2"/>
      <rect x="25" y="25" width="220" height="35" rx="8" fill="#18181b" stroke="#27272a"/>
      <text x="40" y="47" fill="#f4f4f5" font-family="system-ui, sans-serif" font-size="11" font-weight="700" letter-spacing="0.05em">AURA WORKSPACE INTERFACE</text>
      <rect x="360" y="25" width="215" height="35" rx="8" fill="#18181b" stroke="#27272a"/>
      <text x="375" y="47" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="10" font-weight="500">System Analytics: Token Allocation</text>
      <rect x="25" y="80" width="160" height="150" rx="10" fill="#141416" stroke="#4f46e5" stroke-width="1.5"/>
      <rect x="25" y="80" width="160" height="30" rx="10" fill="#1e1e24"/>
      <text x="35" y="100" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="700">User Table</text>
      <text x="35" y="130" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="9">id : String (PK)</text>
      <text x="35" y="155" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="9">email : String</text>
      <text x="35" y="180" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="9">createdAt : DateTime</text>
      <rect x="415" y="80" width="160" height="150" rx="10" fill="#141416" stroke="#27272a"/>
      <rect x="415" y="80" width="160" height="30" rx="10" fill="#1c1c1f"/>
      <text x="425" y="100" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="700">Project Table</text>
      <text x="425" y="130" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="9">id : String (PK)</text>
      <text x="425" y="155" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="9">userId : String (FK)</text>
      <text x="425" y="180" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="9">name : String</text>
      <path d="M185 142.5 H 415" stroke="#4f46e5" stroke-dasharray="4 4" stroke-width="1.5"/>
      <circle cx="185" cy="142.5" r="3" fill="#4f46e5"/>
      <polygon points="415,142.5 407,138 407,147" fill="#4f46e5"/>
      <rect x="25" y="300" width="150" height="35" rx="8" fill="#4f46e5"/>
      <text x="48" y="321" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="700">Commit Memory</text>
    </svg>`
  },
  {
    id: 'mobile',
    name: 'Mobile Core Interface.svg',
    svg: `<svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="400" rx="16" fill="#09090b" stroke="#1d1d21" stroke-width="2"/>
      <rect x="25" y="25" width="220" height="35" rx="8" fill="#18181b" stroke="#27272a"/>
      <text x="40" y="47" fill="#f4f4f5" font-family="system-ui, sans-serif" font-size="11" font-weight="700" letter-spacing="0.05em">AURA WORKSPACE INTERFACE</text>
      <rect x="360" y="25" width="215" height="35" rx="8" fill="#18181b" stroke="#27272a"/>
      <text x="375" y="47" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="10" font-weight="500">System Analytics: Token Allocation</text>
      <rect x="220" y="80" width="160" height="210" rx="20" fill="#141416" stroke="#27272a" stroke-width="2"/>
      <rect x="240" y="120" width="120" height="25" rx="6" fill="#1c1c1f" stroke="#27272a"/>
      <text x="250" y="136" fill="#71717a" font-family="system-ui, sans-serif" font-size="8">Phone Number</text>
      <rect x="240" y="155" width="120" height="25" rx="6" fill="#1c1c1f" stroke="#27272a"/>
      <text x="250" y="171" fill="#71717a" font-family="system-ui, sans-serif" font-size="8">OTP Code</text>
      <rect x="240" y="200" width="120" height="25" rx="8" fill="#6366f1"/>
      <text x="280" y="216" fill="#ffffff" font-family="system-ui, sans-serif" font-size="9" font-weight="700">Verify OTP</text>
      <rect x="25" y="300" width="150" height="35" rx="8" fill="#4f46e5"/>
      <text x="48" y="321" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="700">Commit Memory</text>
    </svg>`
  }
];

function getSvgDataUrl(svgString: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

export default function VisionPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [projectsLoading, setProjectsLoading] = useState<boolean>(true);

  // Uploaded or Selected Image State
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageName, setImageName] = useState<string>('');
  
  // Interaction/Analysis State
  const [loading, setLoading] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [result, setResult] = useState<VisionResult | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'report' | 'ocr'>('report');

  // Highlight overlays on hover state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

  // Fetch projects list
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
        console.error("Failed to load workspace scopes:", err);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Set default preset image on mount
  useEffect(() => {
    const defaultPreset = PRESET_IMAGES[0];
    setImageSrc(getSvgDataUrl(defaultPreset.svg));
    setImageName(defaultPreset.name);
  }, []);

  // Drag and drop events
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setToastError("Please upload an image file (PNG, JPG, SVG)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
        setImageName(file.name);
        setResult(null); // Clear previous results on new load
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Run image multimodal analyzer
  const handleAnalyze = async () => {
    if (!activeProjectId) {
      setToastError("Please select a workspace project first");
      return;
    }
    if (!imageSrc) {
      setToastError("Please upload or select an image to analyze");
      return;
    }

    setLoading(true);
    setResult(null);
    setToastError(null);
    setProgressMsg("Encoding image stream into memory...");

    const progressTimers = [
      setTimeout(() => setProgressMsg("Invoking Multimodal LLM Vision Model..."), 700),
      setTimeout(() => setProgressMsg("Running object bounding box coordinate scaling..."), 1400),
      setTimeout(() => setProgressMsg("Running OCR text detection modules..."), 2000),
    ];

    try {
      // Extract the raw base64 data without data:image/xxx;base64,
      const rawBase64 = imageSrc.startsWith('data:') ? imageSrc.split(',')[1] : '';

      const res = await fetch(`${BACKEND_URL}/vision/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProjectId,
          imageName,
          imageType: imageName.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
          imageBase64: rawBase64
        })
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setToastError(data.error || "Multimodal vision analysis failed");
      }
    } catch (err) {
      console.error(err);
      setToastError("Network error: Failed to connect to vision analyzer endpoint");
    } finally {
      progressTimers.forEach(clearTimeout);
      setLoading(false);
    }
  };

  // Toast autoclear
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

        {/* Action controls & Drag Drop */}
        <div className="flex-1 flex flex-col pt-4 border-t border-zinc-900 space-y-5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Image Ingestion</h3>
          </div>

          {/* Interactive Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group ${
              isDragOver 
                ? 'border-indigo-500 bg-indigo-950/20' 
                : 'border-zinc-850 bg-zinc-900/10 hover:border-zinc-750 hover:bg-zinc-900/30'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-200 transition-colors shadow-md mb-3">
              📸
            </div>
            <p className="text-[11px] font-semibold text-zinc-300">Drag image here or click</p>
            <p className="text-[9px] text-zinc-500 mt-1">PNG, JPG, SVG, WebP up to 5MB</p>
          </div>

          {/* Inline Presets Selector */}
          <div className="space-y-2.5">
            <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Select Preset Interface</span>
            <div className="grid grid-cols-1 gap-2">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setImageSrc(getSvgDataUrl(preset.svg));
                    setImageName(preset.name);
                    setResult(null);
                  }}
                  className={`w-full text-left flex items-center gap-3 border p-3 rounded-xl transition-all duration-200 group ${
                    imageName === preset.name
                      ? 'bg-zinc-900 border-zinc-700 text-white font-medium shadow-md shadow-black/45'
                      : 'bg-zinc-900/10 border-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-850'
                  }`}
                >
                  <span className="text-xs group-hover:scale-110 transition-transform">🖼️</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold truncate">{preset.name.replace('.svg', '')}</p>
                    <p className="text-[8px] text-zinc-500">Vector Template</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !imageSrc}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl py-3.5 transition-colors shadow-lg shadow-indigo-900/20 active:translate-y-px"
            >
              {loading ? "Analyzing Vision..." : "Run Multimodal Analysis"}
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Workspace & Absolute Bounding Box Canvas */}
      <main className="flex-1 flex flex-col bg-black overflow-hidden relative">
        
        {/* Header */}
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-8 bg-zinc-950/40 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              Vision & Multimodal Analysis Console
            </h1>
            <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-full font-medium font-mono">
              /api/v1/vision
            </span>
          </div>

          <div className="text-xs text-zinc-500 font-mono">
            {imageName ? `Active: ${imageName}` : 'No image loaded'}
          </div>
        </header>

        {/* Main interactive segment */}
        <div className="flex-1 flex overflow-hidden">
          
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-950/20 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center space-y-4 animate-pulse">
                <div className="h-9 w-9 border-2 border-zinc-800 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="space-y-1 text-center">
                  <p className="text-xs font-semibold text-zinc-300">Processing visual structures...</p>
                  <p className="text-[10px] text-zinc-500 font-mono">{progressMsg}</p>
                </div>
              </div>
            ) : imageSrc ? (
              <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-2xl">
                
                {/* Canvas Container with Overlays */}
                <div className="relative border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/30 shadow-2xl w-full aspect-[3/2] flex items-center justify-center group/canvas">
                  
                  {/* The actual image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt="Loaded console capture"
                    className="w-full h-full object-contain selection:bg-transparent"
                  />

                  {/* Absolute coordinate bounding boxes mappings */}
                  {result && result.detections.map((det, index) => {
                    const isHovered = hoveredIndex === index;
                    return (
                      <div
                        key={index}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={{
                          left: `${det.x}%`,
                          top: `${det.y}%`,
                          width: `${det.w}%`,
                          height: `${det.h}%`
                        }}
                        className={`absolute border transition-all duration-200 cursor-pointer flex items-start justify-start select-none ${
                          isHovered 
                            ? 'border-indigo-400 bg-indigo-500/15 ring-2 ring-indigo-500/20 z-20' 
                            : 'border-dashed border-zinc-500/50 bg-transparent z-10 hover:border-zinc-300 hover:bg-zinc-300/5'
                        }`}
                      >
                        {/* Box label and confidence score marker */}
                        <div className={`text-[8px] font-bold px-1 py-0.5 rounded-br font-mono transition-colors shadow-lg ${
                          isHovered 
                            ? 'bg-indigo-500 text-white' 
                            : 'bg-zinc-900/85 text-zinc-400 border-r border-b border-zinc-800'
                        }`}>
                          {det.label} ({det.confidence.toFixed(1)}%)
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtitle helper description */}
                <p className="text-[10px] text-zinc-500 text-center leading-normal max-w-md">
                  💡 Bounding boxes represent spatial layouts extracted by the vision analyzer. Hover coordinates or sidebar listings to locate matching element zones.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
                <span className="text-3xl">👁️</span>
                <h3 className="text-xs font-bold text-zinc-400">Vision Analysis Canvas</h3>
                <p className="text-[11px] text-zinc-600 max-w-sm">
                  Please upload an image or select an interface template from the left control bar to begin layout boundary recognition.
                </p>
              </div>
            )}
          </div>

          {/* 3. Right Panel Sidebar: Splits details */}
          <aside className="w-96 border-l border-zinc-900 flex flex-col bg-zinc-950/35 overflow-hidden shrink-0">
            
            {/* Tabs */}
            <div className="flex border-b border-zinc-900 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('report')}
                className={`flex-1 py-3.5 text-center text-xs font-medium border-b-2 transition-all ${
                  activeTab === 'report'
                    ? 'border-indigo-500 text-white bg-zinc-950/60 font-semibold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300 bg-transparent'
                }`}
              >
                Vision Analysis
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ocr')}
                className={`flex-1 py-3.5 text-center text-xs font-medium border-b-2 transition-all ${
                  activeTab === 'ocr'
                    ? 'border-indigo-500 text-white bg-zinc-950/60 font-semibold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300 bg-transparent'
                }`}
              >
                Detections & OCR
              </button>
            </div>

            {/* Scrollable details area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {!result ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <span className="text-zinc-650 text-xl mb-2">📊</span>
                  <p className="text-[10px] text-zinc-500">Wait for multimodal analysis to view structural compositions, bounding layouts, and extracted text lines.</p>
                </div>
              ) : activeTab === 'report' ? (
                <div className="border border-zinc-900/60 rounded-xl p-5 bg-zinc-900/10 backdrop-blur-sm">
                  <MarkdownRenderer content={result.analysis} />
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Bounding Box List */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Layout Coordinate Coordinates</h4>
                    <div className="space-y-2">
                      {result.detections.map((det, index) => {
                        const isHovered = hoveredIndex === index;
                        return (
                          <div
                            key={index}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className={`border rounded-xl p-3 transition-all duration-200 flex flex-col gap-1.5 ${
                              isHovered 
                                ? 'bg-indigo-950/20 border-indigo-500/80 shadow-md' 
                                : 'bg-zinc-900/20 border-zinc-900 hover:border-zinc-800'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-semibold text-zinc-200">{det.label}</span>
                              <span className="text-[9px] bg-zinc-900 px-1.5 py-0.5 border border-zinc-850 rounded text-zinc-400 font-mono">
                                {det.confidence.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex gap-3 text-[9px] text-zinc-500 font-mono">
                              <span>Left: {det.x}%</span>
                              <span>Top: {det.y}%</span>
                              <span>W: {det.w}%</span>
                              <span>H: {det.h}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* OCR extracted items list */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">OCR Extracted Text Lines</h4>
                    <div className="bg-zinc-900/10 border border-zinc-900/70 rounded-xl overflow-hidden">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="border-b border-zinc-900 bg-zinc-950/50 text-zinc-500 text-left font-semibold">
                            <th className="py-2.5 px-3 w-10">#</th>
                            <th className="py-2.5 px-3">Captured Line Segment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.ocrText.map((text, idx) => (
                            <tr key={idx} className="border-b border-zinc-900/40 hover:bg-zinc-900/10 text-zinc-400 last:border-b-0">
                              <td className="py-2.5 px-3 font-mono text-zinc-600">{idx + 1}</td>
                              <td className="py-2.5 px-3 font-mono italic text-indigo-300">{text}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}

// Light Custom Markdown Component
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div className="space-y-3.5">
      {lines.map((line, idx) => {
        if (line.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-xs font-bold text-zinc-100 mt-5 mb-2 border-b border-zinc-900 pb-1.5 tracking-wide uppercase">
              {line.replace('## ', '')}
            </h2>
          );
        }
        if (line.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-[11px] font-bold text-zinc-200 mt-4 mb-1.5 flex items-center gap-1.5">
              {line.replace('### ', '')}
            </h3>
          );
        }
        if (line.startsWith('* **') && line.includes(':**')) {
          const match = line.match(/^\*\s+\*\*(.*?)\*\*(.*)$/);
          if (match) {
            return (
              <p key={idx} className="text-[10px] text-zinc-400 pl-3.5 border-l border-zinc-800 py-0.5 leading-relaxed">
                <strong className="text-indigo-400 font-semibold">{match[1]}</strong>
                {match[2]}
              </p>
            );
          }
        }
        if (line.startsWith('* ')) {
          return (
            <li key={idx} className="text-[10px] text-zinc-400 list-disc list-inside pl-1.5 leading-relaxed">
              {line.replace('* ', '')}
            </li>
          );
        }
        if (line.match(/^\d+\.\s+/)) {
          const match = line.match(/^(\d+\.)\s+(.*)$/);
          if (match) {
            return (
              <div key={idx} className="text-[10px] text-zinc-400 pl-3 py-0.5 flex gap-2 leading-relaxed">
                <span className="text-zinc-650 font-mono">{match[1]}</span>
                <span>{match[2]}</span>
              </div>
            );
          }
        }
        if (line.trim() === '') {
          return null;
        }

        // Bold and italic styling replacement
        let formattedLine: React.ReactNode = line;
        if (line.includes('**') || line.includes('*')) {
          const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
          formattedLine = parts.map((part, pidx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pidx} className="text-zinc-300 font-semibold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={pidx} className="text-zinc-400 italic">{part.slice(1, -1)}</em>;
            }
            return part;
          });
        }

        return (
          <p key={idx} className="text-[10px] text-zinc-400 leading-relaxed">
            {formattedLine}
          </p>
        );
      })}
    </div>
  );
}
