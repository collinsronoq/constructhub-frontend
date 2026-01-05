import { Link } from "react-router-dom";
import { useState } from "react";
import { chat, createThread } from "../../services/api/ai";

export interface EstimateCardProps {
  id: string;
  projectName: string;
  category: string;
  estimatedCost: string;
  dateCreated: string;
  location: string;
}

const EstimateCard: React.FC<EstimateCardProps> = ({
  id,
  projectName,
  category,
  estimatedCost,
  dateCreated,
  location,
}) => {
  const [aiStatus, setAiStatus] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAiSummary = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiStatus(null);
    try {
      const thread = await createThread({ project_id: id, title: `AI for ${projectName}` });
      const resp = await chat({
        thread_id: thread.thread_id,
        message: "Summarize this estimate with key cost drivers and phase highlights.",
        context: { project_id: id, location },
        response_mode: "structured",
      });
      setAiStatus(resp.assistant?.text || "No response from AI.");
    } catch (err: any) {
      setAiError(err?.detail?.detail || err?.message || "AI request failed");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div
      key={id}
      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-background-dark shadow hover:shadow-md transition"
    >
      <div className="flex items-center space-x-2 text-base md:text-lg font-semibold text-gray-800 dark:text-gray-100 ml-2 my-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 md:size-5">
          <path d="M8.543 2.232a.75.75 0 0 0-1.085 0l-5.25 5.5A.75.75 0 0 0 2.75 9H4v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V9h1.25a.75.75 0 0 0 .543-1.268l-5.25-5.5Z" />
        </svg>
        <h3>{projectName}</h3>
      </div>

      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 ml-2">
        <span
          className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
            category === "Residential"
              ? "bg-blue-100 text-blue-700"
              : category === "Commercial"
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {category}
        </span>
      </p>

      <div className="mt-3 text-gray-600 dark:text-gray-300 my-2 text-xs md:text-sm">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 md:size-5">
            <path
              fillRule="evenodd"
              d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 7c0 2.255 1.19 4.235 2.292 5.597a15.591 15.591 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .189.153l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
              clipRule="evenodd"
            />
          </svg>
          <p>
            Location:
            <span className="font-medium ml-2">{location}</span>
          </p>
        </div>

        <div className="flex items-center text-gray-900 dark:text-gray-100 space-x-2 my-2 text-xs md:text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 md:size-5">
            <path
              fillRule="evenodd"
              d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3Zm9 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm-6.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM11.5 6A.75.75 0 1 1 13 6a.75.75 0 0 1-1.5 0Z"
              clipRule="evenodd"
            />
            <path d="M13 11.75a.75.75 0 0 0-1.5 0v.179c0 .15-.138.28-.306.255A65.277 65.277 0 0 0 1.75 11.5a.75.75 0 0 0 0 1.5c3.135 0 6.215.228 9.227.668A1.764 1.764 0 0 0 13 11.928v-.178Z" />
          </svg>
          <p>
            Estimated Cost:
            <span className="font-medium ml-2">{estimatedCost}</span>
          </p>
        </div>

        <div className="flex items-center  text-gray-500 dark:text-gray-400 my-2 space-x-2 text-xs md:text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 md:size-5">
            <path
              fillRule="evenodd"
              d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2V1.75ZM4.5 6a1 1 0 0 0-1 1v4.5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-7Z"
              clipRule="evenodd"
            />
          </svg>
          <p className=" text-gray-500 dark:text-gray-400 mt-1">Created on: {dateCreated}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Link
          to={`/estimation/${id}`}
          className="inline-block px-4 py-2 bg-blue-600 text-white text-xs md:text-sm rounded-lg hover:bg-blue-700 transition text-center"
        >
          View Details
        </Link>
        <button
          onClick={handleAiSummary}
          disabled={aiLoading}
          className="px-4 py-2 bg-emerald-600 text-white text-xs md:text-sm rounded-lg hover:bg-emerald-700 transition disabled:opacity-60"
        >
          {aiLoading ? "Asking AI..." : "Ask AI for Summary"}
        </button>
        {aiError && <p className="text-xs text-red-600">{aiError}</p>}
        {aiStatus && (
          <div className="text-xs md:text-sm text-gray-800 dark:text-gray-100 bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded p-3">
            {aiStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default EstimateCard;
