import Link from "next/link";
import { DEPARTMENTS } from "@/lib/departments";
import { getUser } from "@/lib/auth";
import { NavDrawer } from "./nav-drawer";

export async function DepartmentNav() {
  const user = await getUser();

  return (
    <nav aria-label="Departments" className="bg-nav text-white">
      <div className="no-scrollbar mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto px-2 py-1 text-sm">
        <NavDrawer departments={DEPARTMENTS} userName={user?.name} />
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
