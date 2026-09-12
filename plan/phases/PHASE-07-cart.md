# Phase 07 — Cart

**Status:** TODO · **Depends on:** 02, 06 · **Budget:** ~55m

## Goal

DB-backed cart that works for a signed-out visitor and survives sign-in. Most clones use
`localStorage`; this is the visible differentiator and it is cheap.

## Exit criteria

- [ ] Guest can add to cart with no account, via an httpOnly `cart_token` cookie
- [ ] Cart survives a hard reload and a different tab
- [ ] On sign-in the guest cart **merges** into the user cart — quantities summed, no silent loss
- [ ] Quantity and remove update optimistically and reconcile against the server
- [ ] Subtotal is computed server-side; the client never decides the price

## Tasks

- [ ] `getOrCreateCart()` — resolves user cart by `user_id`, else guest cart by cookie token, else creates one
- [ ] Server actions: `addToCart`, `updateQty`, `removeItem`, `moveToSaved`
- [ ] `/cart` page: line items, image, title, price, stock line, qty stepper, delete, save-for-later
- [ ] Right-hand subtotal panel with free-shipping threshold progress
- [ ] Header badge wired to the real count, revalidated on mutation
- [ ] Optimistic UI via `useOptimistic`, rolling back on server error
- [ ] Empty cart state with a route back into the catalogue
- [ ] `mergeCarts(guestCartId, userId)` — summed quantities, clamped to stock, guest cart deleted after

## Verify

```bash
# manual, and this is the one to actually run:
# 1. signed out, add 2 items  2. reload  3. sign in  4. cart still has both, quantities correct
```

## Not this phase

Coupons, gift wrap, subscribe-and-save, multi-seller split shipments.

## Notes

The merge is the part that breaks. Same product in both carts must sum, not duplicate;
stock clamp applies after summing. Write that path first, not last.
