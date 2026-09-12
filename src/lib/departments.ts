/**
 * Re-export so the nav and the catalogue can never drift apart. Two lists of
 * departments is two lists to forget to update.
 */
export { DEPARTMENTS, departmentBySlug } from "@/lib/data/catalogue";
import { DEPARTMENTS } from "@/lib/data/catalogue";

export const SEARCH_SCOPES = [
  { label: "All", value: "all" },
  ...DEPARTMENTS.map((d) => ({ label: d.name, value: d.slug })),
];
