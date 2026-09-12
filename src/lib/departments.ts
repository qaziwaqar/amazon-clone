/**
 * Department list. Hard-coded for the shell in Phase 03; Phase 02 seeds the same
 * slugs into `categories`, and the nav switches to reading them from the DB there.
 */
export const DEPARTMENTS = [
  { name: "Electronics", slug: "electronics" },
  { name: "Computers", slug: "computers" },
  { name: "Home & Kitchen", slug: "home-kitchen" },
  { name: "Books", slug: "books" },
  { name: "Clothing", slug: "clothing" },
  { name: "Sports & Outdoors", slug: "sports-outdoors" },
  { name: "Beauty", slug: "beauty" },
  { name: "Toys & Games", slug: "toys-games" },
] as const;

export const SEARCH_SCOPES = [
  { label: "All", value: "all" },
  ...DEPARTMENTS.map((d) => ({ label: d.name, value: d.slug })),
];
