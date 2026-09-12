import type { Department, Product, Review, Variant } from "./types";
import { hash, intBetween, pick, rng } from "./rng";
import { slugify } from "@/lib/utils";

export const DEPARTMENTS: Department[] = [
  { name: "Electronics", slug: "electronics", blurb: "Headphones, cameras, audio and more" },
  { name: "Computers", slug: "computers", blurb: "Laptops, monitors, storage and peripherals" },
  { name: "Home & Kitchen", slug: "home-kitchen", blurb: "Cookware, appliances and storage" },
  { name: "Books", slug: "books", blurb: "Programming, design, fiction and reference" },
  { name: "Clothing", slug: "clothing", blurb: "Everyday basics, outerwear and footwear" },
  { name: "Sports & Outdoors", slug: "sports-outdoors", blurb: "Training gear, camping and recovery" },
  { name: "Beauty", slug: "beauty", blurb: "Skincare, haircare and tools" },
  { name: "Toys & Games", slug: "toys-games", blurb: "Building sets, board games and puzzles" },
  { name: "Gift Cards", slug: "gift-cards", blurb: "Digital gift cards in fixed denominations" },
];

type TypeSpec = {
  noun: string;
  /** loremflickr tag(s). Keyword-matched photography beats random stock by a mile. */
  img: string;
  price: [number, number];
  specs: Record<string, readonly string[]>;
  bullets: readonly string[];
  variantKind?: "color" | "size";
};

type DeptSpec = {
  brands: readonly string[];
  modifiers: readonly string[];
  types: readonly TypeSpec[];
};

