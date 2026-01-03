import React from "react";
import { useNavigate } from "react-router-dom";
import ArticleCard from "../Articles/ArticleCard";
import type { Article } from "../../services/api/articles";

interface LearningTipsProps {
  articles?: Article[];
  onViewAll?: () => void;
  loading?: boolean;
  error?: string | null;
}

const LearningTips: React.FC<LearningTipsProps> = ({ articles = [], onViewAll, loading, error }) => {
  const navigate = useNavigate();
  const handleViewAll = () => (onViewAll ? onViewAll() : navigate("/articles"));

  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm my-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Learning Tips & Resources</h2>
        <button onClick={handleViewAll} className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
          View All
        </button>
      </div>

      {loading && <div className="text-gray-500 text-sm mb-2">Loading...</div>}
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.length ? (
          articles.slice(0, 3).map((article) => <ArticleCard key={article.id} article={article} />)
        ) : (
          <div className="col-span-full text-gray-500 text-sm">No articles yet.</div>
        )}
      </div>
    </section>
  );
};

export default LearningTips;