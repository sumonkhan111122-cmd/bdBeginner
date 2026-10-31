import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import * as Icons from "lucide-react";
import type { Category } from "@/types";
export function CategoryCard({
  category,
  index,
}: {
  category: Category;
  index?: number;
}) {
  const Icon = (Icons[category.icon as keyof typeof Icons] ??
    Icons.Folder) as Icons.LucideIcon;
  const to =
    category.slug === "web-services"
      ? "/services"
      : `/products?category=${encodeURIComponent(category.slug)}`;
  return (
    <Link to={to} className="studio-category-card">
      <div className="category-card-top">
        <Icon size={23} strokeWidth={1.4} aria-hidden="true" />
        {index !== undefined && (
          <span className="category-index">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="studio-category-name">
        <h3>{category.name}</h3>
        <ArrowUpRight size={15} aria-hidden="true" />
      </div>
      <p>{category.tagline}</p>
    </Link>
  );
}