const COLORS = [
  ["Midnight Black", "#1c1c1e"],
  ["Silver", "#c9ccd1"],
  ["Deep Navy", "#1f3050"],
  ["Sandstone", "#d8c3a5"],
  ["Forest", "#2f4f3a"],
  ["Crimson", "#8f2419"],
] as const;

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const CATALOGUE_SPEC: Record<string, DeptSpec> = {
  electronics: {
    brands: ["Sonex", "Aureon", "Kestrel", "Nordvik", "Pulsar Audio", "Vantage", "Lumen"],
    modifiers: ["Wireless", "Noise Cancelling", "Studio", "Pro", "Compact", "4K", "Hi-Res"],
    types: [
      {
        noun: "Over-Ear Headphones",
        img: "headphones",
        price: [5999, 39999],
        specs: {
          "Battery Life": ["30 hours", "40 hours", "50 hours"],
          Connectivity: ["Bluetooth 5.3", "Bluetooth 5.2, USB-C"],
          Weight: ["250 g", "268 g", "295 g"],
        },
        bullets: [
          "Adaptive noise cancelling that samples the room 200 times a second",
          "Multipoint pairing holds two devices at once, no menu diving",
          "Quick charge: 5 minutes of mains gives 3 hours of playback",
        ],
        variantKind: "color",
      },
      {
        noun: "Wireless Earbuds",
        img: "earbuds",
        price: [2999, 24999],
        specs: {
          "Battery Life": ["6 hours (24 with case)", "8 hours (32 with case)"],
          "Water Resistance": ["IPX4", "IPX7"],
          Drivers: ["10 mm dynamic", "12 mm dynamic"],
        },
        bullets: [
          "Case charges wirelessly or over USB-C",
          "Transparency mode passes voices through without the hiss",
          "Fits four ear tip sizes in the box",
        ],
        variantKind: "color",
      },
      {
        noun: "Smart Speaker",
        img: "speaker",
        price: [3499, 19999],
        specs: {
          Output: ["20 W", "40 W", "60 W"],
          "Room Correction": ["Automatic", "Manual EQ"],
          Inputs: ["Wi-Fi, Bluetooth", "Wi-Fi, Bluetooth, 3.5 mm"],
        },
        bullets: [
          "Tunes itself to the room on first power-on",
          "Stereo pairs with a second unit",
          "Physical microphone switch, not a software toggle",
        ],
      },
      {
        noun: "Mirrorless Camera",
        img: "camera",
        price: [49999, 189999],
        specs: {
          Sensor: ["24.2 MP APS-C", "33 MP full frame"],
          Video: ["4K/60", "6K/30 open gate"],
          Stabilisation: ["5-axis in body", "None"],
        },
        bullets: [
          "Subject tracking that holds focus on eyes through motion",
          "Dual card slots so a card failure does not end a shoot",
          "Weather sealed body",
        ],
      },
      {
        noun: "Soundbar",
        img: "soundbar",
        price: [12999, 79999],
        specs: {
          Channels: ["3.1", "5.1.2", "7.1.4"],
          Subwoofer: ["Wireless, included", "Not included"],
          HDMI: ["eARC", "eARC + 2 in"],
        },
        bullets: [
          "eARC passthrough keeps one cable to the television",
          "Night mode flattens explosions without burying dialogue",
          "Wall mount hardware in the box",
        ],
      },
    ],
  },
  computers: {
    brands: ["Meridian", "Corewave", "Anvil", "Northline", "Halcyon", "Tessera"],
    modifiers: ["Ultra", "Performance", "Portable", "Mechanical", "Ergonomic", "Dual-Band"],
    types: [
      {
        noun: "Laptop",
        img: "laptop",
        price: [54999, 249999],
        specs: {
          Processor: ["8-core, 3.4 GHz", "12-core, 4.1 GHz"],
          Memory: ["16 GB", "32 GB", "64 GB"],
          Storage: ["512 GB NVMe", "1 TB NVMe", "2 TB NVMe"],
          Display: ['14" 2560x1600 120 Hz', '16" 3456x2234 120 Hz'],
        },
        bullets: [
          "Sustained performance under load, not a 20-second burst then throttle",
          "Charges over USB-C from either side",
          "Keyboard rated for 10 million keystrokes",
        ],
        variantKind: "color",
      },
      {
        noun: "Monitor",
        img: "computer,monitor",
        price: [14999, 99999],
        specs: {
          Panel: ['27" IPS', '32" IPS', '34" ultrawide'],
          Refresh: ["60 Hz", "144 Hz", "165 Hz"],
          "Colour Gamut": ["99% sRGB", "98% DCI-P3"],
        },
        bullets: [
          "Single USB-C cable carries video, data and 90 W of charge",
          "Height, tilt, swivel and pivot all adjust without tools",
          "Factory calibrated, report included",
        ],
      },
      {
        noun: "Mechanical Keyboard",
        img: "keyboard",
        price: [6999, 24999],
        specs: {
          Switches: ["Tactile brown", "Linear red", "Clicky blue"],
          Layout: ["75%", "TKL", "Full size"],
          Connection: ["USB-C", "USB-C + Bluetooth"],
        },
        bullets: [
          "Hot-swappable sockets, no soldering to change switch feel",
          "Gasket mount takes the harshness out of bottoming out",
          "PBT keycaps that do not go shiny",
        ],
      },
      {
        noun: "Portable SSD",
        img: "harddrive",
        price: [7999, 39999],
        specs: {
          Capacity: ["1 TB", "2 TB", "4 TB"],
          Interface: ["USB 3.2 Gen 2", "Thunderbolt 4"],
          Speed: ["1050 MB/s read", "2800 MB/s read"],
        },
        bullets: [
          "Aluminium shell doubles as the heatsink, so speeds hold on long transfers",
          "Hardware encryption with no vendor software required",
          "Survives a two metre drop",
        ],
      },
    ],
  },
  "home-kitchen": {
    brands: ["Fieldstone", "Copperline", "Hearth & Oak", "Marlow", "Verdant", "Stonebrook"],
    modifiers: ["Non-Stick", "Cast Iron", "Stainless", "Programmable", "Compact", "Set of 5"],
    types: [
      {
        noun: "Pressure Cooker",
        img: "cookingpot",
        price: [6999, 19999],
        specs: {
          Capacity: ["6 qt", "8 qt"],
          Programs: ["12 preset", "16 preset"],
          Inner_Pot: ["Stainless steel", "Ceramic coated"],
        },
        bullets: [
          "Pressure, slow cook, sauté and steam in one pot",
          "Lid locks until pressure is genuinely down",
          "Inner pot is dishwasher safe",
        ],
      },
      {
        noun: "Knife Set",
        img: "kitchenknife",
        price: [4999, 29999],
        specs: {
          Pieces: ["5 piece", "8 piece", "12 piece"],
          Steel: ["German X50CrMoV15", "Japanese VG-10"],
          Handle: ["Pakkawood", "Full tang riveted"],
        },
        bullets: [
          "Taper-ground edge holds through a season of real cooking",
          "Balanced at the bolster so long prep does not tire the wrist",
          "Block stores blades edge-up to protect the bevel",
        ],
      },
      {
        noun: "Espresso Machine",
        img: "espressomachine",
        price: [19999, 89999],
        specs: {
          "Pump Pressure": ["15 bar", "9 bar rotary"],
          Boiler: ["Single", "Dual"],
          Grinder: ["Built in conical burr", "Not included"],
        },
        bullets: [
          "PID temperature control keeps shots repeatable",
          "Steam wand has enough power for real microfoam",
          "Three minute warm-up",
        ],
      },
      {
        noun: "Storage Container Set",
        img: "foodcontainer",
        price: [2499, 8999],
        specs: {
          Pieces: ["10 piece", "24 piece"],
          Material: ["Borosilicate glass", "BPA-free Tritan"],
          Seal: ["Four-latch airtight", "Snap lid"],
        },
        bullets: [
          "Lids nest with the bases so the cupboard stays sane",
          "Oven safe to 400°F without the lid",
          "Stackable in the fridge without sliding",
        ],
      },
    ],
  },
  books: {
    brands: ["O'Rowan Media", "Pragmatic Press", "Ashgrove", "Northbound Books", "Quill & Co"],
    modifiers: ["Second Edition", "Illustrated", "Annotated", "Paperback", "Hardcover"],
    types: [
      {
        noun: "Designing Data-Intensive Systems",
        img: "book",
        price: [1999, 6999],
        specs: {
          Format: ["Paperback", "Hardcover"],
          Pages: ["416 pages", "590 pages", "744 pages"],
          Language: ["English"],
        },
        bullets: [
          "Covers replication, partitioning and consensus without hand-waving",
          "Worked examples rather than diagrams of boxes",
          "Index that is actually usable",
        ],
      },
      {
        noun: "The Design of Everyday Interfaces",
        img: "book,design",
        price: [1499, 4999],
        specs: {
          Format: ["Paperback", "Hardcover"],
          Pages: ["288 pages", "352 pages"],
          Language: ["English"],
        },
        bullets: [
          "Affordances, signifiers and feedback, with real product post-mortems",
          "Chapter exercises that hold up in a design review",
          "Updated with mobile and voice interfaces",
        ],
      },
      {
        noun: "Practical Machine Learning",
        img: "book,library",
        price: [2499, 7999],
        specs: {
          Format: ["Paperback"],
          Pages: ["512 pages", "680 pages"],
          Language: ["English"],
        },
        bullets: [
          "Every chapter ends in a runnable notebook",
          "Covers evaluation and failure modes, not just training",
          "Assumes linear algebra, not a PhD",
        ],
      },
    ],
  },
  clothing: {
    brands: ["Alder & Pine", "Tidewater", "Basin", "Rowan Supply", "Camber"],
    modifiers: ["Organic Cotton", "Merino", "Water-Resistant", "Relaxed Fit", "Lightweight"],
    types: [
      {
        noun: "Crewneck T-Shirt",
        img: "tshirt",
        price: [1299, 4999],
        specs: {
          Material: ["100% organic cotton", "Cotton/modal blend"],
          Fit: ["Regular", "Relaxed"],
          Care: ["Machine wash cold"],
        },
        bullets: [
          "Pre-shrunk, so the second wash is the same size as the first",
          "Shoulder seams taped to stop them twisting",
          "Neck ribbing keeps its shape",
        ],
        variantKind: "size",
      },
      {
        noun: "Insulated Jacket",
        img: "jacket",
        price: [6999, 29999],
        specs: {
          Fill: ["650 fill down", "Synthetic PrimaLoft"],
          Shell: ["20D ripstop", "Recycled polyester"],
          Packable: ["Packs into its own pocket", "No"],
        },
        bullets: [
          "Warm at the weight, not warm for its bulk",
          "Two-way zip so it sits properly when seated",
          "DWR finish sheds a shower without a hardshell",
        ],
        variantKind: "size",
      },
      {
        noun: "Running Shoes",
        img: "sneakers",
        price: [5999, 17999],
        specs: {
          Drop: ["6 mm", "8 mm", "10 mm"],
          Weight: ["232 g", "268 g"],
          Upper: ["Engineered mesh", "Knit"],
        },
        bullets: [
          "Foam that holds its rebound past 400 miles",
          "Wide toe box without a sloppy midfoot",
          "Outsole rubber where runners actually wear through",
        ],
        variantKind: "size",
      },
    ],
  },
  "sports-outdoors": {
    brands: ["Summit Line", "Ironbark", "Trailhead", "Kettle & Co", "Basecamp"],
    modifiers: ["Adjustable", "Weighted", "All-Season", "Compact", "Heavy Duty"],
    types: [
      {
        noun: "Adjustable Dumbbell Set",
        img: "dumbbell",
        price: [14999, 59999],
        specs: {
          Range: ["5-52.5 lb per hand", "10-90 lb per hand"],
          Increment: ["2.5 lb", "5 lb"],
          Footprint: ['16" x 8"'],
        },
        bullets: [
          "Replaces fifteen pairs of fixed dumbbells in a corner of a room",
          "Dial changes weight between sets in about two seconds",
          "Handle knurling grips without shredding hands",
        ],
      },
      {
        noun: "Two-Person Tent",
        img: "tent",
        price: [9999, 44999],
        specs: {
          "Packed Weight": ["2.1 kg", "2.8 kg"],
          Season: ["3-season", "4-season"],
          Doors: ["Two doors, two vestibules"],
        },
        bullets: [
          "Pitches fly-first, so the inner stays dry in rain",
          "Colour-coded poles that make sense at dusk",
          "Taped seams from the factory",
        ],
      },
      {
        noun: "Massage Gun",
        img: "massage",
        price: [7999, 29999],
        specs: {
          Amplitude: ["12 mm", "16 mm"],
          Speeds: ["5 speeds", "6 speeds"],
          Battery: ["3 hours", "6 hours"],
        },
        bullets: [
          "Quiet enough to use while someone else is in the room",
          "Stall force high enough to matter on large muscles",
          "Four heads, including one for tendon work",
        ],
      },
    ],
  },
  beauty: {
    brands: ["Lumière Lab", "Verity", "Sable & Rose", "Nectar", "Clearfield"],
    modifiers: ["Hydrating", "Fragrance-Free", "Daily", "Brightening", "Dermatologist-Tested"],
    types: [
      {
        noun: "Vitamin C Serum",
        img: "serum,cosmetics",
        price: [1899, 8999],
        specs: {
          Concentration: ["10% L-ascorbic acid", "15% L-ascorbic acid"],
          Volume: ["30 ml", "50 ml"],
          Packaging: ["Amber glass, pump"],
        },
        bullets: [
          "Formulated at a pH that lets the acid actually absorb",
          "Ferulic acid included to slow oxidation",
          "No added fragrance",
        ],
      },
      {
        noun: "Hair Dryer",
        img: "hairdryer",
        price: [4999, 34999],
        specs: {
          Motor: ["Brushless digital", "AC motor"],
          Heat_Settings: ["3 heat, 2 speed", "4 heat, 3 speed"],
          Attachments: ["Concentrator, diffuser"],
        },
        bullets: [
          "Measures air temperature many times a second to avoid heat damage",
          "Light enough to hold through a full blow-dry",
          "Filter pops off for cleaning",
        ],
      },
      {
        noun: "Moisturiser",
        img: "skincare,cream",
        price: [1299, 5999],
        specs: {
          "Skin Type": ["All skin types", "Dry to very dry"],
          Volume: ["50 ml", "100 ml"],
          Key_Ingredients: ["Ceramides, niacinamide", "Hyaluronic acid, squalane"],
        },
        bullets: [
          "Barrier repair without an occlusive film",
          "Sits under makeup without pilling",
          "Non-comedogenic",
        ],
      },
    ],
  },
  "toys-games": {
    brands: ["Brickworks", "Tabletop Union", "Meadowlark", "Puzzlewright", "Nimbus Play"],
    modifiers: ["Award-Winning", "Family", "Strategy", "Ages 8+", "Collector's"],
    types: [
      {
        noun: "Building Set",
        img: "buildingblocks",
        price: [2999, 24999],
        specs: {
          Pieces: ["540 pieces", "1,180 pieces", "2,340 pieces"],
          Age: ["8+", "12+"],
          "Build Time": ["2 hours", "6 hours"],
        },
        bullets: [
          "Numbered bags so a long build can be stopped and resumed",
          "Instructions that show the orientation change, not just the piece",
          "Display stand and nameplate included",
        ],
      },
      {
        noun: "Strategy Board Game",
        img: "boardgame",
        price: [2499, 8999],
        specs: {
          Players: ["1-4 players", "2-5 players"],
          "Play Time": ["45-60 min", "90-120 min"],
          Age: ["10+", "14+"],
        },
        bullets: [
          "Teaches in one round, stays interesting for fifty",
          "Insert actually holds the components after the first play",
          "Solo mode that is not an afterthought",
        ],
      },
      {
        noun: "Jigsaw Puzzle",
        img: "jigsaw",
        price: [1499, 3999],
        specs: {
          Pieces: ["1000 pieces", "1500 pieces"],
          "Finished Size": ['27" x 20"', '32" x 24"'],
          Finish: ["Matte, anti-glare"],
        },
        bullets: [
          "Random cut, so no two pieces interchange by accident",
          "Thick board that does not delaminate",
          "Poster included for reference",
        ],
      },
    ],
  },
};

