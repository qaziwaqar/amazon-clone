"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { limitAuthAttempt } from "@/lib/rate-limit";
import {
  authenticate,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  endSession,
  register,
  startSession,
  userExists,
} from "@/lib/auth";

export type AuthState = { error?: string };

const safeNext = (next: FormDataEntryValue | null) => {
  const value = typeof next === "string" ? next : "";
  // Only same-site paths. An open redirect here would be a real vulnerability.
  return value.startsWith("/") && !value.startsWith("//") ? value : "/";
};

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");

  if (!email || !password) return { error: "Enter your email and password." };

  // Before the hash, not after: the point is to avoid doing the expensive work.
  const limit = await limitAuthAttempt();
  if (!limit.allowed) {
    return {
      error: `Too many sign-in attempts. Try again in ${limit.retryAfterSeconds} seconds.`,
    };
  }

  const user = authenticate(email, password);
  // Deliberately generic: saying which half was wrong tells an attacker which emails exist.
  if (!user) return { error: "Your email or password is incorrect." };

  await startSession(user);
  revalidatePath("/", "layout");
  redirect(safeNext(form.get("next")));
}

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  const name = String(form.get("name") ?? "");
  const email = String(form.get("email") ?? "").toLowerCase().trim();
  const password = String(form.get("password") ?? "");

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Passwords must be at least 8 characters." };
  }
  const limit = await limitAuthAttempt();
  if (!limit.allowed) {
    return {
      error: `Too many attempts. Try again in ${limit.retryAfterSeconds} seconds.`,
    };
  }

  if (userExists(email)) {
    return { error: "An account already exists with that email address." };
  }

  const user = register(name, email, password);
  await startSession(user);
  revalidatePath("/", "layout");
  redirect(safeNext(form.get("next")));
}

export async function signInAsDemo(next = "/") {
  const limit = await limitAuthAttempt();
  if (!limit.allowed) redirect("/signin");

  const user = authenticate(DEMO_EMAIL, DEMO_PASSWORD);
  if (user) await startSession(user);
  revalidatePath("/", "layout");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function signOut() {
  await endSession();
  revalidatePath("/", "layout");
  redirect("/");
}
