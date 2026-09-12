"use client";

import { useEffect } from "react";
import { recordView } from "@/app/actions/views";

/**
 * Cookies can only be written from a server action or route handler, not during a
 * page render, so the view is recorded from an effect after paint. It is fire and
 * forget: a failure here must never affect the product page.
 */
export function TrackView({ productId }: { productId: string }) {
  useEffect(() => {
    void recordView(productId);
  }, [productId]);
  return null;
}