const REVIEW_NAMES = [
  "A. Whitfield", "Marisol P.", "D. Okonkwo", "Jen H.", "Rafael S.", "K. Lindqvist",
  "Tom B.", "Priya N.", "Gordon McRae", "Elena V.", "S. Tanaka", "Chris D.",
  "Nadia F.", "Owen R.", "Beatriz L.", "Martin K.",
];

const REVIEW_POS = [
  ["Exactly what I hoped for", "Used it daily for three weeks now. No complaints, and it replaced two other things I owned."],
  ["Worth the money", "I went back and forth on the price for a while. Having used it, I would pay it again."],
  ["Better than the one it replaced", "The old one lasted four years. This is a clear step up in build quality."],
  ["Does the job quietly", "Nothing flashy. It works, it keeps working, and it does not demand attention."],
  ["Impressed by the details", "Small things are right: the packaging, the finish, the way it stows away."],
];

const REVIEW_MID = [
  ["Good, with one caveat", "Happy overall. Setup instructions were thin and I worked out a couple of steps myself."],
  ["Solid but not exceptional", "Does what it says. I would not call it a standout, but nothing is wrong with it."],
  ["Fine for the price", "Feels built to a budget in places, which is fair at this price. Still recommend."],
];

const REVIEW_NEG = [
  ["Not for me", "Quality seems fine, it just did not fit how I actually use it. Returned without hassle."],
  ["Arrived damaged", "Product itself looks good but mine turned up with a cracked housing. Replacement is on the way."],
  ["Smaller than expected", "Read the dimensions properly, unlike me. That is on me, but worth repeating."],
];

