# Phase 05 — Search and facets

**Status:** DONE · **Depends on:** 02, 03 · **Budget:** ~75m

## Goal

The highest-traffic surface on Amazon and the one most clones fake. Real Postgres
full-text, real facet counts, real URL state.

## Exit criteria

- [x] `/s?k=...` returns relevance-ranked results from `search_vector`
- [x] Facets — department, price bracket, brand, rating, Prime — narrow results and show live counts
- [x] All filter state lives in the URL; a pasted link reproduces the exact view
- [x] Typo tolerance: "wirless headphone" still returns headphones
- [x] Zero-result state suggests corrections instead of dead-ending

## Tasks

- [x] `/s` route with `searchParams` → typed query object, validated, defaults applied
- [x] Ranked query: `ts_rank_cd` primary, trigram similarity fallback when FTS returns nothing
- [x] Facet sidebar, sticky on desktop, bottom sheet on mobile
- [x] Facet counts via a single grouped query — **not** N queries per facet value
- [x] Sort: featured / price asc / price desc / rating / newest
- [x] Pagination, server-side, with correct `rel=prev/next`
- [x] Result header: "1-24 of 312 results for **X**", query echoed safely
- [x] Zero-results: "did you mean", trigram-nearest terms, popular departments
- [x] Search suggestions dropdown in the header, debounced 150ms, keyboard navigable

## Verify

```bash
curl -s "$LIVE_URL/s?k=wirless+headphone" | grep -ci headphone   # > 0
# manual: apply 3 facets, copy URL, open in a private window — identical results
```

## Not this phase

Saved searches, search history, voice search.

## Notes

Facet counts are where this phase goes over budget. One grouped aggregate query, computed
alongside the result page, not a query per checkbox. If it starts sprawling, ship
department + price + rating and defer brand.
