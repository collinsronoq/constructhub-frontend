import React from "react";

export interface LearningTipCardProps {
  id: string;
  title: string;
  category: string;
  description: string;
  icon?: React.ReactNode;
  link?: string;
  onLearnMore: (id: string) => void;
}

const LearningTipCard: React.FC<LearningTipCardProps> = ({
  id,
  title,
  category,
  description,
  icon,
  onLearnMore,
}) => {
  return (
    <div className="p-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-1">
      {/* Icon + Category */}
      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-3">
        {icon ? (
          icon
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 20h9m-9-16h9M7 4v16m-4-8h8"
            />
          </svg>
        )}
        <span className="text-sm font-medium">{category}</span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        {description}
      </p>
      
      
      {/* Learn More Button */}
      <button
        onClick={() => onLearnMore?.(id)}
        className="inline-block w-full text-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
      >
        Learn More
      </button>
    </div>
  );
};

export default LearningTipCard;