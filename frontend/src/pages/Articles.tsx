// src/pages/ArticlesPage.tsx
import React, { useMemo, useState } from "react";
import { useArticles } from "../hooks/Articles/useArticles";
import FeaturedArticlesCarousel from "../components/Articles/FeaturedArticlesCarousel";
import ArticleFilters from "../components/Articles/ArticleFilters";
import ArticleCard from "../components/Articles/ArticleCard";
import { useAuth } from "../hooks/auth/useAuth";
import { useNavigate } from "react-router-dom";

const ArticlesPage: React.FC = () => {
  const { articles, featuredArticles, loading, error } = useArticles();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("Most Recent");
  const [visibleCount, setVisibleCount] = useState(8);

  const filtered = useMemo(() => {
    let list = articles;
    if (category !== "All") list = list.filter((a) => a.category === category);

    if (sortBy === "Most Recent") {
      list = [...list].sort((a, b) => +new Date(b.publish_date) - +new Date(a.publish_date));
    } else if (sortBy === "Most Popular") {
      list = [...list].sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === "Alphabetical") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [articles, category, sortBy]);

  return (
    <section className="p-2 md:p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm my-2 space-y-6">
      <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-4xl font-semibold text-gray-900 dark:text-gray-100">Learning Tips & Articles</h2>
            <p className="text-base md:text-4xl text-gray-600 dark:text-gray-400 mt-2">Practical construction articles to guide you in your projects.</p>
          </div>
          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin/articles")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
            >
              Manage Articles
            </button>
          )}

          <div className="mt-4 md:mt-0">
            <ArticleFilters category={category} onCategoryChange={setCategory} sortBy={sortBy} onSortChange={setSortBy} />
          </div>
        </div>

        {/* Featured */}
        {featuredArticles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200">Featured Articles</h3>
            <span className="pb-2"><FeaturedArticlesCarousel items={featuredArticles} /></span>
            
          </div>
        )}
      </div>

      {loading && <div className="text-center text-gray-500">Loading articles...</div>}
      {error && <div className="text-center text-red-500 text-sm">{error}</div>}

      {!loading && (
        <>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Construction Related Articles</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            
            {filtered.slice(0, visibleCount).map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>

          {visibleCount < filtered.length && (
            <div className="flex justify-center mt-6">
              <button onClick={() => setVisibleCount((c) => c + 6)} className="px-4 py-2 bg-blue-600 text-white rounded-md">
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ArticlesPage;
