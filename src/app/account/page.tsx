import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getOrders } from "@/lib/orders";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const metadata = { title: "Your Account" };

const CARDS = [
  {
    title: "Your Orders",
    body: "Track packages, review past purchases and buy things again.",
    href: "/orders",
    icon: "📦",
  },
  {
    title: "Your Addresses",
    body: "The delivery address used at checkout. Editable during checkout.",
    href: "/checkout",
    icon: "📍",
  },
  {
    title: "Your Cart",
    body: "Items you have added, plus anything saved for later.",
    href: "/cart",
    icon: "🛒",
  },
  {
    title: "Browse the catalogue",
    body: "600 products across eight departments, with filters and sorting.",
    href: "/s",
    icon: "🔎",
  },
];

export default async function AccountPage() {
  const user = await getUser();
  if (!user) redirect("/signin?next=/account");

  const orders = await getOrders(user.email);

  return (
    <main id="main" className="mx-auto w-full max-w-[1100px] px-4 py-6">
      <h1 className="text-2xl font-bold">Your Account</h1>
      <p className="mt-1 text-sm text-muted">
        Signed in as {user.name} ({user.email}) · {orders.length}{" "}
        {orders.length === 1 ? "order" : "orders"}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {CARDS.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="flex gap-4 rounded border border-line bg-surface p-5 hover:border-muted"
          >
            <span aria-hidden className="text-3xl">
              {card.icon}
            </span>
            <span>
              <span className="block text-base font-bold">{card.title}</span>
              <span className="block text-sm text-muted">{card.body}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-6 max-w-xs">
        <SignOutButton />
      </div>
    </main>
  );
}
