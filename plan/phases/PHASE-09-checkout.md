# Phase 09 — Checkout

**Status:** TODO · **Depends on:** 07, 08 · **Budget:** ~55m

## Goal

Amazon's stripped checkout: chrome removed, three stacked sections, order summary pinned.
Payment is simulated and says so.

## Exit criteria

- [ ] `/checkout` renders with header/footer stripped to logo + secure badge
- [ ] Address, delivery speed, payment as three collapsible sections with a real edit flow
- [ ] Order total recomputed server-side at placement; a tampered client total is rejected
- [ ] Placing an order writes `orders` + `order_items`, decrements stock, empties the cart
- [ ] Double-submit cannot create two orders
- [ ] Redirects to a confirmation page with the real order number

## Tasks

- [ ] Stripped checkout layout
- [ ] Address section: saved addresses, add-new form, validation, default selection
- [ ] Delivery options: standard / expedited / same-day with dates and prices computed from one helper
- [ ] Payment section: card form, Luhn check, **explicit "simulated — no charge is made" notice**
- [ ] Review panel: items, per-item delivery estimate, edit links back to cart
- [ ] Sticky order summary: subtotal, shipping, estimated tax, total
- [ ] `placeOrder` server action — revalidate prices and stock from DB, idempotency key, transaction
- [ ] Out-of-stock mid-checkout: fail gracefully, name the item, do not half-place
- [ ] `/checkout/confirmation/[orderId]` — order number, delivery estimate, continue-shopping

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
