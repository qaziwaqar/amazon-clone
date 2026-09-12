# Phase 10 — Orders and account

**Status:** DONE · **Depends on:** 09 · **Budget:** ~40m

## Goal

Post-purchase surface. Closes the loop so the demo has an actual ending.

## Exit criteria

- [x] `/orders` lists the signed-in user's orders, newest first
- [x] Order detail shows items, addresses, payment summary, and a delivery progress state
- [x] A user can never read another user's order (checked by `user_id`, not by obscurity)
- [x] Demo account arrives with seeded history, so the page is never empty

## Tasks

- [x] `/orders` — order cards: date, total, ship-to, order number, item thumbnails
- [x] Filter by time range, search within orders
- [x] `/orders/[id]` — full detail, tracking stepper (Ordered → Shipped → Out for delivery → Delivered), derived from order date
- [x] Buy-again action that re-adds the line items to the cart
- [x] `/account` hub — the Amazon card grid: orders, addresses, sign-in & security
- [x] Address book CRUD with a default-address rule
- [x] Authorisation check on every order read; 404 rather than 403 on someone else's id

## Verify

```bash
# manual: sign in as demo -> /orders populated, open one, stepper reflects order age
# manual: change the id in the URL to another user's order -> 404
```

## Not this phase

Returns and refunds, invoices/PDFs, cancellation, real carrier tracking.
