// src/hooks/useArticles.ts
import { useEffect, useState } from "react";

export type ArticleCategory =
  | "Construction Basics"
  | "Cost Saving Tips"
  | "Materials Guide"
  | "Permits & Regulations"
  | "Roofing"
  | "Plumbing"
  | "Electrical"
  | "Foundation & Structural Work"
  | "Finishing & Interior"
  | "House Design"
  | "Site Preparation";

export interface Article {
  id: string;
  title: string;
  category: ArticleCategory;
  readTime: string; // "5 min read"
  thumbnail?: string; // optional small thumbnail url (can be empty)
  content: string; // plain text paragraphs separated by double newlines
  author: string;
  publishDate: string; // ISO date
  tags: string[];
  isFeatured?: boolean;
  views?: number; // for popularity sorting (optional)
}

const mockArticles: Article[] = [
  {
    id: "a1",
    title: "10 Common Construction Mistakes First-Time Builders Make",
    category: "Construction Basics",
    readTime: "6 min read",
    thumbnail: "",
    content:
      "Building a house is exciting but full of pitfalls. In this article we cover the ten most common mistakes and how to avoid them.\n\nAlways check your site, validate contractor credentials, and get clear written estimates. Prevent scope creep and keep contingency funds.",
    author: "ConstructHub Team",
    publishDate: "2024-11-05",
    tags: ["basics", "planning"],
    isFeatured: true,
    views: 320,
  },
  {
    id: "a2",
    title: "How to Estimate Building Costs Accurately in Kenya",
    category: "Cost Saving Tips",
    readTime: "8 min read",
    thumbnail: "",
    content:
      "Accurate estimating ensures you don't run out of funds mid-project. This guide walks you through realistic unit rates, contingencies, and prioritizing spends.\n\nUse local rate data and always add at least 5% contingency.",
    author: "Finance & Estimating",
    publishDate: "2025-02-12",
    tags: ["estimation", "budget"],
    isFeatured: true,
    views: 480,
  },
  {
    id: "a3",
    title: "Choosing Roofing Materials: Cost vs Durability",
    category: "Roofing",
    readTime: "5 min read",
    thumbnail: "",
    content:
      "Roofing is a major cost driver and choice affects longevity. Compare iron sheets, tiles, and metal decks depending on climate and budget.\n\nConsider warranty, local supplier availability, and maintenance costs.",
    author: "Roofing Expert",
    publishDate: "2025-01-08",
    tags: ["roofing", "materials"],
    isFeatured: false,
    views: 215,
  },
  {
    id: "a4",
    title: "Site Preparation Checklist: What to do Before Construction",
    category: "Site Preparation",
    readTime: "4 min read",
    thumbnail: "",
    content:
      "Proper site prep saves time and money. Clear vegetation, confirm boundaries, do soil investigations if needed, and plan drainage.\n\nArrange spoil disposal and temporary site access before excavation begins.",
    author: "Site Team",
    publishDate: "2025-03-18",
    tags: ["site", "earthworks"],
    isFeatured: false,
    views: 180,
  },
  {
    id: "a5",
    title: "Plumbing First Fix vs Second Fix — What You Need to Know",
    category: "Plumbing",
    readTime: "5 min read",
    thumbnail: "",
    content:
      "Plumbing is done in two stages. First fix installs concealed pipes and in-wall plumbing. Second fix installs fixtures such as sinks and toilets.\n\nPlan fixture locations early to avoid rework and use quality joints for durability.",
    author: "Plumbing Pros",
    publishDate: "2024-12-02",
    tags: ["plumbing", "services"],
    isFeatured: false,
    views: 140,
  },
  {
    id: "a6",
    title: "Understanding Cement Grades and When to Use Each",
    category: "Materials Guide",
    readTime: "6 min read",
    thumbnail: "",
    content:
      "Cement grades determine concrete strength. Learn about 32.5, 42.5, and 52.5 grades and their use in foundations, slabs and finishing.\n\nMatching grade to structural design is essential for safety and cost efficiency.",
    author: "Materials Lab",
    publishDate: "2025-05-04",
    tags: ["cement", "materials"],
    isFeatured: true,
    views: 260,
  },
  {
    id: "a7",
    title: "Basic Electrical Safety on Site",
    category: "Electrical",
    readTime: "4 min read",
    thumbnail: "",
    content:
      "Electrical safety is non-negotiable. Use licensed electricians, proper earthing, and circuit protection. Isolate circuits during testing.\n\nDocument tests and retain certificates for compliance.",
    author: "Safety First",
    publishDate: "2024-09-15",
    tags: ["safety", "electrical"],
    isFeatured: false,
    views: 110,
  },
  {
    id: "a8",
    title: "Permits You Need Before You Dig: Kenyan County Guide",
    category: "Permits & Regulations",
    readTime: "7 min read",
    thumbnail: "",
    content:
      "Before breaking ground, secure the necessary county permits. This article explains building permits, NCA registration, and environmental approvals.\n\nDifferent counties have different requirements—check local offices early.",
    author: "Legal Desk",
    publishDate: "2025-04-01",
    tags: ["permits", "kenya"],
    isFeatured: false,
    views: 210,
  },
  {
    id: "a9",
    title: "Finishing Choices That Add Value to Your Home",
    category: "Finishing & Interior",
    readTime: "6 min read",
    thumbnail: "",
    content:
      "High-quality finishes can boost resale value. Explore durable flooring, paint systems, and built-in cabinetry trade-offs between cost and appearance.\n\nConsider lifecycle cost and maintenance when selecting finishes.",
    author: "Interior Design",
    publishDate: "2025-02-20",
    tags: ["finishes", "value"],
    isFeatured: false,
    views: 195,
  },
  {
    id: "a10",
    title: "Designing Efficient 3-Bedroom Bungalows",
    category: "House Design",
    readTime: "7 min read",
    thumbnail: "",
    content:
      "Good layout reduces construction and operational costs. This article shows efficient plans, orientation for ventilation, and passive solar ideas.\n\nStart with clear client brief and site constraints before finalizing the plan.",
    author: "Architect Insights",
    publishDate: "2025-03-08",
    tags: ["design", "layout"],
    isFeatured: true,
    views: 350,
  },
  {
    id: "a11",
    title: "Foundations: When to Use Strip Footings vs Raft Foundations",
    category: "Foundation & Structural Work",
    readTime: "8 min read",
    thumbnail: "",
    content:
      "Soil conditions and loads determine foundation type. This article compares strip footings, pad foundations and raft foundations along cost and suitability.\n\nConsult a geotechnical engineer for uncertain soils.",
    author: "Structural Team",
    publishDate: "2025-01-30",
    tags: ["foundations", "structural"],
    isFeatured: false,
    views: 170,
  },
];

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setArticles(mockArticles);
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  const featured = articles.filter((a) => a.isFeatured).slice(0, 6);

  return { articles, featuredArticles: featured, loading };
}


