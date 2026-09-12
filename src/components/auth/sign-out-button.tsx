"use client";

import { useTransition } from "react";
import { signOut } from "@/app/actions/auth";

export function SignOutButton({ className = "" }: { className?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => void (await signOut()))}
      className={`w-full rounded-full border border-line bg-surface-sunken py-1.5 text-sm hover:bg-line/40 disabled:opacity-60 ${className}`}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
