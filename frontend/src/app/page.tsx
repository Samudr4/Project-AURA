import Image from "next/image";
import Link from "next/link";
import ApiKeyWidget from "../components/ApiKeyWidget";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-start min-h-screen bg-black text-white p-8 sm:p-16">
      <header className="flex flex-col items-center sm:items-start gap-4 w-full max-w-5xl mb-12 border-b border-zinc-800/80 pb-6">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-50 via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
          Project AURA
        </h1>
        <p className="text-zinc-400 text-sm">
          Personal AI Operating System Workspace
        </p>
      </header>

      <main className="flex flex-col w-full max-w-5xl gap-8 items-start">
        <section className="w-full flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="flex-1 space-y-4 max-w-lg">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
              Welcome back, Samudra
            </h2>
            <p className="text-zinc-400 leading-relaxed text-sm">
              Your personal orchestrator is running. Use the console panel on the right to configure model integrations. Aura will automatically auto-switch tasks to your active providers.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/chat"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors px-6 font-medium text-white shadow-lg shadow-indigo-900/20"
              >
                Launch Chat Workspace
              </Link>
              <Link
                href="/memory"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all px-6 font-medium text-zinc-300 hover:text-white shadow-lg"
              >
                Manage Memory Console
              </Link>
              <Link
                href="/knowledge"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all px-6 font-medium text-zinc-300 hover:text-white shadow-lg"
              >
                Manage Knowledge Base
              </Link>
              <Link
                href="/agents"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all px-6 font-medium text-zinc-300 hover:text-white shadow-lg"
              >
                Manage AI Agents
              </Link>
              <Link
                href="/research"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all px-6 font-medium text-zinc-300 hover:text-white shadow-lg"
              >
                Launch Research Console
              </Link>
              <Link
                href="/vision"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all px-6 font-medium text-zinc-300 hover:text-white shadow-lg"
              >
                Launch Vision Console
              </Link>
              <Link
                href="/voice"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all px-6 font-medium text-zinc-300 hover:text-white shadow-lg"
              >
                Launch Voice Console
              </Link>
              <Link
                href="/computer"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all px-6 font-medium text-zinc-300 hover:text-white shadow-lg"
              >
                Launch Computer Console
              </Link>
              <Link
                href="/analytics"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all px-6 font-medium text-zinc-300 hover:text-white shadow-lg"
              >
                View Analytics & Cost
              </Link>
              <Link
                href="/automation"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all px-6 font-medium text-zinc-300 hover:text-white shadow-lg"
              >
                Configure Automations
              </Link>
              <Link
                href="/settings"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all px-6 font-medium text-zinc-350 hover:text-white shadow-lg"
              >
                Configure Settings
              </Link>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <ApiKeyWidget />
          </div>
        </section>
      </main>
    </div>
  );
}
