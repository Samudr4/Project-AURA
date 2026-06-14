"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ApiKeyWidget from "../../components/ApiKeyWidget";

interface SettingsData {
  theme: string;
  defaultModel: string;
  persona: string;
  preferences: {
    personaPreset?: string;
  };
}

const PERSONA_PRESETS: Record<string, string> = {
  developer: "You are an expert software engineer specializing in modular code design, performance optimization, and robust systems architecture.",
  researcher: "You are a research scientist focusing on evidence-based explanations, comparative analyses, structured citations, and deep analytical reports.",
  creative: "You are a creative writing and brainstorming partner. Emphasize storytelling, rich descriptions, novel ideas, and engaging prose.",
  executive: "You are a chief of staff. Focus on high-level executive summaries, actionable plans, prioritization frameworks, and concise business recommendations."
};

export default function SettingsPage() {
  const [defaultModel, setDefaultModel] = useState<string>('auto');
  const [personaPreset, setPersonaPreset] = useState<string>('developer');
  const [customInstructions, setCustomInstructions] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const BACKEND_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/settings`;

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(BACKEND_URL);
        const data = await res.json();
        if (data.success && data.data) {
          const settings: SettingsData = data.data;
          setDefaultModel(settings.defaultModel || 'auto');
          
          const preset = settings.preferences?.personaPreset || 'developer';
          setPersonaPreset(preset);
          
          if (preset === 'custom') {
            setCustomInstructions(settings.persona || '');
          } else {
            setCustomInstructions(PERSONA_PRESETS[preset] || '');
          }
        }
      } catch (err) {
        console.error("Failed to load settings", err);
        setErrorMsg("Failed to load settings from server");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Update instructions text area when persona presets change
  const handlePersonaChange = (preset: string) => {
    setPersonaPreset(preset);
    if (preset !== 'custom') {
      setCustomInstructions(PERSONA_PRESETS[preset] || '');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    const personaText = personaPreset === 'custom' 
      ? customInstructions 
      : PERSONA_PRESETS[personaPreset];

    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultModel,
          persona: personaText,
          preferences: {
            personaPreset
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("System configuration saved successfully!");
      } else {
        setErrorMsg(data.error || "Failed to save settings");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error: Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Clear banners
  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
        setErrorMsg('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-200 p-8 sm:p-16">
      
      {/* Success/Error Banners */}
      {successMsg && (
        <div className="fixed top-6 right-6 bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 px-5 py-3 rounded-2xl text-xs shadow-xl backdrop-blur-sm z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          ✓ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-6 right-6 bg-red-950/80 border border-red-800/80 text-red-300 px-5 py-3 rounded-2xl text-xs shadow-xl backdrop-blur-sm z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col items-start gap-4 w-full max-w-5xl mx-auto mb-10 border-b border-zinc-900 pb-6 shrink-0">
        <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 mb-2 group transition-colors">
          <span className="transition-transform group-hover:-translate-x-0.5">←</span> Back to Dashboard
        </Link>
        
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-50 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            System Configuration
          </h1>
          <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
            Aura OS Settings
          </span>
        </div>
        <p className="text-zinc-500 text-xs">
          Configure default AI routing parameters, system prompt personas, and provider API key tokens.
        </p>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="h-96 bg-zinc-950 border border-zinc-900 rounded-2xl animate-pulse"></div>
            <div className="h-96 bg-zinc-950 border border-zinc-900 rounded-2xl animate-pulse"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left Column: General Configuration */}
            <section className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-6 border-b border-zinc-900 pb-3">
                <div className="h-2 w-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
                <h2 className="text-md font-bold text-zinc-100">AI Router Parameters</h2>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* Default Model Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Default Model Preset</label>
                  <select
                    value={defaultModel}
                    onChange={e => setDefaultModel(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 transition-all cursor-pointer"
                  >
                    <option value="auto">Auto-Switching Engine (Recommended)</option>
                    <option value="gpt-5">OpenAI GPT-5</option>
                    <option value="claude-opus">Anthropic Claude Opus</option>
                    <option value="claude-sonnet">Anthropic Claude Sonnet</option>
                    <option value="claude-haiku">Anthropic Claude Haiku</option>
                    <option value="gemini-2">Google Gemini 2 Models</option>
                    <option value="gemini-3">Google Gemini 3 Models</option>
                  </select>
                  <p className="mt-2 text-[10px] text-zinc-600 leading-normal">
                    When using Auto-Switching, Aura selects the optimal model dynamically depending on the task type (e.g. GPT-5 for coding, Claude Sonnet for writing).
                  </p>
                </div>

                {/* Persona Selector */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Aura Personality Persona</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      { id: 'developer', label: 'Developer' },
                      { id: 'researcher', label: 'Researcher' },
                      { id: 'creative', label: 'Creative' },
                      { id: 'executive', label: 'Executive' },
                      { id: 'custom', label: 'Custom Instruction' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handlePersonaChange(item.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          personaPreset === item.id 
                            ? 'bg-zinc-800 border-zinc-700 text-white font-semibold' 
                            : 'bg-zinc-900/60 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Context prompt Instructions */}
                  <textarea
                    placeholder="Enter custom instructions for AURA..."
                    value={customInstructions}
                    onChange={e => {
                      if (personaPreset === 'custom') {
                        setCustomInstructions(e.target.value);
                      }
                    }}
                    disabled={personaPreset !== 'custom'}
                    rows={5}
                    className={`w-full bg-zinc-900/40 border border-zinc-850 rounded-xl px-4 py-3 text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none transition-all resize-none ${
                      personaPreset !== 'custom' ? 'opacity-50 cursor-not-allowed select-none bg-zinc-900/20' : 'focus:border-zinc-700'
                    }`}
                  />
                  <p className="mt-2 text-[10px] text-zinc-600 leading-normal">
                    System instructions frame the context and persona prompts of the assistant during conversational threads.
                  </p>
                </div>

                {/* Save button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl py-3.5 transition-colors shadow-lg shadow-indigo-900/10"
                >
                  {saving ? "Saving settings..." : "Save System Config"}
                </button>

              </form>
            </section>

            {/* Right Column: Key Consoles */}
            <section className="flex flex-col gap-8">
              <ApiKeyWidget />
            </section>

          </div>
        )}
      </main>
    </div>
  );
}
