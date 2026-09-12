import Link from "next/link";
import { getDict } from "@/lib/i18n/server";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/auth-public";

export const metadata = { title: "Customer Service" };

const TOPICS = [
  {
    q: "Is this the real Amazon?",
    a: "No. It is an independent rebuild of amazon.com, built as an assignment. It is not affiliated with Amazon, and no real orders, payments or deliveries happen here.",
  },
  {
    q: "Will I be charged for anything?",
    a: "No. Checkout simulates authorisation. The card number you type is checked for shape, never stored, never transmitted, and discarded immediately. Any Luhn-valid test number works, for example 4242 4242 4242 4242.",
  },
  {
    q: "Do I need an account to browse?",
    a: "No. Browsing, search and the cart are open to everyone. Placing an order requires an account, as on the real site. Your cart is kept while you sign in.",
  },
  {
    q: "I do not want to create an account.",
    a: `Use the demo account — there is a one-click button on the sign-in page, or sign in with ${DEMO_EMAIL} and ${DEMO_PASSWORD}. It comes with order history already populated.`,
  },
  {
    q: "Where do the products come from?",
    a: "The catalogue is generated: 600 products across nine departments, built from per-department vocabularies. Photography is keyword-matched stock imagery, not real product shots. Reviews are generated with a realistic rating distribution.",
  },
  {
    q: "Can I return something or cancel an order?",
    a: "Returns, refunds and cancellation are not built. Since nothing is charged and nothing ships, there is nothing to return — building a returns flow would be a simulation of a simulation.",
  },
  {
    q: "How do I change language or currency?",
    a: "Use the flag control in the header. Language changes the interface immediately and Arabic switches the page to right-to-left. Currency reprices the whole catalogue using fixed demo rates, not live market rates.",
  },
  {
    q: "What happens to my location data?",
    a: "The delivery picker asks the browser for your position only when you press the button. Coordinates are turned into a place name in your browser, and only that name and postal code are stored in a cookie. Latitude and longitude never reach the server.",
  },
];

export default async function HelpPage() {
  const dict = await getDict();

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="rounded bg-surface p-5">
        <h1 className="text-2xl font-bold">{dict.customerService}</h1>
        <p className="mt-1 text-sm text-muted">
          Straight answers about what this site is and what it does.
        </p>
      </div>

      <dl className="mt-4 space-y-3">
        {TOPICS.map((topic) => (
          <div key={topic.q} className="rounded bg-surface p-5">
            <dt className="text-base font-bold">{topic.q}</dt>
            <dd className="mt-1 text-sm text-muted">{topic.a}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 rounded bg-surface p-5">
        <h2 className="text-base font-bold">Still stuck?</h2>
        <p className="mt-1 text-sm text-muted">
          There is no support queue behind this page — it would be a form that emails
          nobody. The source is the documentation instead.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href="/orders" className="text-link hover:text-link-hover hover:underline">
            {dict.yourOrders}
          </Link>
          <Link href="/help#top" className="text-link hover:text-link-hover hover:underline">
            Back to top of this page
          </Link>
          <Link href="/" className="text-link hover:text-link-hover hover:underline">
            {dict.continueShopping}
          </Link>
        </div>
      </div>
    </main>
  );
}
