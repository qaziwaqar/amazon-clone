"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side digest only; the message itself may contain internals.
    console.error("Route error", error.digest);
  }, [error]);

  return (
    <main id="main" className="mx-auto w-full max-w-2xl px-4 py-16">
      <div className="rounded bg-surface px-6 py-12 text-center">
        <h1 className="text-xl font-bold">Something went wrong on our end</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          This one is on us, not on you. Try again — if it keeps happening, the
          department pages are still reachable from the nav above.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full border border-cta-border bg-cta px-6 py-2 text-sm hover:bg-cta-hover"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
