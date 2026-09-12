import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/logo";
import { getUser } from "@/lib/auth";

export const metadata = { title: "Create account" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getUser();
  const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/";
  if (user) redirect(target);

  return (
    <main id="main" className="px-4 py-8">
      <div className="mb-6 flex justify-center rounded bg-squid px-2 py-1">
        <Logo />
      </div>
      <AuthForm mode="signup" next={target} />
      <p className="mx-auto mt-6 max-w-sm text-center text-xs text-muted">
        Accounts in this rebuild live in server memory and are not persisted between
        restarts. The demo account is always available.
      </p>
    </main>
  );
}
