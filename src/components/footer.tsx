import Link from "next/link";
import { Logo } from "./logo";
import { getDict } from "@/lib/i18n/server";

const COLUMNS = [
  {
    title: "Get to Know Us",
    links: ["Careers", "Blog", "About Amazon", "Investor Relations", "Amazon Devices"],
  },
  {
    title: "Make Money with Us",
    links: ["Sell products on Amazon", "Become an Affiliate", "Advertise Your Products", "Self-Publish with Us"],
  },
  {
    title: "Amazon Payment Products",
    links: ["Amazon Business Card", "Shop with Points", "Reload Your Balance", "Amazon Currency Converter"],
  },
  {
    title: "Let Us Help You",
    links: ["Your Account", "Your Orders", "Shipping Rates & Policies", "Returns & Replacements", "Help"],
  },
];

export async function Footer() {
  const dict = await getDict();

  return (
    <footer className="mt-auto">
      <a
        href="#main"
        className="block bg-nav-hover py-4 text-center text-sm text-white hover:bg-[#485769]"
      >
        {dict.backToTop}
      </a>

      <div className="bg-nav text-white">
        <div className="mx-auto grid max-w-[1000px] grid-cols-2 gap-8 px-6 py-10 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="mb-2 text-sm font-bold">{col.title}</h2>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    {/*
                      These are real Amazon footer links with no destination in this
                      rebuild. Rendered as non-interactive text rather than as links
                      to nowhere — a dead <a> is worse than an honest label.
                    */}
                    <span className="text-sm text-white/70">{link}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-footer py-6 text-center text-xs text-white/60">
        <Logo className="mx-auto mb-4 inline-block" />
        <p>
          A rebuild of amazon.com, built as an assignment. Not affiliated with Amazon.
        </p>
        <p className="mt-1">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          · No real payments are processed anywhere on this site.
        </p>
      </div>
    </footer>
  );
}
