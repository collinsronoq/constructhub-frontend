import { useEffect, useMemo, useState } from "react";
import {
  fetchArticles,
  fetchFeaturedArticles,
  fetchArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  type Article,
  type ArticleCreate,
  type ArticleUpdate,
} from "../../services/api/articles";

const mockArticles: Article[] = [
  {
    id: 1,
    title: "10 Common Construction Mistakes First-Time Builders Make",
    category: "Construction Basics",
    read_time: "6 min read",
    thumbnail: "",
    content:
      "Building a house is exciting but full of pitfalls. In this article we cover the ten most common mistakes and how to avoid them.\n\nAlways check your site, validate contractor credentials, and get clear written estimates. Prevent scope creep and keep contingency funds.",
    author: "ConstructHub Team",
    publish_date: "2024-11-05",
    tags: ["basics", "planning"],
    is_featured: true,
    views: 320,
  },
  {
    id: 2,
    title: "How to Estimate Building Costs Accurately in Kenya",
    category: "Cost Saving Tips",
    read_time: "8 min read",
    thumbnail: "",
    content:
      "Accurate estimating ensures you don't run out of funds mid-project. This guide walks you through realistic unit rates, contingencies, and prioritizing spends.\n\nUse local rate data and always add at least 5% contingency.",
    author: "Finance & Estimating",
    publish_date: "2025-02-12",
    tags: ["estimation", "budget"],
    is_featured: true,
    views: 480,
  },
  {
    id: 3,
    title: "Choosing Roofing Materials: Cost vs Durability",
    category: "Roofing",
    read_time: "5 min read",
    thumbnail: "",
    content:
      "Roofing is a major cost driver and choice affects longevity. Compare iron sheets, tiles, and metal decks depending on climate and budget.\n\nConsider warranty, local supplier availability, and maintenance costs.",
    author: "Roofing Expert",
    publish_date: "2025-01-08",
    tags: ["roofing", "materials"],
    is_featured: false,
    views: 215,
  },
  {
    id: 4,
    title: "Site Preparation Checklist: What to do Before Construction",
    category: "Site Preparation",
    read_time: "4 min read",
    thumbnail: "",
    content:
      "Proper site prep saves time and money. Clear vegetation, confirm boundaries, do soil investigations if needed, and plan drainage.\n\nArrange spoil disposal and temporary site access before excavation begins.",
    author: "Site Team",
    publish_date: "2025-03-18",
    tags: ["site", "earthworks"],
    is_featured: false,
    views: 180,
  },
  {
    id: 5,
    title: "Plumbing First Fix vs Second Fix — What You Need to Know",
    category: "Plumbing",
    read_time: "5 min read",
    thumbnail: "",
    content:
      "Plumbing is done in two stages. First fix installs concealed pipes and in-wall plumbing. Second fix installs fixtures such as sinks and toilets.\n\nPlan fixture locations early to avoid rework and use quality joints for durability.",
    author: "Plumbing Pros",
    publish_date: "2024-12-02",
    tags: ["plumbing", "services"],
    is_featured: false,
    views: 140,
  },
  {
    id: 6,
    title: "Understanding Cement Grades and When to Use Each",
    category: "Materials Guide",
    read_time: "6 min read",
    thumbnail: "",
    content:
      "Cement grades determine concrete strength. Learn about 32.5, 42.5, and 52.5 grades and their use in foundations, slabs and finishing.\n\nMatching grade to structural design is essential for safety and cost efficiency.",
    author: "Materials Lab",
    publish_date: "2025-05-04",
    tags: ["cement", "materials"],
    is_featured: true,
    views: 260,
  },
  {
    id: 7,
    title: "Basic Electrical Safety on Site",
    category: "Electrical",
    read_time: "4 min read",
    thumbnail: "",
    content:
      "Electrical safety is non-negotiable. Use licensed electricians, proper earthing, and circuit protection. Isolate circuits during testing.\n\nDocument tests and retain certificates for compliance.",
    author: "Safety First",
    publish_date: "2024-09-15",
    tags: ["safety", "electrical"],
    is_featured: false,
    views: 110,
  },
  {
    id: 8,
    title: "Permits You Need Before You Dig: Kenyan County Guide",
    category: "Permits & Regulations",
    read_time: "7 min read",
    thumbnail: "",
    content:
      "Before breaking ground, secure the necessary county permits. This article explains building permits, NCA registration, and environmental approvals.\n\nDifferent counties have different requirements—check local offices early.",
    author: "Legal Desk",
    publish_date: "2025-04-01",
    tags: ["permits", "kenya"],
    is_featured: false,
    views: 210,
  },
  {
    id: 9,
    title: "Finishing Choices That Add Value to Your Home",
    category: "Finishing & Interior",
    read_time: "6 min read",
    thumbnail: "",
    content:
      "High-quality finishes can boost resale value. Explore durable flooring, paint systems, and built-in cabinetry trade-offs between cost and appearance.\n\nConsider lifecycle cost and maintenance when selecting finishes.",
    author: "Interior Design",
    publish_date: "2025-02-20",
    tags: ["finishes", "value"],
    is_featured: false,
    views: 195,
  },
  {
    id: 11,
    title: "Designing Efficient 3-Bedroom Bungalows",
    category: "House Design",
    read_time: "7 min read",
    thumbnail: "",
    content:
      "Good layout reduces construction and operational costs. This article shows efficient plans, orientation for ventilation, and passive solar ideas.\n\nStart with clear client brief and site constraints before finalizing the plan.",
    author: "Architect Insights",
    publish_date: "2025-03-08",
    tags: ["design", "layout"],
    is_featured: true,
    views: 350,
  },
  {
    id: 12,
    title: "Foundations: When to Use Strip Footings vs Raft Foundations",
    category: "Foundation & Structural Work",
    read_time: "8 min read",
    thumbnail: "",
    content:
      "Soil conditions and loads determine foundation type. This article compares strip footings, pad foundations and raft foundations along cost and suitability.\n\nConsult a geotechnical engineer for uncertain soils.",
    author: "Structural Team",
    publish_date: "2025-01-30",
    tags: ["foundations", "structural"],
    is_featured: false,
    views: 170,
  },
];