/**
 * Catalogue imagery.
 *
 * Keyword-matched rather than random: a hair dryer listing showing a photo of a
 * building is worse than no photo at all. `lock` pins one specific image per slot, so
 * the catalogue looks identical on every machine and across deploys.
 */
function imagesFor(id: string, count: number, keyword: string, seed: number): string[] {
  return Array.from(
    { length: count },
    (_, i) =>
      `https://loremflickr.com/700/700/${keyword}?lock=${(seed + i * 7919) % 100000}`,
  );
}

function buildVariants(next: () => number, kind: "color" | "size" | undefined, id: string): Variant[] {
  if (!kind) return [];
  if (kind === "color") {
    const n = intBetween(next, 2, 4);
    return COLORS.slice(0, n).map(([label, swatch], i) => ({
      id: `${id}-c${i}`,
      label,
      kind: "color" as const,
      priceDelta: i === 0 ? 0 : intBetween(next, 0, 4) * 500,
      available: next() > 0.12,
      swatch,
    }));
  }
  const start = intBetween(next, 0, 1);
  return SIZES.slice(start, start + 5).map((label, i) => ({
    id: `${id}-s${i}`,
    label,
    kind: "size" as const,
    priceDelta: 0,
    available: next() > 0.15,
  }));
}

/**
 * Ratings are J-shaped in the real world — a pile at 5, a smaller pile at 4, a thin
 * tail, and a bump at 1 from delivery failures. A uniform distribution makes every
 * histogram in the app look obviously synthetic.
 */
