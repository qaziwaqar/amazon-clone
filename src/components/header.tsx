import Link from "next/link";
import { getCartCount } from "@/lib/cart";
import { getUser } from "@/lib/auth";
import { getDeliveryLocation } from "@/lib/location";
import { getDict } from "@/lib/i18n/server";
import { Logo } from "./logo";
import { SearchBar } from "./search-bar";
import { DepartmentNav } from "./department-nav";
import { LocationDialog } from "./location-dialog";
import { LocalePicker } from "./locale-picker";
import { CartIcon } from "./icons";

export async function Header({ query }: { query?: string }) {
  const [cartCount, user, location, dict] = await Promise.all([
    getCartCount(),
    getUser(),
    getDeliveryLocation(),
    getDict(),
  ]);

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-squid text-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-1 px-2 py-1.5">
          <Logo />
          <LocationDialog current={location} label={dict.deliverTo} />

          <div className="mx-2 hidden flex-1 md:block">
            <SearchBar defaultQuery={query} />
          </div>

          <div className="ms-auto flex items-center md:ms-0">
            <LocalePicker />

            <Link
              href={user ? "/account" : "/signin"}
              className="rounded-sm border border-transparent px-2 py-1.5 leading-tight hover:border-white"
            >
              <span className="block max-w-32 truncate text-xs text-white/90">
                {user ? `${dict.hello}, ${user.name}` : dict.helloSignIn}
              </span>
              <span className="block text-sm font-bold">{dict.accountLists}</span>
            </Link>

            <Link
              href="/orders"
              className="hidden rounded-sm border border-transparent px-2 py-1.5 leading-tight hover:border-white sm:block"
            >
              <span className="block text-xs text-white/90">{dict.returns}</span>
              <span className="block text-sm font-bold">{dict.andOrders}</span>
            </Link>

            <Link
              href="/cart"
              className="flex items-end rounded-sm border border-transparent px-2 py-1.5 hover:border-white"
              aria-label={`${dict.cart}, ${cartCount}`}
            >
              {/*
                The count sits over the cart's top-right corner, the way the real badge
                does — not centred above the icon, which reads as a separate element
                rather than as part of it.
              */}
              <span className="relative block h-8 w-8">
                <CartIcon className="absolute bottom-0 h-6 w-8" />
                <span
                  aria-hidden
                  className="absolute end-1 top-0 min-w-4 text-center text-sm font-bold leading-none text-accent"
                >
                  {cartCount}
                </span>
              </span>
              <span className="hidden pb-0.5 text-sm font-bold sm:block">{dict.cart}</span>
            </Link>
          </div>
        </div>

        <div className="px-2 pb-2 md:hidden">
          <SearchBar defaultQuery={query} />
        </div>
      </div>

      <DepartmentNav />
    </header>
  );
}
