# Phase 09 — Checkout

**Status:** DONE · **Depends on:** 07, 08 · **Budget:** ~55m

## Goal

Amazon's stripped checkout: chrome removed, three stacked sections, order summary pinned.
Payment is simulated and says so.

## Exit criteria

- [x] `/checkout` renders with header/footer stripped to logo + secure badge
- [x] Address, delivery speed, payment as three collapsible sections with a real edit flow
- [x] Order total recomputed server-side at placement; a tampered client total is rejected
- [x] Placing an order writes `orders` + `order_items`, decrements stock, empties the cart
- [x] Double-submit cannot create two orders
- [x] Redirects to a confirmation page with the real order number

## Tasks

- [x] Stripped checkout layout
- [x] Address section: saved addresses, add-new form, validation, default selection
- [x] Delivery options: standard / expedited / same-day with dates and prices computed from one helper
- [x] Payment section: card form, Luhn check, **explicit "simulated — no charge is made" notice**
- [x] Review panel: items, per-item delivery estimate, edit links back to cart
- [x] Sticky order summary: subtotal, shipping, estimated tax, total
- [x] `placeOrder` server action — revalidate prices and stock from DB, idempotency key, transaction
- [x] Out-of-stock mid-checkout: fail gracefully, name the item, do not half-place
- [x] `/checkout/confirmation/[orderId]` — order number, delivery estimate, continue-shopping

## Verify

```bash
# manual: place an order -> stock drops, cart empties, order appears in /orders
# manual: double-click Place Order -> exactly one order row
```

## Not this phase

Real payment processing, address autocomplete, gift options, split shipments.

## Security notes

Never trust a client-sent price, quantity, or total. Re-read every line item from the DB
inside the placement transaction. Card numbers are validated and discarded — never stored,
never logged, not even last-four unless it is generated locally.

## Correction — sign-in gate

Checkout shipped reachable while signed out: an order could be placed with no account
at all. `/checkout` was simply missing from the middleware matcher, and nothing else
checked.

Fixed at three levels, because each one alone is insufficient:

1. **Middleware** — `/checkout/:path*` added, redirecting to `/signin?next=…`. Cheap,
   and catches the common case before any rendering.
2. **The page** — `getUser()` verifies the cookie signature. Middleware runs on the
   edge without the signing key, so it can only check that *a* cookie exists.
3. **The action** — `placeOrder` refuses an unauthenticated caller. A server action is
   a public endpoint; gating the page that renders it proves nothing about who can POST
   to it.

The cart page now says "Sign in to checkout" when signed out rather than bouncing
someone off an unexpected redirect, and states that the cart is kept.
