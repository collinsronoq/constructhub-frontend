import React, { useState } from "react";
import type { Article, ArticleCreate, ArticleUpdate, ArticleCategory } from "../../services/api/articles";

interface Props {
  initialValues?: Partial<Article>;
  onSubmit: (payload: ArticleCreate | ArticleUpdate) => Promise<void> | void;
  onCancel?: () => void;
  submitting?: boolean;
}

const categories: ArticleCategory[] = [
  "Construction Basics",
  "Cost Saving Tips",
  "Materials Guide",
  "Permits & Regulations",
  "Roofing",
  "Plumbing",
  "Electrical",
  "Foundation & Structural Work",
  "Finishing & Interior",
  "House Design",
  "Site Preparation",
];

const ArticleForm: React.FC<Props> = ({ initialValues, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState<Partial<Article>>({
    title: initialValues?.title || "",
    category: initialValues?.category || "",
    content: initialValues?.content || "",
    author: initialValues?.author || "",
    publish_date: initialValues?.publish_date || "",
    read_time: initialValues?.read_time || "",
    tags: initialValues?.tags || [],
    is_featured: initialValues?.is_featured || false,
    thumbnail: initialValues?.thumbnail || "",
  });

  const handleChange = (field: keyof Article, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      title: form.title,
      category: form.category,
      content: form.content,
      author: form.author,
      publish_date: form.publish_date,
      read_time: form.read_time,
      tags: form.tags,
      is_featured: form.is_featured,
      thumbnail: form.thumbnail,
    };
    await onSubmit(payload);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            className="w-full border rounded p-2"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            className="w-full border rounded p-2"
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value)}
            required
          >
            <option value="">Select</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Author</label>
          <input
            className="w-full border rounded p-2"
            value={form.author}
            onChange={(e) => handleChange("author", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Publish Date</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={form.publish_date?.slice(0, 10) || ""}
            onChange={(e) => handleChange("publish_date", e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Read Time</label>
          <input
            className="w-full border rounded p-2"
            value={form.read_time || ""}
            onChange={(e) => handleChange("read_time", e.target.value)}
            placeholder="e.g., 5 min read"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
          <input
            className="w-full border rounded p-2"
            value={form.thumbnail || ""}
            onChange={(e) => handleChange("thumbnail", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
        <input
          className="w-full border rounded p-2"
          value={form.tags?.join(",") || ""}
          onChange={(e) => handleChange("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <textarea
          className="w-full border rounded p-2 h-40"
          value={form.content}
          onChange={(e) => handleChange("content", e.target.value)}
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.is_featured || false}
          onChange={(e) => handleChange("is_featured", e.target.checked)}
        />
        <span className="text-sm">Mark as featured</span>
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-3 py-2 border rounded">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!!submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save Article"}
        </button>
      </div>
    </form>
  );
};

export default ArticleForm;
