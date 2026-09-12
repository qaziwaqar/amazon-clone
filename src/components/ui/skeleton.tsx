import { cn } from "@/lib/utils";

/**
 * Skeletons must match the final layout's box, not just be grey rectangles —
 * a skeleton that is the wrong size causes the layout shift it was meant to prevent.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-line/60", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded bg-surface p-4">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
      <Skeleton className="mt-3 h-5 w-24" />
    </div>
  );
}
