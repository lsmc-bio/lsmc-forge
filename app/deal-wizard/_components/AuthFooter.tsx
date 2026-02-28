"use client";

import { useSession } from "next-auth/react";

export default function AuthFooter() {
  const { data: session } = useSession();

  return (
    <footer className="flex shrink-0 items-center justify-between border-t border-lsmc-steel/30 bg-lsmc-surface/50 px-6 py-1.5">
      <span className="text-[10px] tracking-wide text-lsmc-steel">
        Confidential &mdash; LSMC 2026
      </span>
      {session?.user?.email && (
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] text-lsmc-mist">
            {session.user.email}
          </span>
        </div>
      )}
    </footer>
  );
}
