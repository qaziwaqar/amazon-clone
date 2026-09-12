import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/logo";
import { getUser } from "@/lib/auth";

export const metadata = { title: "Sign in" };

export default async function SignInPage({
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
      <AuthForm mode="signin" next={target} />
    </main>
  );
}
