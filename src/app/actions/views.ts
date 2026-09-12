"use server";

import { pushRecentlyViewed } from "@/lib/recently-viewed";

export async function recordView(productId: string) {
  try {
    await pushRecentlyViewed(productId);
  } catch {
    // Recently-viewed is a nicety. Never let it surface as an error on a PDP.
  }
}
