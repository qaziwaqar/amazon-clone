import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto w-full max-w-2xl px-4 py-16">
      <EmptyState
        title="Looking for something?"
        body="We're sorry. The web address you entered is not a functioning page on our site."
        actionLabel="Go to Amazon's home page"
      />
    </main>
  );
}
