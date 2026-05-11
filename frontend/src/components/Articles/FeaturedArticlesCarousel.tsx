// src/components/Articles/FeaturedArticlesCarousel.tsx
import React from "react";
import type { Article } from "../../services/api/articles"; 
import ArticleCard from "./ArticleCard";

const FeaturedArticlesCarousel: React.FC<{ items: Article[] }> = ({ items }) => {
  return (
    <div className="overflow-x-auto py-2">
      <div className="flex gap-4 px-2 pb-2 text-sm md:text-base">
        {items.map((it) => (
          <div key={it.id} className="min-w-[320px] max-w-[400px] flex-shrink-0 text-sm md:text-base">
            <ArticleCard article={it} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedArticlesCarousel;
