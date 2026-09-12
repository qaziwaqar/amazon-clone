"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon } from "./icons";
import { signOut } from "@/app/actions/auth";
import type { Dict } from "@/lib/i18n/dictionaries";

type Department = { name: string; slug: string };

/**
 * The "All" menu. Slide-in panel rather than a mega-menu: at 375px a mega-menu is
 * unusable, and the same panel then serves both breakpoints.
 */
export function NavDrawer({
  departments,
  userName,
  dict,
}: {
  departments: readonly Department[];
  userName?: string;
  dict: Dict;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    // Stop the page scrolling behind the panel.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex shrink-0 items-center gap-1 rounded-sm border border-transparent px-2 py-1 font-bold hover:border-white"
      >
        <MenuIcon className="h-4 w-4" />
        {dict.all}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={dict.browseDepartments}
            className="flex h-full w-[85%] max-w-sm flex-col bg-surface text-ink"
          >
            <div className="flex items-center justify-between bg-squid px-5 py-4 text-white">
              <p className="text-lg font-bold">
                {userName ? `${dict.hello}, ${userName}` : dict.helloSignIn}
              </p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu">
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2">
              <Group title={dict.shopByDepartment}>
                {departments.map((d) => (
                  <Item key={d.slug} href={`/s?i=${d.slug}`} onNavigate={() => setOpen(false)}>
                    {d.name}
                  </Item>
                ))}
              </Group>

              <Group title={dict.yourAccount}>
                <Item href="/account" onNavigate={() => setOpen(false)}>{dict.yourAccount}</Item>
                <Item href="/orders" onNavigate={() => setOpen(false)}>{dict.yourOrders}</Item>
                <Item href="/cart" onNavigate={() => setOpen(false)}>{dict.yourCart}</Item>
              </Group>

              <Group title={dict.helpSettings}>
                <Item href="/s?sort=newest" onNavigate={() => setOpen(false)}>{dict.newArrivals}</Item>
                <Item href="/s?sort=rating" onNavigate={() => setOpen(false)}>{dict.topRated}</Item>
                {userName ? (
                  <li>
                    <form action={signOut}>
                      <button
                        type="submit"
                        className="w-full px-5 py-2.5 text-left text-sm hover:bg-surface-sunken"
                      >
                        {dict.signOut}
                      </button>
                    </form>
                  </li>
                ) : (
                  <Item href="/signin" onNavigate={() => setOpen(false)}>{dict.signIn}</Item>
                )}
              </Group>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-2 last:border-0">
      <h2 className="px-5 py-2 text-base font-bold">{title}</h2>
      <ul>{children}</ul>
    </section>
  );
}

function Item({
  href,
  children,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  onNavigate: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className="block px-5 py-2.5 text-sm hover:bg-surface-sunken"
      >
        {children}
      </Link>
    </li>
  );
}
