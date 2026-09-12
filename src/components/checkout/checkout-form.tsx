"use client";

import { useActionState } from "react";
import { placeOrder, type CheckoutState } from "@/app/actions/checkout";
import { formatPrice } from "@/lib/utils";

const SPEEDS = [
  { value: "standard", label: "FREE Standard Shipping", note: "Arrives in 5 days", cents: 0 },
  { value: "expedited", label: "Expedited Shipping", note: "Arrives in 2 days", cents: 599 },
  { value: "sameday", label: "Same-Day Delivery", note: "Arrives today", cents: 1299 },
];

export function CheckoutForm({ defaultName }: { defaultName: string }) {
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(
    placeOrder,
    {},
  );

  return (
    <form action={formAction} id="checkout-form" className="space-y-4">
      {state.error && (
        <div role="alert" className="rounded border border-danger bg-danger/5 p-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <Section step={1} title="Shipping address">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Full name" name="name" defaultValue={defaultName} autoComplete="name" />
          <Field label="Phone number" name="phone" autoComplete="tel" required={false} />
          <div className="sm:col-span-2">
            <Field label="Address" name="address" defaultValue="410 Terry Ave N" autoComplete="street-address" />
          </div>
          <Field label="City" name="city" defaultValue="Seattle" autoComplete="address-level2" />
          <Field label="ZIP" name="zip" defaultValue="98109" autoComplete="postal-code" />
        </div>
      </Section>

      <Section step={2} title="Delivery options">
        <fieldset className="space-y-2">
          <legend className="sr-only">Choose a delivery speed</legend>
          {SPEEDS.map((s, i) => (
            <label
              key={s.value}
              className="flex cursor-pointer items-start gap-3 rounded border border-line p-3 hover:bg-surface-sunken"
            >
              <input
                type="radio"
                name="speed"
                value={s.value}
                defaultChecked={i === 0}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-bold">
                  {s.label}
                  {s.cents > 0 && ` — ${formatPrice(s.cents)}`}
                </span>
                <span className="block text-xs text-muted">{s.note}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </Section>

      <Section step={3} title="Payment method">
        <div className="rounded border border-accent bg-accent/10 p-3 text-sm">
          <strong className="block font-bold">Payment is simulated.</strong>
          No card is charged, stored, or sent anywhere. The number is validated for
          shape only and then discarded. Use 4242 4242 4242 4242.
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              label="Card number"
              name="card"
              defaultValue="4242 4242 4242 4242"
              autoComplete="off"
              inputMode="numeric"
            />
          </div>
          <Field label="Expires" name="exp" defaultValue="12/29" autoComplete="off" required={false} />
          <Field label="CVV" name="cvv" defaultValue="123" autoComplete="off" required={false} />
        </div>
      </Section>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full border border-cta-border bg-cta py-2 text-sm hover:bg-cta-hover disabled:opacity-60 lg:hidden"
      >
        {pending ? "Placing order…" : "Place your order"}
      </button>
    </form>
  );
}

function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded border border-line bg-surface p-5">
      <h2 className="mb-3 text-lg font-bold">
        <span className="mr-2 text-muted">{step}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  defaultValue,
  autoComplete,
  required = true,
  inputMode,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  autoComplete?: string;
  required?: boolean;
  inputMode?: "numeric";
}) {
  return (
    <label className="block">
      <span className="block text-sm font-bold">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        required={required}
        inputMode={inputMode}
        className="mt-1 w-full rounded border border-line px-2 py-1.5 text-sm focus:border-accent"
      />
    </label>
  );
}
