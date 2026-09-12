/**
 * Database client.
 *
 * Intentionally a stub until Phase 02, which is blocked on a Neon DATABASE_URL.
 * It throws loudly rather than returning undefined, so a premature import fails
 * at the call site with a readable message instead of somewhere three frames down.
 */
export function getDb(): never {
  throw new Error(
    "Database is not wired yet. Phase 02 (plan/phases/PHASE-02-data.md) sets up " +
      "Drizzle against Neon and replaces this stub. Blocked on DATABASE_URL.",
  );
}
