
import React from "react"

interface AIAssistantWidgetProps {
  onOpenChat?: () => void
  onOpenEstimationHelp?: () => void
  suggestions?: string[]
}

const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({
  onOpenChat,
  onOpenEstimationHelp,
  suggestions = [
    "What is the best foundation for a two-story house?",
    "Estimate cost for a 3-bedroom bungalow in Nairobi.",
    "Suggest reliable vendors for roofing materials in Rafiki, Nakuru",
  ],
}) => {
  return (
    <section className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 shadow-md border border-gray-200 dark:border-gray-700 transition my-8">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-600 text-white p-2 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            AI Assistant
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your intelligent construction guide
          </p>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-white dark:bg-background-dark p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner mb-6">
        <p className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-200 mb-3">
          Try asking:
        </p>
        <ul className="space-y-2 text-sm md:text-base text-gray-600 dark:text-gray-300">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="flex items-start gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 mt-0.5 text-blue-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m6-6H6"
                />
              </svg>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
        <button
          onClick={onOpenChat}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 8h10M7 12h8m-6 8h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8l-2 4 5-2z"
            />
          </svg>
          Ask AI Assistant
        </button>

        <button
          onClick={onOpenEstimationHelp}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6l4 2m6-4a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          Get Estimation Help
        </button>
      </div>
    </section>
  )
}

export default AIAssistantWidget





// const AIAssistantWidget = () => {
//   return (
//     <section>
//       <h3>AI Assistant</h3>
//       <p>Need help optimizing your project plan?</p>

//       <div>
//         <button>Optimize Material Use</button>
//         <button>Compare Vendors</button>
//         <button>Estimate New Cost</button>
//       </div>
//     </section>
//   );
// };

// export default AIAssistantWidget;
