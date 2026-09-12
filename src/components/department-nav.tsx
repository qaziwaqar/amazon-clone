import Link from "next/link";
import { DEPARTMENTS } from "@/lib/departments";
import { getUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n/server";
import { NavDrawer } from "./nav-drawer";

export async function DepartmentNav() {
  const [user, dict] = await Promise.all([getUser(), getDict()]);

  // Every entry here goes to a page that exists and does something. Amazon's strip also
  // carries Prime Video, Registry and Sell; those are on the cut list, so they are
  // absent rather than present and dead.
  const shortcuts = [
    { label: dict.todaysDeals, href: "/deals" },
    { label: dict.customerService, href: "/help" },
    { label: dict.coupons, href: "/coupons" },
    { label: dict.buyAgain, href: "/buy-again" },
    { label: dict.browsingHistory, href: "/browsing-history" },
    { label: dict.giftCards, href: "/gift-cards" },
  ];

  return (
    <nav aria-label={dict.shopByDepartment} className="bg-nav text-white">
      <div className="no-scrollbar mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto px-2 py-1 text-sm">
        <NavDrawer departments={DEPARTMENTS} userName={user?.name} dict={dict} />

        {shortcuts.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="shrink-0 rounded-sm border border-transparent px-2 py-1 hover:border-white"
          >
            {s.label}
          </Link>
        ))}

        <span aria-hidden className="mx-1 h-4 w-px shrink-0 bg-white/25" />

        {DEPARTMENTS.map((d) => (
          <Link
            key={d.slug}
            href={`/s?i=${d.slug}`}
            className="shrink-0 rounded-sm border border-transparent px-2 py-1 hover:border-white"
          >
            {d.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
