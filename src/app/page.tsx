import { DEPARTMENTS } from "@/lib/data/catalogue";
import {
  getBestSellers,
  getDeals,
  getNewArrivals,
  searchProducts,
} from "@/lib/queries/products";
import { readRecentlyViewed } from "@/lib/recently-viewed";
import { HeroCarousel, type Slide } from "@/components/hero-carousel";
import { CategoryCard } from "@/components/category-card";
import { ProductRail } from "@/components/product-rail";

export const metadata = {
  title: "Amazon.com: Online Shopping for Electronics, Apparel, Computers, Books & more",
};

const SLIDE_TINT = [
  "linear-gradient(120deg,#7b2ff7,#f107a3)",
  "linear-gradient(120deg,#0f3443,#34e89e)",
  "linear-gradient(120deg,#232526,#414345)",
  "linear-gradient(120deg,#ff8008,#ffc837)",
];

function cardItems(slug: string, count = 4) {
  return getBestSellers(slug, count).map((product) => ({
    product,
    label: product.title.split(" ").slice(-2).join(" "),
  }));
}

export default async function Home() {
  const recentlyViewed = await readRecentlyViewed();
  const deals = getDeals(16);
  const newArrivals = getNewArrivals(16);
  const topBooks = searchProducts({ i: "books", sort: "rating" }).items;
  const topRated = searchProducts({ sort: "rating" }).items;

  const slides: Slide[] = DEPARTMENTS.slice(0, 4).map((d, i) => ({
    title: `${d.name}: everything for the season`,
    subtitle: d.blurb,
    href: `/s?i=${d.slug}`,
    image: getBestSellers(d.slug, 1)[0].images[0],
    tint: SLIDE_TINT[i],
  }));

  // Seeded "browsing history" on a first visit. A home page that is empty until you
  // have clicked something tells a first-time visitor nothing about the catalogue.
  const viewed = recentlyViewed.length > 0 ? recentlyViewed : topRated.slice(0, 16);

  return (
    <main id="main" className="pb-10">
      <HeroCarousel slides={slides} />

      {/* Pulled up over the hero, as on the real site. */}
      <div className="relative z-10 mx-auto -mt-24 max-w-[1500px] px-4 sm:-mt-32">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CategoryCard
            title="Get your game on"
            items={cardItems("toys-games")}
            href="/s?i=toys-games"
          />
          <CategoryCard
            title="Top categories in Kitchen appliances"
            items={cardItems("home-kitchen")}
            href="/s?i=home-kitchen"
            cta="Explore all products in Kitchen"
          />
          <CategoryCard
            title="Easy updates for elevated spaces"
            items={cardItems("beauty")}
            href="/s?i=beauty"
            cta="See more"
          />
          <CategoryCard
            title="Must-have school supplies"
            items={cardItems("books")}
            href="/s?i=books"
            cta="Shop for Back to School"
          />
        </div>

        <div className="mt-4 space-y-4">
          <ProductRail
            title={recentlyViewed.length ? "Related to items you've viewed" : "Top rated in every department"}
            products={viewed}
            href="/s?sort=rating"
          />

          <ProductRail title="Today's deals" products={deals} href="/s?sort=featured" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CategoryCard
              title="Gear up to get fit"
              items={cardItems("sports-outdoors")}
              href="/s?i=sports-outdoors"
              cta="Discover more"
            />
            <CategoryCard
              title="Elevate your Electronics"
              items={cardItems("electronics")}
              href="/s?i=electronics"
              cta="Discover more"
            />
            <CategoryCard
              title="Finds for Home"
              items={cardItems("home-kitchen", 8).slice(4)}
              href="/s?i=home-kitchen"
              cta="See more"
            />
            <CategoryCard
              title="Level up your beauty routine"
              items={cardItems("beauty", 8).slice(4)}
              href="/s?i=beauty"
              cta="Discover more"
            />
          </div>

          <ProductRail title="More items to consider" products={newArrivals} href="/s?sort=newest" />

          <ProductRail title="Books you may like" products={topBooks} href="/s?i=books" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CategoryCard
              title="Shop for your home essentials"
              items={cardItems("home-kitchen", 12).slice(8)}
              href="/s?i=home-kitchen"
              cta="Discover more in Home"
            />
            <CategoryCard
              title="Deals on top categories"
              items={deals.slice(0, 4).map((product) => ({
                product,
                label: product.department.replace("-", " & "),
              }))}
              href="/s?sort=featured"
              cta="See all deals"
            />
            <CategoryCard
              title="Level up your PC here"
              items={cardItems("computers")}
              href="/s?i=computers"
              cta="Discover more"
            />
            <CategoryCard
              title="Most-loved travel essentials"
              items={cardItems("clothing")}
              href="/s?i=clothing"
              cta="Discover more"
            />
          </div>

          <ProductRail
            title="Customers who viewed items in your browsing history also viewed"
            products={topRated.slice(0, 16)}
            variant="card"
            href="/s?sort=rating"
          />
        </div>
      </div>
    </main>
  );
}
