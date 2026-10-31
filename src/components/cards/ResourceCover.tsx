import type { Product } from "@/types";

const covers: Record<string, { title: string; label: string; tone: string }> = {
  "kam-pro": {
    title: "Together.\nBetter.",
    label: "LEARNING & RELATIONSHIPS",
    tone: "peach",
  },
  "trad-pro": {
    title: "Read the\nmarket.",
    label: "TRADING & LEARNING",
    tone: "forest",
  },
  "cap-pc-pro": {
    title: "Cut. Edit.\nCreate.",
    label: "CREATIVE SOFTWARE",
    tone: "lavender",
  },
  "mouza-pro": {
    title: "Find your\nground.",
    label: "MAPS & RESOURCES",
    tone: "sand",
  },
  "win-offi-pro": {
    title: "Your daily\nworkspace.",
    label: "SOFTWARE & PRODUCTIVITY",
    tone: "blue",
  },
  "ytpc-pro": {
    title: "Less noise.\nMore focus.",
    label: "DIGITAL TOOLS",
    tone: "rose",
  },
  "mov-pro": {
    title: "Movie night.\nReimagined.",
    label: "ENTERTAINMENT RESOURCES",
    tone: "charcoal",
  },
};
export function ResourceCover({ product }: { product: Product }) {
  const generic = product.category.toLowerCase().includes("course")
    ? { title: "Learn. Do.\nRepeat.", label: "A NEW CHAPTER", tone: "peach" }
    : product.category.toLowerCase().includes("software")
      ? {
          title: "A better\nworkflow.",
          label: "SOFTWARE & TOOLS",
          tone: "blue",
        }
      : {
          title: "Good ideas\ninside.",
          label: "DIGITAL POSSIBILITIES",
          tone: "sand",
        };
  const cover = covers[product.slug] || generic;
  return (
    <div className={`resource-cover cover-${cover.tone}`} aria-hidden="true">
      <span className="cover-brand">bd / curated resources</span>
      <span className="cover-shape" />
      <strong>
        {cover.title.split("\n").map((line, i) => (
          <span key={i}>{line}</span>
        ))}
      </strong>
      <span className="cover-bottom">
        {cover.label}
        <span>↗</span>
      </span>
    </div>
  );
}
