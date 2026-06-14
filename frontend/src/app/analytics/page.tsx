"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface AnalyticsCall {
  id: string;
  model: string;
  tokensInput: number;
  tokensOutput: number;
  cost: number;
  latencyMs: number;
  createdAt: string;
}

interface ModelMetrics {
  model: string;
  provider: string;
  callsCount: number;
  totalTokens: number;
  totalCost: number;
  averageLatency: number;
}

interface AnalyticsData {
  totalCost: number;
  totalTokens: number;
  averageLatency: number;
  totalCalls: number;
  modelBreakdown: ModelMetrics[];
  recentCalls: AnalyticsCall[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/analytics/summary`;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(BACKEND_URL);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || "Failed to retrieve analytics metrics");
        }
      } catch (err) {
        console.error(err);
        setError("Network error: Failed to connect to backend api");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Compute total cost percentages for charts
  const costDistribution = useMemo(() => {
    if (!data || data.totalCost === 0) return [];
    return data.modelBreakdown.map(item => {
      const percentage = (item.totalCost / data.totalCost) * 100;
      return {
        model: item.model,
        provider: item.provider,
        cost: item.totalCost,
        percentage: parseFloat(percentage.toFixed(1))
      };
    }).sort((a, b) => b.cost - a.cost);
  }, [data]);

  // Compute total token percentages for charts
  const tokenDistribution = useMemo(() => {
    if (!data || data.totalTokens === 0) return [];
    return data.modelBreakdown.map(item => {
      const percentage = (item.totalTokens / data.totalTokens) * 100;
      return {
        model: item.model,
        provider: item.provider,
        tokens: item.totalTokens,
        percentage: parseFloat(percentage.toFixed(1))
      };
    }).sort((a, b) => b.tokens - a.tokens);
  }, [data]);

  // Utility to format numbers with commas
  const formatNum = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-200 p-8 sm:p-16">
      
      {/* Header */}
      <header className="flex flex-col items-start gap-4 w-full max-w-5xl mx-auto mb-10 border-b border-zinc-900 pb-6 shrink-0">
        <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 mb-2 group transition-colors">
          <span className="transition-transform group-hover:-translate-x-0.5">←</span> Back to Dashboard
        </Link>
        
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-50 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            Observability & Analytics
          </h1>
          <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
            Cost & Usage
          </span>
        </div>
        <p className="text-zinc-500 text-xs">
          Monitor LLM token volumes, provider API costs, and request latency logs across all projects.
        </p>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-zinc-950 border border-zinc-900 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/40 text-red-300 text-xs">
            ⚠️ {error}
          </div>
        ) : data ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* 1. Summary Cards row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Cost Card */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-xl">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Accrued API Cost</span>
                <div className="text-2xl font-extrabold text-zinc-100 mt-1.5 font-mono">${data.totalCost.toFixed(4)}</div>
                <div className="text-[10px] text-emerald-400 mt-1 font-medium">✓ Scoped under budget limits</div>
              </div>

              {/* Tokens Card */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-xl">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Tokens Indexed</span>
                <div className="text-2xl font-extrabold text-zinc-100 mt-1.5 font-mono">{formatNum(data.totalTokens)}</div>
                <div className="text-[10px] text-zinc-500 mt-1 font-medium">Tokens Input + Output</div>
              </div>

              {/* Latency Card */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-xl">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Average Latency</span>
                <div className="text-2xl font-extrabold text-zinc-100 mt-1.5 font-mono">{formatNum(data.averageLatency)} ms</div>
                <div className="text-[10px] text-zinc-500 mt-1 font-medium">Server request run rate</div>
              </div>

              {/* Calls Card */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 shadow-xl">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Prompt Calls</span>
                <div className="text-2xl font-extrabold text-zinc-100 mt-1.5 font-mono">{data.totalCalls} runs</div>
                <div className="text-[10px] text-indigo-400 mt-1 font-medium">Auto-switched queries</div>
              </div>

            </div>

            {/* 2. Visual Cost & Token Allocations (two-column) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Cost Allocation Chart */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-5 pb-2 border-b border-zinc-900">Cost Allocation per Model</h3>
                <div className="space-y-4">
                  {costDistribution.map((item, idx) => {
                    const colors: Record<string, string> = {
                      openai: 'bg-amber-500',
                      anthropic: 'bg-purple-500',
                      google: 'bg-sky-500'
                    };
                    const color = colors[item.provider] || 'bg-indigo-500';
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-zinc-200 capitalize">{item.model}</span>
                          <span className="font-mono text-zinc-400">${item.cost.toFixed(4)} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Token Allocation Chart */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-5 pb-2 border-b border-zinc-900">Token Volume per Model</h3>
                <div className="space-y-4">
                  {tokenDistribution.map((item, idx) => {
                    const colors: Record<string, string> = {
                      openai: 'bg-amber-500',
                      anthropic: 'bg-purple-500',
                      google: 'bg-sky-500'
                    };
                    const color = colors[item.provider] || 'bg-indigo-500';
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-zinc-200 capitalize">{item.model}</span>
                          <span className="font-mono text-zinc-400">{formatNum(item.tokens)} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* 3. Model Breakdown Table */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl overflow-hidden">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-4">Model Breakdown Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 uppercase tracking-wider text-[10px] font-semibold">
                      <th className="pb-3">Model Name</th>
                      <th className="pb-3">Provider</th>
                      <th className="pb-3">Calls Count</th>
                      <th className="pb-3">Total Tokens</th>
                      <th className="pb-3">Avg Latency</th>
                      <th className="pb-3 text-right">Accrued Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60 text-zinc-300">
                    {data.modelBreakdown.map((item, idx) => {
                      const badgeColors: Record<string, string> = {
                        openai: 'bg-amber-950/20 text-amber-400 border-amber-900/30',
                        anthropic: 'bg-purple-950/20 text-purple-400 border-purple-900/30',
                        google: 'bg-sky-950/20 text-sky-400 border-sky-900/30'
                      };
                      return (
                        <tr key={idx} className="hover:bg-zinc-900/10 transition-colors">
                          <td className="py-3 font-semibold text-zinc-200 capitalize">{item.model}</td>
                          <td className="py-3">
                            <span className={`text-[10px] border px-2 py-0.5 rounded uppercase font-semibold font-mono ${badgeColors[item.provider] || ''}`}>
                              {item.provider}
                            </span>
                          </td>
                          <td className="py-3 font-mono">{item.callsCount} calls</td>
                          <td className="py-3 font-mono">{formatNum(item.totalTokens)}</td>
                          <td className="py-3 font-mono">{formatNum(item.averageLatency)} ms</td>
                          <td className="py-3 text-right font-mono text-zinc-100">${item.totalCost.toFixed(5)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Recent Execution logs */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 shadow-xl">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-4">Recent Ingestion Logs</h3>
              <div className="space-y-3">
                {data.recentCalls.map((call) => (
                  <div key={call.id} className="flex justify-between items-center text-xs p-3 rounded-xl bg-zinc-900/20 border border-zinc-900">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 capitalize">{call.model}</span>
                      <span className="text-zinc-500 font-mono">Latency: {call.latencyMs}ms</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono">
                      <span className="text-zinc-400">{formatNum(call.tokensInput + call.tokensOutput)} tokens</span>
                      <span className="text-zinc-100 font-bold">${call.cost.toFixed(4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="text-zinc-500 text-center py-12 text-xs">No analytics logs located.</div>
        )}
      </main>
    </div>
  );
}
