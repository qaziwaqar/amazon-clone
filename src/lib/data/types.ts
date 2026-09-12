export type Department = {
  name: string;
  slug: string;
  blurb: string;
};

export type Variant = {
  id: string;
  label: string;
  kind: "color" | "size";
  priceDelta: number;
  available: boolean;
  swatch?: string;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpful: number;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  department: string;
  priceCents: number;
  listPriceCents: number;
  rating: number;
  reviewCount: number;
  prime: boolean;
  stock: number;
  images: string[];
  bullets: string[];
  description: string;
  specs: Record<string, string>;
  variants: Variant[];
  addedDaysAgo: number;
  soldCount: number;
};

export type OrderItem = {
  productId: string;
  title: string;
  image: string;
  slug: string;
  unitPriceCents: number;
  qty: number;
  variant?: string;
};

export type Order = {
  id: string;
  placedAt: string;
  items: OrderItem[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  shipTo: string;
  addressLine: string;
  paymentLabel: string;
  speed: "standard" | "expedited" | "sameday";
};
