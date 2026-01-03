// src/pages/ArticleDetailsPage.tsx
import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useArticle, useArticles } from "../hooks/Articles/useArticles";
import ArticleCard from "../components/Articles/ArticleCard";
import { useAuth } from "../hooks/auth/useAuth";

const ArticleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { article, loading, error } = useArticle(id);
  const { articles } = useArticles();

  const related = useMemo(() => {
    if (!article) return [];
    return articles.filter((a) => a.category === article.category && a.id !== article.id).slice(0, 3);
  }, [articles, article]);

  if (loading) return <div className="p-6 text-gray-500">Loading article...</div>;
  if (error || !article)
    return (
      <div className="p-6 text-red-500">
        <p>Article not found or failed to load.</p>
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        <button onClick={() => navigate(-1)} className="mt-3 text-sm px-3 py-2 border rounded">
          Go back
        </button>
      </div>
    );

  const paragraphs = (article.content || "").split(/\n\s*\n/);

  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm my-2">
      <div className="bg-background-light dark:bg-background-dark p-6 rounded-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <span>{article.category}</span>
              {article.read_time && <span className="text-xs text-gray-400">• {article.read_time}</span>}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mt-2 text-gray-900 dark:text-gray-100">{article.title}</h1>
            <div className="mt-2 text-sm text-gray-600">
              By {article.author} • {new Date(article.publish_date).toLocaleDateString()}
            </div>
          </div>
          <div>
            <button onClick={() => navigate(-1)} className="text-sm px-3 py-2 border rounded">
              Back
            </button>
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/admin/articles")}
                className="ml-2 text-sm px-3 py-2 border rounded bg-blue-50 text-blue-700"
              >
                Manage
              </button>
            )}
          </div>
        </div>

        <hr className="my-6" />

        <article className="prose dark:prose-invert max-w-none">
          {paragraphs.map((p, i) => (
            <p key={i} className="mb-4 text-gray-700 dark:text-gray-300">
              {p}
            </p>
          ))}
        </article>

        {article.tags?.length ? (
          <div className="mt-6">
            <div className="text-sm text-gray-500">Tags</div>
            <div className="mt-2 flex gap-2 flex-wrap">
              {article.tags.map((t) => (
                <span key={t} className="px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-800">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {related.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Related Articles</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              {related.map((r) => (
                <ArticleCard key={r.id} article={r} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ArticleDetailsPage;
