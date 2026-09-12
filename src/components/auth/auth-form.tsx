"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, signUp, type AuthState } from "@/app/actions/auth";
import { DemoButton } from "./demo-button";

export function AuthForm({ mode, next }: { mode: "signin" | "signup"; next: string }) {
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="rounded-lg border border-line bg-surface p-5">
        <h1 className="text-2xl">{mode === "signin" ? "Sign in" : "Create account"}</h1>

        {state.error && (
          <div
            role="alert"
            className="mt-3 rounded border border-danger bg-danger/5 p-3 text-sm text-danger"
          >
            <strong className="block font-bold">There was a problem</strong>
            {state.error}
          </div>
        )}

        <form action={formAction} className="mt-4 space-y-3">
          <input type="hidden" name="next" value={next} />

          {mode === "signup" && (
            <Field label="Your name" name="name" type="text" autoComplete="name" required />
          )}
          <Field label="Email" name="email" type="email" autoComplete="email" required />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            hint={mode === "signup" ? "At least 8 characters" : undefined}
          />

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full border border-cta-border bg-cta py-1.5 text-sm hover:bg-cta-hover disabled:opacity-60"
          >
            {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create your account"}
          </button>
        </form>
      </div>

      {mode === "signin" ? (
        <>
          <div className="my-4 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            In a hurry?
            <span className="h-px flex-1 bg-line" />
          </div>
          <DemoButton next={next} />
          <p className="mt-4 text-center text-xs text-muted">New to Amazon?</p>
          <Link
            href={`/signup?next=${encodeURIComponent(next)}`}
            className="mt-2 block rounded-full border border-line bg-surface-sunken py-1.5 text-center text-sm hover:bg-line/40"
          >
            Create your Amazon account
          </Link>
        </>
      ) : (
        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link
            href={`/signin?next=${encodeURIComponent(next)}`}
            className="text-link hover:text-link-hover hover:underline"
          >
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  required,
  hint,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-bold">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="mt-1 w-full rounded border border-line px-2 py-1.5 text-sm focus:border-accent"
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
