import Link from "next/link";
import type { SearchParamsShape } from "@/lib/queries/products";
import { buildUrl } from "@/lib/search-params";

export function Pagination({
  params,
  page,
  pages,
}: {
  params: SearchParamsShape;
  page: number;
  pages: number;
}) {
  if (pages <= 1) return null;

  const window = [page - 2, page - 1, page, page + 1, page + 2].filter(
    (p) => p >= 1 && p <= pages,
  );

  return (
    <nav aria-label="Pagination" className="mt-6 flex justify-center gap-2">
      <PageLink href={buildUrl(params, { page: page - 1 })} disabled={page === 1} rel="prev">
        Previous
      </PageLink>
      {window.map((p) => (
        <PageLink key={p} href={buildUrl(params, { page: p })} current={p === page}>
          {p}
        </PageLink>
      ))}
      <PageLink href={buildUrl(params, { page: page + 1 })} disabled={page === pages} rel="next">
        Next
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  children,
  current,
  disabled,
  rel,
}: {
  href: string;
  children: React.ReactNode;
  current?: boolean;
  disabled?: boolean;
  rel?: string;
}) {
  const cls = `min-w-9 rounded border px-3 py-1.5 text-center text-sm ${
    current
      ? "border-line bg-surface-sunken font-bold"
      : "border-line bg-surface hover:bg-surface-sunken"
  }`;

  if (disabled) {
    return (
      <span aria-disabled className={`${cls} cursor-not-allowed opacity-40`}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} rel={rel} aria-current={current ? "page" : undefined} className={cls}>
      {children}
    </Link>
  );
}
