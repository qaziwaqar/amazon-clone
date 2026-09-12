export function PrimeBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${className}`}>
      <span className="relative font-bold italic text-[#00a8e1]">
        prime
        <svg viewBox="0 0 60 10" aria-hidden className="absolute -bottom-1 left-0 h-1.5 w-full text-[#ff9900]" fill="none">
          <path d="M2 4c10 5 30 6 46 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </span>
    </span>
  );
}
