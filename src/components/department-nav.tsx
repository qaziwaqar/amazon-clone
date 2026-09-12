import Link from "next/link";
import { DEPARTMENTS } from "@/lib/departments";
import { getUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n/server";
import { NavDrawer } from "./nav-drawer";

export async function DepartmentNav() {
  const [user, dict] = await Promise.all([getUser(), getDict()]);

  // Shortcuts only. The departments used to be appended here too, which overflowed the
  // strip and left the last one clipped at the viewport edge — they live in the All
  // drawer instead, where the full list is readable at any width.
  //
  // Amazon's strip also carries Prime Video, Registry and Sell; those are on the cut
  // list, so they are absent rather than present and dead.
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

      </div>
    </nav>
  );
}
