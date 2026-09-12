import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-4">
      <Skeleton className="mb-3 h-3 w-64" />
      <div className="grid gap-6 bg-surface p-5 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)_300px]">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-3">
          <Skeleton className="h-7 w-4/5" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    </main>
  );
}
