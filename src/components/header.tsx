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
                The count sits over the basket, not over the whole glyph. The cart's
                handle hangs off the left, so centring on the icon's full width pushes
                the number left of where it belongs — hence the 56% offset. The box is
                tall enough to hold both, so nothing clips against the header edge.
              */}
              <span className="relative block h-9 w-9">
                <span
                  aria-hidden
                  className="absolute left-[56%] top-0 -translate-x-1/2 text-sm font-bold leading-none text-accent"
                >
                  {cartCount}
                </span>
                <CartIcon className="absolute bottom-0 left-0 h-6 w-9" />
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
