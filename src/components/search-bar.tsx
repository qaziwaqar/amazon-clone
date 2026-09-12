import { SEARCH_SCOPES } from "@/lib/departments";
import { SearchIcon } from "./icons";

/**
 * Plain GET form, no JavaScript. Search works with JS disabled and on first paint
 * before hydration — on the single highest-traffic surface of the site, that matters
 * more than a fancier control. Phase 05 layers a suggestions dropdown on top.
 */
export function SearchBar({ defaultQuery = "" }: { defaultQuery?: string }) {
  return (
    <form
      action="/s"
      method="get"
      role="search"
      className="flex h-10 w-full overflow-hidden rounded-md focus-within:ring-3 focus-within:ring-accent"
    >
      <label htmlFor="search-scope" className="sr-only">
        Search in department
      </label>
      <select
        id="search-scope"
        name="i"
        defaultValue="all"
        className="hidden h-full cursor-pointer border-r border-line bg-[#e6e6e6] px-2 text-xs text-ink hover:bg-[#dadada] sm:block"
      >
        {SEARCH_SCOPES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <label htmlFor="search-input" className="sr-only">
        Search Amazon
      </label>
      <input
        id="search-input"
        name="k"
        type="search"
        defaultValue={defaultQuery}
        placeholder="Search Amazon"
        autoComplete="off"
        className="h-full min-w-0 flex-1 bg-white px-3 text-sm text-ink outline-none"
      />

      <button
        type="submit"
        aria-label="Go"
        className="grid h-full w-11 shrink-0 place-items-center bg-accent text-squid hover:bg-accent-hover"
      >
        <SearchIcon className="h-5 w-5" />
      </button>
    </form>
  );
}