interface UseArticlesOptions {
  useMock?: boolean;
  limit?: number;
  offset?: number;
}

export function useArticles({ useMock, limit = 50, offset = 0 }: UseArticlesOptions = {}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const useMockData = useMock ?? import.meta.env.VITE_USE_MOCKS === "true";

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      if (useMockData) {
        setArticles(mockArticles);
        setFeaturedArticles(mockArticles.filter((a) => a.is_featured));
      } else {
        try {
          const [all, featured] = await Promise.all([fetchArticles(limit, offset), fetchFeaturedArticles(8, 0)]);
          setArticles(all);
          setFeaturedArticles(featured);
          if (!all.length) {
            setError("No articles available yet. Be the first to add one.");
          }
        } catch (err: any) {
          // fallback to mock if backend fails
          setArticles(mockArticles);
          setFeaturedArticles(mockArticles.filter((a) => a.is_featured));
          setError(err?.message || "Using demo articles while loading failed.");
        }
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [useMockData, limit, offset]);

  const sortedFeatured = useMemo(
    () => [...featuredArticles].sort((a, b) => (b.views || 0) - (a.views || 0)),
    [featuredArticles]
  );

  return { articles, featuredArticles: sortedFeatured, loading, error, refetch: load };
}

export function useArticle(id?: number | string, { useMock }: { useMock?: boolean } = {}) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const useMockData = useMock ?? import.meta.env.VITE_USE_MOCKS === "true";

  useEffect(() => {
    if (!id) return;
    const numericId = !Number.isNaN(Number(id)) ? Number(id) : null;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (useMockData) {
          const found = mockArticles.find((a) => String(a.id) === String(id));
          setArticle(found || null);
          if (!found) setError("Article not found");
        } else {
          try {
            const data = await fetchArticle(numericId ?? id);
            setArticle(data);
          } catch (err: any) {
            // fallback to mock if backend fails
            const found = mockArticles.find((a) => String(a.id) === String(id));
            setArticle(found || null);
            if (!found) setError("Article not found");
            console.error("Failed to fetch article, using mock fallback", err);
          }
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load article");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, useMockData]);

  return { article, loading, error };
}

export function useArticleMutations() {
  return {
    create: (payload: ArticleCreate) => createArticle(payload),
    update: (id: number, payload: ArticleUpdate) => updateArticle(id, payload),
    remove: (id: number) => deleteArticle(id),
  };
}

