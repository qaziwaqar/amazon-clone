/**
 * Cart read helpers.
 *
 * Phase 07 replaces this with the real DB-backed guest cart (cookie token on the
 * guest side, user_id once signed in, merged at sign-in). The header badge needs a
 * count *now* so the shell is not wired up twice, so this returns zero until then.
 */
export async function getCartCount(): Promise<number> {
  return 0;
}