function skewedRating(next: () => number): number {
  const r = next();
  if (r < 0.52) return 5;
  if (r < 0.76) return 4;
  if (r < 0.87) return 3;
  if (r < 0.93) return 2;
  return 1;
}

function buildCatalogue(): Product[] {
  const products: Product[] = [];
  let n = 0;

  for (const dept of DEPARTMENTS) {
    const spec = CATALOGUE_SPEC[dept.slug];
    // Gift cards are appended separately with fixed denominations, so they have no
    // generator spec. Any department without one is simply not generated here.
    if (!spec) continue;
    const perDept = 75;

    for (let i = 0; i < perDept; i++) {
      const id = `p${String(++n).padStart(4, "0")}`;
      const next = rng(hash(id));
      const type = spec.types[i % spec.types.length];
      const brand = pick(next, spec.brands);
      const modifier = pick(next, spec.modifiers);

      const title =
        dept.slug === "books"
          ? `${type.noun}: ${modifier}`
          : `${brand} ${modifier} ${type.noun}`;

      const [lo, hi] = type.price;
      const listPriceCents = Math.round((lo + next() * (hi - lo)) / 100) * 100 - 1;
      const discounted = next() < 0.45;
      const priceCents = discounted
        ? Math.round((listPriceCents * (1 - (0.08 + next() * 0.37))) / 100) * 100 - 1
        : listPriceCents;

      const ratings = Array.from({ length: 40 }, () => skewedRating(next));
      const rating = Number(
        (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1),
      );

      const specs: Record<string, string> = {};
      for (const [key, values] of Object.entries(type.specs)) {
        specs[key.replace(/_/g, " ")] = pick(next, values);
      }
      specs.Brand = brand;

      products.push({
        id,
        slug: `${slugify(title)}-${id}`,
        title,
        brand,
        department: dept.slug,
        priceCents,
        listPriceCents,
        rating,
        reviewCount: intBetween(next, 12, 8400),
        prime: next() > 0.22,
        stock: next() < 0.06 ? 0 : intBetween(next, 1, 240),
        images: imagesFor(id, intBetween(next, 3, 5), type.img, hash(id)),
        bullets: [...type.bullets],
        description: `${title}. ${type.bullets[0]}. Sold and shipped by ${brand}, with free returns within 30 days.`,
        specs,
        variants: buildVariants(next, type.variantKind, id),
        addedDaysAgo: intBetween(next, 0, 900),
        soldCount: intBetween(next, 40, 9000),
      });
    }
  }

  return products;
}

