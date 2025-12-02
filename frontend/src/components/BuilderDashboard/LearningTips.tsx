import React from "react";
import { useNavigate } from "react-router-dom";
import LearningTipCard from "../LearningTipsCard";
import type { LearningTipCardProps } from "../LearningTipsCard";


interface LearningTipsProps {
  tips?: LearningTipCardProps[];
  onViewAll?: () => void;
}

const LearningTips: React.FC<LearningTipsProps> = ({
  tips = [
    {
      id: "1",
      title: "How to Estimate Construction Costs Accurately",
      category: "Estimation",
      description:
        "Understand how material, labor, and regional pricing affect overall construction costs.",
    },
    {
      id: "2",
      title: "Top 5 Sustainable Building Materials in Kenya",
      category: "Sustainability",
      description:
        "Discover affordable eco-friendly materials suitable for modern projects in Kenya.",
    },
    {
      id: "3",
      title: "Avoiding Common Mistakes in Project Budgeting",
      category: "Budgeting",
      description:
        "Learn how to create a realistic project budget and prevent cost overruns.",
    },
  ],
  onViewAll,
}) => {

  const navigate = useNavigate();

  const handleLearnMore = (articleId: string) =>{
    navigate(`/article/${articleId}`)
  }
  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm my-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Learning Tips & Resources
        </h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
          >
            View All
          </button>
        )}
      </div>

      {/* Grid of Tips */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tips.map((tip) => (
          <LearningTipCard key={tip.id} {...tip} onLearnMore={()=> handleLearnMore(tip.id)}/>
        ))}
      </div>
    </section>
  );
};

export default LearningTips;




