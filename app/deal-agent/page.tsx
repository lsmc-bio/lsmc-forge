"use client";

import { useChat } from "@ai-sdk/react";
import Link from "next/link";

export default function DealAgent() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();

  return (
    <main className="mx-auto flex h-screen max-w-3xl flex-col px-6 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          &larr; Forge
        </Link>
        <h1 className="text-2xl font-bold text-white">Deal Agent</h1>
        <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs text-blue-400">
          Internal
        </span>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-zinc-400">
                Describe a deal scenario to get started.
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                &quot;Enterprise pharma, 10K samples, SR 30x WGS, CLIA, full
                logistics&quot;
              </p>
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-lg px-4 py-3 ${
              m.role === "user"
                ? "ml-12 bg-blue-500/10 text-zinc-200"
                : "mr-12 bg-zinc-800/50 text-zinc-300"
            }`}
          >
            <p className="mb-1 text-xs font-medium text-zinc-500">
              {m.role === "user" ? "You" : "Agent"}
            </p>
            <div className="whitespace-pre-wrap text-sm">{m.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="mr-12 rounded-lg bg-zinc-800/50 px-4 py-3">
            <p className="text-sm text-zinc-500">Thinking...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 pt-4">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Describe a deal..."
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </main>
  );
}