/**
 * Gift cards.
 *
 * Real products rather than a marketing page: they sit in the catalogue, so they are
 * searchable, addable to the cart and orderable through exactly the same path as
 * everything else. Fixed denominations, never discounted, always in stock.
 */
const GIFT_CARD_DESIGNS = [
  { name: "Birthday", keyword: "birthday,gift" },
  { name: "Thank You", keyword: "giftcard" },
  { name: "Congratulations", keyword: "celebration,gift" },
] as const;

const GIFT_CARD_VALUES = [2500, 5000, 10000, 20000];

function giftCards(): Product[] {
  const out: Product[] = [];
  let n = 0;

  for (const design of GIFT_CARD_DESIGNS) {
    for (const value of GIFT_CARD_VALUES) {
      const id = `g${String(++n).padStart(3, "0")}`;
      const next = rng(hash(id));
      const title = `Amazon Gift Card — ${design.name} — $${value / 100}`;

      out.push({
        id,
        slug: `${slugify(title)}-${id}`,
        title,
        brand: "Amazon",
        department: "gift-cards",
        priceCents: value,
        listPriceCents: value,
        rating: 4.8,
        reviewCount: intBetween(next, 400, 9000),
        prime: true,
        stock: 9999,
        images: imagesFor(id, 2, design.keyword, hash(id)),
        bullets: [
          "Delivered by email within minutes of the order being placed",
          "No expiry date and no fees",
          "Redeemable against anything in the catalogue",
        ],
        description: `An Amazon Gift Card in a ${design.name} design, worth $${value / 100}. In this rebuild no card is actually issued.`,
        specs: {
          Denomination: `$${value / 100}`,
          Design: design.name,
          Delivery: "Email",
          Expiry: "None",
          Brand: "Amazon",
        },
        variants: [],
        addedDaysAgo: 30,
        soldCount: intBetween(next, 2000, 40000),
      });
    }
  }

  return out;
}

