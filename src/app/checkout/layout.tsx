import Link from "next/link";
import { Logo } from "@/components/logo";

/**
 * Checkout strips the site chrome. Every link out of this page is a chance to lose
 * the order, so the header keeps the logo, a step label and a secure badge, nothing else.
 */
export default function CheckoutLayout({ children }: LayoutProps<"/checkout">) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-line bg-squid">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-2">
          <Logo />
          <span className="text-lg font-bold text-white">Checkout</span>
          <span className="text-xs text-white/70">🔒 Secure</span>
        </div>
      </header>

      {children}

      <footer className="mt-auto border-t border-line py-6 text-center text-xs text-muted">
        <Link href="/cart" className="text-link hover:underline">
          Back to cart
        </Link>
        <p className="mt-2">
          This is a rebuild for an assignment. No payment is processed.
        </p>
      </footer>
    </div>
  );
}
