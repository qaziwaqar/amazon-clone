"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { setDeliveryLocation } from "@/app/actions/location";
import { PinIcon } from "./icons";
import type { DeliveryLocation } from "@/lib/location";

/**
 * Delivery location.
 *
 * Geolocation is opt-in behind a button press — never on load, which would trigger a
 * permission prompt before the visitor has any reason to grant it. Coordinates are
 * resolved to a place name in the browser and only that name is stored; the latitude
 * and longitude never reach the server.
 */
export function LocationDialog({
  current,
  label,
}: {
  current: DeliveryLocation;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [zip, setZip] = useState("");
  const [pending, start] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    firstFieldRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const save = (label: string, postal: string) =>
    start(async () => {
      await setDeliveryLocation(label, postal);
      setOpen(false);
      setStatus(null);
    });

  const useGps = () => {
    if (!("geolocation" in navigator)) {
      setStatus("This browser cannot share a location. Enter a ZIP code instead.");
      return;
    }
    setStatus("Asking your browser for your location…");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setStatus("Looking up your area…");
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`,
          );
          if (!res.ok) throw new Error(String(res.status));
          const data = (await res.json()) as {
            city?: string;
            locality?: string;
            principalSubdivisionCode?: string;
            postcode?: string;
          };
          const city = data.city || data.locality || "Your area";
          const region = data.principalSubdivisionCode?.split("-").pop() ?? "";
          save(region ? `${city}, ${region}` : city, data.postcode ?? "");
        } catch {
          setStatus("Could not look up that location. Enter a ZIP code instead.");
        }
      },
      (err) => {
        setStatus(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Enter a ZIP code instead."
            : "Could not read your location. Enter a ZIP code instead.",
        );
      },
      { timeout: 10000, maximumAge: 600000 },
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="hidden shrink-0 items-center gap-1 rounded-sm border border-transparent px-2 py-1.5 text-left hover:border-white lg:flex"
      >
        <PinIcon className="mt-2.5 h-4 w-4" />
        <span className="leading-tight">
          <span className="block text-xs text-white/70">{label}</span>
          <span className="block max-w-40 truncate text-sm font-bold">
            {current.label} {current.zip}
          </span>
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-title"
            className="w-full max-w-sm rounded-lg bg-surface text-ink shadow-lg"
          >
            <h2 id="location-title" className="border-b border-line px-5 py-3 text-lg font-bold">
              Choose your location
            </h2>

            <div className="px-5 py-4">
              <p className="text-sm text-muted">
                Delivery estimates and availability are shown for this location.
              </p>

              <button
                type="button"
                onClick={useGps}
                disabled={pending}
                className="mt-4 w-full rounded-full border border-cta-border bg-cta py-2 text-sm hover:bg-cta-hover disabled:opacity-60"
              >
                Use my current location
              </button>
              <p className="mt-1 text-xs text-muted">
                Your browser asks first. Only the place name is saved — never your
                coordinates.
              </p>

              {status && (
                <p role="status" className="mt-3 rounded bg-surface-sunken p-2 text-xs">
                  {status}
                </p>
              )}

              <div className="my-4 flex items-center gap-3 text-xs text-muted">
                <span className="h-px flex-1 bg-line" />
                or enter a ZIP code
                <span className="h-px flex-1 bg-line" />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (zip.trim()) save("ZIP", zip);
                }}
                className="flex gap-2"
              >
                <label className="sr-only" htmlFor="zip-input">
                  ZIP code
                </label>
                <input
                  id="zip-input"
                  ref={firstFieldRef}
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  placeholder="e.g. 10001"
                  inputMode="numeric"
                  className="min-w-0 flex-1 rounded border border-line px-2 py-1.5 text-sm"
                />
                <button
                  type="submit"
                  disabled={pending || !zip.trim()}
                  className="rounded border border-line bg-surface-sunken px-4 py-1.5 text-sm hover:bg-line/40 disabled:opacity-50"
                >
                  Apply
                </button>
              </form>
            </div>

            <div className="border-t border-line px-5 py-3 text-right">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded border border-line px-4 py-1.5 text-sm hover:bg-surface-sunken"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
