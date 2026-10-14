// Topic taxonomy for CivicPing's personalized feed.
// Each topic has a slug, a display label, and match keywords. Matching is
// keyword-based against the item title (and matter name when present).
// This is intentionally transparent: the feed shows *why* an item matched.

export interface Topic {
  slug: string;
  label: string;
  keywords: string[];
}

export const TOPICS: Topic[] = [
  {
    slug: "housing",
    label: "Housing",
    keywords: [
      "housing", "affordable housing", "apartment", "rental", "rent",
      "dwelling", "residential", "homeowner", "eviction", "shelter",
    ],
  },
  {
    slug: "zoning",
    label: "Zoning & Development",
    keywords: [
      "zoning", "rezoning", "development", "site plan", "planned unit",
      "variance", "land use", "annexation", "downtown", "character",
    ],
  },
  {
    slug: "transportation",
    label: "Transportation & Streets",
    keywords: [
      "transportation", "street", "road", "bridge", "sidewalk", "bike",
      "bicycle", "transit", "parking", "traffic", "closure", "airport",
    ],
  },
  {
    slug: "environment",
    label: "Environment & Sustainability",
    keywords: [
      "sustainab", "environment", "climate", "energy", "solar", "greenbelt",
      "decarbon", "recycl", "compost", "stormwater", "tree", "nature center",
    ],
  },
  {
    slug: "safety",
    label: "Public Safety",
    keywords: [
      "police", "fire", "safety", "emergency", "oversight", "crime",
    ],
  },
  {
    slug: "parks",
    label: "Parks & Recreation",
    keywords: [
      "park", "recreation", "trail", "playground", "farmers market", "pool",
    ],
  },
  {
    slug: "budget",
    label: "Budget & Taxes",
    keywords: [
      "budget", "tax", "millage", "appropriat", "fee", "grant agreement",
      "purchase", "$",
    ],
  },
  {
    slug: "utilities",
    label: "Utilities",
    keywords: [
      "utility", "utilities", "water", "sewer", "electric", "dte",
      "solid waste",
    ],
  },
  {
    slug: "governance",
    label: "Governance",
    keywords: [
      "ordinance", "charter", "election", "appointment", "commission",
      "board", "resolution",
    ],
  },
];

/** Return the slugs of topics whose keywords appear in the given text. */
export function detectTopics(text: string): string[] {
  const hay = text.toLowerCase();
  const hits: string[] = [];
  for (const topic of TOPICS) {
    if (topic.keywords.some((kw) => hay.includes(kw.toLowerCase()))) {
      hits.push(topic.slug);
    }
  }
  return hits;
}

export function topicLabel(slug: string): string {
  return TOPICS.find((t) => t.slug === slug)?.label ?? slug;
}