let cached: Product[] | null = null;

/** Built once per process, then reused. Deterministic, so caching is safe. */
export function allProducts(): Product[] {
  if (!cached) cached = [...buildCatalogue(), ...giftCards()];
  return cached;
}

export function reviewsFor(product: Product): Review[] {
  const next = rng(hash(`${product.id}-reviews`));
  const count = Math.min(12, Math.max(3, Math.round(product.reviewCount / 400)));

  return Array.from({ length: count }, (_, i) => {
    const rating = skewedRating(next);
    const pool = rating >= 4 ? REVIEW_POS : rating === 3 ? REVIEW_MID : REVIEW_NEG;
    const [title, body] = pick(next, pool);
    const daysAgo = intBetween(next, 2, 700);
    return {
      id: `${product.id}-r${i}`,
      author: pick(next, REVIEW_NAMES),
      rating,
      title,
      body,
      date: new Date(Date.UTC(2026, 8, 12) - daysAgo * 86400000).toISOString().slice(0, 10),
      verified: next() > 0.18,
      helpful: intBetween(next, 0, 340),
    };
  }).sort((a, b) => b.helpful - a.helpful);
}

export function departmentBySlug(slug: string): Department | undefined {
  return DEPARTMENTS.find((d) => d.slug === slug);
}
