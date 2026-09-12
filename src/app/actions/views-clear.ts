"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { RECENTLY_VIEWED_COOKIE } from "@/lib/recently-viewed";

export async function clearBrowsingHistory() {
  const store = await cookies();
  store.delete(RECENTLY_VIEWED_COOKIE);
  revalidatePath("/", "layout");
  return { ok: true as const };
}
