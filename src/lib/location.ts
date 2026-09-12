import { cookies } from "next/headers";

export const LOCATION_COOKIE = "deliver_to";

export type DeliveryLocation = { label: string; zip: string };

export const DEFAULT_LOCATION: DeliveryLocation = { label: "Seattle", zip: "98109" };

export async function getDeliveryLocation(): Promise<DeliveryLocation> {
  const store = await cookies();
  const raw = store.get(LOCATION_COOKIE)?.value;
  if (!raw) return DEFAULT_LOCATION;
  try {
    const parsed = JSON.parse(raw) as Partial<DeliveryLocation>;
    if (!parsed.label) return DEFAULT_LOCATION;
    return { label: String(parsed.label).slice(0, 40), zip: String(parsed.zip ?? "").slice(0, 12) };
  } catch {
    return DEFAULT_LOCATION;
  }
}
