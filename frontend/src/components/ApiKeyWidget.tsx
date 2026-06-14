"use client";

import React, { useState, useEffect } from 'react';

interface KeysStatus {
  openai: boolean;
  anthropic: boolean;
  google: boolean;
}

export default function ApiKeyWidget() {
  const [status, setStatus] = useState<KeysStatus>({ openai: false, anthropic: false, google: false });
  const [keys, setKeys] = useState({ openai: '', anthropic: '', google: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/settings/keys`;

  const fetchStatus = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (data.success) {
        setStatus(data.data);
      }
    } catch (err) {
      console.error("Failed to load API keys status", err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSave = async (provider: 'openai' | 'anthropic' | 'google') => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key: keys[provider] })
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Successfully saved ${provider.toUpperCase()} API key!`);
        setKeys(prev => ({ ...prev, [provider]: '' }));
        fetchStatus();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage("Failed to save key. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl shadow-xl max-w-xl w-full transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          API Key Integration Console
        </h2>
        <span className="text-xs bg-indigo-900/40 text-indigo-300 px-3 py-1 rounded-full border border-indigo-800/40 font-semibold tracking-wider uppercase">
          Auto-Switchable
        </span>
      </div>

      {message && (
        <div className={`p-3 mb-4 rounded-xl text-sm border ${
          message.startsWith('Error') 
            ? 'bg-red-950/40 border-red-900/40 text-red-300' 
            : 'bg-emerald-950/40 border-emerald-900/40 text-emerald-300'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-5">
        {/* OpenAI Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-300 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${status.openai ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-gray-600'}`}></span>
              OpenAI API (GPT-5)
            </span>
            <span className="text-xs text-gray-500">{status.openai ? 'Configured' : 'Missing Key'}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder={status.openai ? "••••••••••••••••" : "Enter OpenAI key"}
              value={keys.openai}
              onChange={e => setKeys(prev => ({ ...prev, openai: e.target.value }))}
              className="flex-1 bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={() => handleSave('openai')}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2 text-sm transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Anthropic Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-300 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${status.anthropic ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-gray-600'}`}></span>
              Anthropic API (Claude)
            </span>
            <span className="text-xs text-gray-500">{status.anthropic ? 'Configured' : 'Missing Key'}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder={status.anthropic ? "••••••••••••••••" : "Enter Anthropic key"}
              value={keys.anthropic}
              onChange={e => setKeys(prev => ({ ...prev, anthropic: e.target.value }))}
              className="flex-1 bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={() => handleSave('anthropic')}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2 text-sm transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Google Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-300 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${status.google ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-gray-600'}`}></span>
              Google Gemini API
            </span>
            <span className="text-xs text-gray-500">{status.google ? 'Configured' : 'Missing Key'}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder={status.google ? "••••••••••••••••" : "Enter Gemini key"}
              value={keys.google}
              onChange={e => setKeys(prev => ({ ...prev, google: e.target.value }))}
              className="flex-1 bg-gray-950/60 border border-gray-800 rounded-xl px-4 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button
              onClick={() => handleSave('google')}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl px-4 py-2 text-sm transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
      <p className="mt-5 text-[11px] text-gray-500 leading-relaxed">
        * Provide any subset of API keys. The routing engine automatically falls back to available models.
      </p>
    </div>
  );
}
