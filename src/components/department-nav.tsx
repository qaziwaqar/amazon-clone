import Link from "next/link";
import { DEPARTMENTS } from "@/lib/departments";
import { MenuIcon } from "./icons";

export function DepartmentNav() {
  return (
    <nav aria-label="Departments" className="bg-nav text-white">
      <div className="no-scrollbar mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto px-2 py-1 text-sm">
        <button
          type="button"
          className="flex shrink-0 items-center gap-1 rounded-sm border border-transparent px-2 py-1 font-bold hover:border-white"
        >
          <MenuIcon className="h-4 w-4" />
          All
        </button>
        {DEPARTMENTS.map((d) => (
          <Link
            key={d.slug}
            href={`/s?i=${d.slug}`}
            className="shrink-0 rounded-sm border border-transparent px-2 py-1 hover:border-white"
          >
            {d.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
