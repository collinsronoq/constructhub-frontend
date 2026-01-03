import { apiFetch } from "./client";

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
  id: number;
  title: string;
  category: ArticleCategory | string;
  content: string;
  author: string;
  publish_date: string;
  read_time?: string | null;
  tags: string[];
  is_featured: boolean;
  thumbnail?: string | null;
  views: number;
}


export type ArticleCreate = Omit<Article, "id" | "views">;
export type ArticleUpdate = Partial<ArticleCreate>;

export async function fetchArticles(limit = 50, offset = 0): Promise<Article[]> {
  return apiFetch<Article[]>(`/articles?limit=${limit}&offset=${offset}`, { method: "GET", auth: false });
}

export async function fetchFeaturedArticles(limit = 8, offset = 0): Promise<Article[]> {
  return apiFetch<Article[]>(`/articles/featured?limit=${limit}&offset=${offset}`, { method: "GET", auth: false });
}

export async function fetchArticle(id: number): Promise<Article> {
  return apiFetch<Article>(`/articles/${id}`, { method: "GET", auth: false });
}

export async function createArticle(payload: ArticleCreate): Promise<Article> {
  return apiFetch<Article>("/articles/", { method: "POST", body: payload });
}

export async function updateArticle(id: number, payload: ArticleUpdate): Promise<Article> {
  return apiFetch<Article>(`/articles/${id}`, { method: "PUT", body: payload });
}

export async function deleteArticle(id: number): Promise<void> {
  await apiFetch(`/articles/${id}`, { method: "DELETE" });
}
