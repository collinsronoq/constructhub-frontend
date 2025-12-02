// src/components/Articles/ArticleCard.tsx
import React from "react";
import type { Article } from "../../hooks/Articles/useArticles";
import { useNavigate } from "react-router-dom";
import { Clock2 } from "lucide-react";

const categoryColors: Record<string, string> = {
  "Construction Basics": "bg-gray-100 text-gray-800",
  "Cost Saving Tips": "bg-green-100 text-green-800",
  "Materials Guide": "bg-indigo-100 text-indigo-800",
  "Permits & Regulations": "bg-red-100 text-red-800",
  "Roofing": "bg-blue-100 text-blue-800",
  "Plumbing": "bg-teal-100 text-teal-800",
  "Electrical": "bg-yellow-100 text-yellow-800",
  "Foundation & Structural Work": "bg-purple-100 text-purple-800",
  "Finishing & Interior": "bg-pink-100 text-pink-800",
  "House Design": "bg-indigo-50 text-indigo-800",
  "Site Preparation": "bg-gray-50 text-gray-700",
};

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white dark:bg-gray-900 border rounded-lg shadow-sm overflow-hidden">
      {/* thumbnail area (optional) */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className={`px-2 py-1 rounded text-xs font-semibold ${categoryColors[article.category] || "bg-gray-100"}`}>
            {article.category}
          </div>
          <div className="flex justify-center text-xs text-gray-500">
            <Clock2 size={15}/>
            <span className="pl-1">{article.readTime}</span>

          </div>
        </div>

        <h3 className="mt-3 text-lg font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
          {article.title}
        </h3>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {article.content.slice(0, 160)}...
        </p>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-500">{article.author}</div>
          <button
            onClick={() => navigate(`/articles/${article.id}`)}
            className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md"
          >
            Read Article
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
