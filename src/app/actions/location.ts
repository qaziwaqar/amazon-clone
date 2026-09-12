"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCATION_COOKIE } from "@/lib/location";

/**
 * Stores only a place name and a postal code — never coordinates. The browser resolves
 * the position and the page sends the resolved label, so the exact latitude and
 * longitude never reach this server or its logs.
 */
export async function setDeliveryLocation(label: string, zip: string) {
  const clean = {
    label: label.trim().slice(0, 40) || "Your area",
    zip: zip.trim().slice(0, 12),
  };

  const store = await cookies();
  store.set(LOCATION_COOKIE, JSON.stringify(clean), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  revalidatePath("/", "layout");
  return { ok: true as const, ...clean };
}
