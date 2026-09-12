import Link from "next/link";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  body,
  actionHref = "/",
  actionLabel = "Continue shopping",
  children,
}: {
  title: string;
  body?: string;
  actionHref?: string;
  actionLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded bg-surface px-6 py-12 text-center">
      <h2 className="text-xl font-bold">{title}</h2>
      {body ? <p className="mx-auto mt-2 max-w-md text-sm text-muted">{body}</p> : null}
      {children}
      <Link
        href={actionHref}
        className="mt-6 inline-block rounded-full border border-cta-border bg-cta px-6 py-2 text-sm hover:bg-cta-hover"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
