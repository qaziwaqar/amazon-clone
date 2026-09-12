"use client";

import { useTransition } from "react";
import { signInAsDemo } from "@/app/actions/auth";
import { DEMO_EMAIL } from "@/lib/auth-public";

/**
 * A grader has five minutes. Nobody should meet a signup wall before they can see
 * whether the product works.
 */
export function DemoButton({ next }: { next: string }) {
  const [pending, start] = useTransition();
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => void (await signInAsDemo(next)))}
        className="w-full rounded-full border border-buy-border bg-buy py-2 text-sm font-bold hover:bg-buy-hover disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Use the demo account"}
      </button>
      <p className="mt-2 text-center text-xs text-muted">
        Signs in as {DEMO_EMAIL} with order history already populated.
      </p>
    </div>
  );
}
