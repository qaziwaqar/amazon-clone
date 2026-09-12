import Link from "next/link";

/**
 * Wordmark. Drawn here rather than shipping a downloaded brand asset — same visual
 * anchor, no third-party file in the repo.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Amazon, home"
      className={`shrink-0 rounded-sm border border-transparent px-2 py-1.5 hover:border-white ${className}`}
    >
      <span className="relative block">
        <span className="text-2xl font-bold leading-none tracking-tight text-white">
          amazon
          <span className="align-super text-[10px] font-normal">.com</span>
        </span>
        <svg
          viewBox="0 0 100 12"
          aria-hidden
          className="absolute -bottom-1 left-0 h-2 w-[72px] text-accent"
          fill="none"
        >
          <path
            d="M2 3c14 8 46 10 74 1"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M74 4c4-1 7-2 9-1-1 2-4 3-7 4Z" fill="currentColor" />
        </svg>
      </span>
    </Link>
  );
}
