import React from "react"

interface Review {
  id: number
  reviewer: string
  comment: string
  rating: number
  date: string
}

interface TechnicianReviewsProps {
  reviews?: Review[]
  verified?: boolean
}

const TechnicianReviews: React.FC<TechnicianReviewsProps> = ({
  reviews = [],
  verified = false,
}) => {
  return (
    <section className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mt-6">
      {/* Section Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Client Reviews
      </h3>

      {reviews.length > 0 ? (
        <ul className="space-y-4">
          {reviews.map((review, index) => (
            <li
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {review.reviewer}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {review.date}
                </p>
              </div>

              {/* Rating Stars */}
              <div className="flex items-center mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill={i < Math.round(review.rating) ? "gold" : "gray"}
                    className="w-4 h-4"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.09 3.356a1 1 0 0 0 .95.69h3.525c.969 0 1.371 1.24.588 1.81l-2.857 2.074a1 1 0 0 0-.364 1.118l1.09 3.356c.3.921-.755 1.688-1.54 1.118l-2.857-2.074a1 1 0 0 0-1.176 0l-2.857 2.074c-.784.57-1.838-.197-1.54-1.118l1.09-3.356a1 1 0 0 0-.364-1.118L2.896 8.783c-.783-.57-.38-1.81.588-1.81h3.525a1 1 0 0 0 .95-.69l1.09-3.356z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {review.rating.toFixed(1)}
                </span>
              </div>

              <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="italic text-gray-500 dark:text-gray-400">
          No reviews yet.{" "}
          {verified
            ? "Encourage your clients to leave feedback on completed projects."
            : "Verify your profile to start receiving reviews from builders."}
        </p>
      )}
    </section>
  )
}

export default TechnicianReviews
