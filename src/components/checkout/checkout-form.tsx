"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { placeOrder, type CheckoutState } from "@/app/actions/checkout";
import { formatPrice } from "@/lib/utils";

const SPEEDS = [
  { value: "standard", label: "FREE Standard Shipping", note: "Arrives in 5 days", cents: 0 },
  { value: "expedited", label: "Expedited Shipping", note: "Arrives in 2 days", cents: 599 },
  { value: "sameday", label: "Same-Day Delivery", note: "Arrives today", cents: 1299 },
];

/**
 * The summary panel — and the button that places the order — render *inside* this
 * form.
 *
 * They used to sit outside it and submit by `form="checkout-form"`, with the button
 * disabling itself on click. Disabling a submitter synchronously in its own click
 * handler cancels the submission in every browser, so the button greyed out and
 * nothing happened. Inside the form, `useFormStatus` reports real pending state and
 * the disable happens after submission has already started.
 */
export function CheckoutForm({
  review,
  summary,
}: {
  review: React.ReactNode;
  summary: React.ReactNode;
}) {
  const [state, formAction] = useActionState<CheckoutState, FormData>(placeOrder, {});

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        {state.error && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded border border-danger bg-danger/5 p-3 text-sm text-danger"
          >
            <strong className="block font-bold">Your order was not placed</strong>
            {state.error}
          </div>
        )}

        <Section step={1} title="Shipping address">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name" name="name" autoComplete="name" placeholder="Jane Chen" />
            <Field
              label="Phone number"
              name="phone"
              autoComplete="tel"
              required={false}
              placeholder="Optional"
            />
            <div className="sm:col-span-2">
              <Field
                label="Address"
                name="address"
                autoComplete="street-address"
                placeholder="Street address, apartment, suite"
              />
            </div>
            <Field label="City" name="city" autoComplete="address-level2" placeholder="City" />
            <Field label="ZIP" name="zip" autoComplete="postal-code" placeholder="ZIP code" />
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
                <input type="radio" name="speed" value={s.value} defaultChecked={i === 0} className="mt-1" />
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
            No card is charged, stored, or sent anywhere. The number is checked for
            shape only and then discarded. Any test card works, for example
            4242&nbsp;4242&nbsp;4242&nbsp;4242.
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field
                label="Card number"
                name="card"
                autoComplete="off"
                inputMode="numeric"
                placeholder="Enter a test card number"
              />
            </div>
            <Field label="Expires" name="exp" autoComplete="off" required={false} placeholder="MM/YY" />
            <Field label="CVV" name="cvv" autoComplete="off" required={false} placeholder="CVV" />
          </div>
        </Section>

        {review}
      </div>

      <aside className="h-fit rounded border border-line bg-surface p-5 lg:sticky lg:top-6">
        <PlaceOrderButton />
        {summary}
      </aside>
    </form>
  );
}

function PlaceOrderButton() {
  const { pending } = useFormStatus();
  return (
    <>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full border border-cta-border bg-cta py-2 text-sm hover:bg-cta-hover disabled:opacity-60"
      >
        {pending ? "Placing your order…" : "Place your order"}
      </button>
      <p aria-live="polite" className="mt-2 text-xs text-muted">
        {pending
          ? "Contacting the (simulated) payment processor…"
          : "By placing your order you agree to nothing at all — this is a rebuild."}
      </p>
    </>
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
  autoComplete,
  required = true,
  inputMode,
  placeholder,
}: {
  label: string;
  name: string;
  autoComplete?: string;
  required?: boolean;
  inputMode?: "numeric";
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-bold">{label}</span>
      <input
        name={name}
        autoComplete={autoComplete}
        required={required}
        inputMode={inputMode}
        placeholder={placeholder}
        className="mt-1 w-full rounded border border-line px-2 py-1.5 text-sm focus:border-accent"
      />
    </label>
  );
}
