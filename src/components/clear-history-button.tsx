"use client";

import { useTransition } from "react";
import { clearBrowsingHistory } from "@/app/actions/views-clear";

export function ClearHistoryButton({ label }: { label: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => void (await clearBrowsingHistory()))}
      className="rounded-full border border-line bg-surface-sunken px-4 py-1.5 text-sm hover:bg-line/40 disabled:opacity-60"
    >
      {pending ? "Removing…" : label}
    </button>
  );
}
