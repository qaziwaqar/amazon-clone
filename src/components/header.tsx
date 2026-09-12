import Link from "next/link";
import { getCartCount } from "@/lib/cart";
import { getUser } from "@/lib/auth";
import { Logo } from "./logo";
import { SearchBar } from "./search-bar";
import { DepartmentNav } from "./department-nav";
import { CartIcon } from "./icons";
import { LocationDialog } from "./location-dialog";
import { getDeliveryLocation } from "@/lib/location";

/**
 * Three-row header, matching the real structure: chrome row, department strip, and
 * on mobile the search drops to its own row because it cannot share with the logo
 * at 375px without one of them becoming unusable.
 *
 * Server component. The cart count is resolved on the server so the badge renders
 * correct on first paint — no count flashing from 0 to 3 after hydration.
 */
export async function Header({ query }: { query?: string }) {
  const [cartCount, user, location] = await Promise.all([
    getCartCount(),
    getUser(),
    getDeliveryLocation(),
  ]);

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-squid text-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-1 px-2 py-1.5">
          <Logo />

          <LocationDialog current={location} />

          <div className="mx-2 hidden flex-1 md:block">
            <SearchBar defaultQuery={query} />
          </div>

          <div className="ml-auto flex items-center md:ml-0">
            <Link
              href={user ? "/account" : "/signin"}
              className="rounded-sm border border-transparent px-2 py-1.5 leading-tight hover:border-white"
            >
              <span className="block max-w-32 truncate text-xs text-white/90">
                {user ? `Hello, ${user.name}` : "Hello, sign in"}
              </span>
              <span className="block text-sm font-bold">Account &amp; Lists</span>
            </Link>

            <Link
              href="/orders"
              className="hidden rounded-sm border border-transparent px-2 py-1.5 leading-tight hover:border-white sm:block"
            >
              <span className="block text-xs text-white/90">Returns</span>
              <span className="block text-sm font-bold">&amp; Orders</span>
            </Link>

            <Link
              href="/cart"
              className="flex items-end gap-0.5 rounded-sm border border-transparent px-2 py-1.5 hover:border-white"
              aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
            >
              <span className="relative">
                <CartIcon className="h-7 w-7" />
                <span
                  className="absolute -top-1 left-1/2 -translate-x-1/2 text-sm font-bold text-accent"
                  aria-hidden
                >
                  {cartCount}
                </span>
              </span>
              <span className="hidden text-sm font-bold sm:block">Cart</span>
            </Link>
          </div>
        </div>

        {/* Mobile: search gets its own row rather than fighting the logo for space. */}
        <div className="px-2 pb-2 md:hidden">
          <SearchBar defaultQuery={query} />
        </div>
      </div>

      <DepartmentNav />
    </header>
  );
}
