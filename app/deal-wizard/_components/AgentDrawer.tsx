"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AgentDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function AgentDrawer({ open, onClose }: AgentDrawerProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ maxSteps: 5 });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-[480px] flex-col border-l border-lsmc-steel/30 bg-lsmc-night shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-lsmc-steel/30 px-4 py-3">
          <Image
            src="/brand/lsmc-logo-mark-white.svg"
            alt="LSMC"
            width={20}
            height={20}
            className="opacity-80"
          />
          <span className="text-sm font-semibold text-lsmc-white">
            Deal Agent
          </span>
          <span className="rounded-full bg-lsmc-accent/10 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-lsmc-glow">
            Internal
          </span>
          <button
            onClick={onClose}
            className="ml-auto rounded p-1 text-lsmc-steel transition-colors hover:text-lsmc-mist"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-xs text-center">
                <p className="text-sm text-lsmc-mist">
                  Ask the Deal Agent for what-if analysis, comparisons, or
                  pricing scenarios.
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    "What if we do 15x instead of 30x?",
                    "Compare Ultima vs Illumina at 10K volume",
                    "How does margin look at 25% vs 40%?",
                  ].map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        const nativeInputValueSetter =
                          Object.getOwnPropertyDescriptor(
                            window.HTMLInputElement.prototype,
                            "value",
                          )?.set;
                        const inputEl =
                          document.querySelector<HTMLInputElement>(
                            "#drawer-chat-input",
                          );
                        if (inputEl && nativeInputValueSetter) {
                          nativeInputValueSetter.call(inputEl, example);
                          inputEl.dispatchEvent(
                            new Event("input", { bubbles: true }),
                          );
                        }
                      }}
                      className="block w-full rounded-lg border border-lsmc-steel/40 bg-lsmc-surface px-3 py-2 text-left text-xs text-lsmc-mist transition-colors hover:border-lsmc-accent/30 hover:text-lsmc-ice"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-xl rounded-br-md bg-lsmc-accent/15 px-3 py-2 text-xs text-lsmc-ice">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-2">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-lsmc-slate/60">
                    <Image
                      src="/brand/lsmc-logo-mark-white.svg"
                      alt=""
                      width={14}
                      height={14}
                      className="opacity-80"
                    />
                  </div>
                  <div className="chat-markdown min-w-0 max-w-[90%] text-xs">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ),
            )}

            {isLoading && (
              <div className="flex gap-2">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-lsmc-slate/60">
                  <Image
                    src="/brand/lsmc-logo-mark-white.svg"
                    alt=""
                    width={14}
                    height={14}
                    className="opacity-70"
                  />
                </div>
                <div className="flex items-center gap-1 py-2">
                  <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-lsmc-accent" />
                  <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-lsmc-accent" />
                  <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-lsmc-accent" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-lsmc-steel/30 px-4 py-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              id="drawer-chat-input"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about pricing, comparisons..."
              className="flex-1 rounded-lg border border-lsmc-steel/40 bg-lsmc-surface px-3 py-2 text-xs text-lsmc-white placeholder-lsmc-steel transition-colors focus:border-lsmc-accent/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-lsmc-accent px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-lsmc-accent-dim disabled:opacity-40"
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5"
              >
                <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.288Z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
