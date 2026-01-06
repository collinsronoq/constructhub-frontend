import React, { useMemo, useState } from "react";
import { useArticles, useArticleMutations } from "../hooks/Articles/useArticles";
import ArticleForm from "../components/Articles/ArticleForm";
import { useAuth } from "../hooks/auth/useAuth";
import { Trash2, Edit } from "lucide-react";
import type { Article } from "../services/api/articles";

const AdminArticlesPage: React.FC = () => {
  const { articles, loading, error, refetch } = useArticles();
  const { create, update, remove } = useArticleMutations();
  const { user } = useAuth();

  const [editingId, setEditingId] = useState<Article["id"] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toNumericId = (id: Article["id"] | null) => {
    if (id === null) return null;
    const numeric = typeof id === "string" ? Number(id) : id;
    return Number.isNaN(numeric) ? null : numeric;
  };

  const editingArticle = useMemo(
    () => (editingId == null ? undefined : articles.find((a) => String(a.id) === String(editingId))),
    [articles, editingId]
  );

  if (!user || user.role !== "admin") {
    return <div className="p-6 text-red-500">Unauthorized: admin access required.</div>;
  }

  const handleCreate = async (payload: any) => {
    setSubmitting(true);
    try {
      await create(payload);
      await refetch();
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (payload: any) => {
    const numericId = toNumericId(editingId);
    if (numericId === null) return;
    setSubmitting(true);
    try {
      await update(numericId, payload);
      await refetch();
      setEditingId(null);
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: Article["id"]) => {
    const numericId = toNumericId(id);
    if (numericId === null) return;
    if (!window.confirm("Delete this article?")) return;
    await remove(numericId);
    await refetch();
  };

  return (
    <section className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Manage Articles</h1>
          <p className="text-sm text-gray-500">Create, edit, and delete articles.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add Article
        </button>
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}
      {loading && <div className="text-gray-500">Loading...</div>}

      {showForm && (
        <div className="bg-white dark:bg-gray-900 border rounded p-4">
          <ArticleForm
            initialValues={editingArticle || {}}
            onSubmit={editingId ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
            }}
            submitting={submitting}
          />
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 border rounded p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">Title</th>
                <th className="p-2">Category</th>
                <th className="p-2">Published</th>
                <th className="p-2">Featured</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="p-2">{a.title}</td>
                  <td className="p-2">{a.category}</td>
                  <td className="p-2">{a.publish_date?.slice(0, 10)}</td>
                  <td className="p-2">{a.is_featured ? "Yes" : "No"}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      className="text-blue-600 flex items-center gap-1"
                      onClick={() => {
                        setEditingId(a.id);
                        setShowForm(true);
                      }}
                    >
                      <Edit size={14} /> Edit
                    </button>
                    <button
                      className="text-red-600 flex items-center gap-1"
                      onClick={() => handleDelete(a.id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default AdminArticlesPage;
