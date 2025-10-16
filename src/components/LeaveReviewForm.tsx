import React, { useState } from "react"


interface LeaveReviewFormProps {
  onSubmit?: (rating: number, review: string) => void
}

const LeaveReviewForm: React.FC<LeaveReviewFormProps> = ({ onSubmit }) => {
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if( rating=== 0 || !review.trim()) return
    onSubmit?.(rating, review)

    setRating(0)
    setReview("")

  }
  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Leave a Review
      </h3>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((num) => (
          <svg
            key={num}
            onClick={() => setRating(num)}
            xmlns="http://www.w3.org/2000/svg"
            fill={num <= rating ? "#facc15" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke={num <= rating ? "#facc15" : "currentColor"}
            className="w-6 h-6 cursor-pointer hover:scale-110 transition-transform"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.13 4.315a.563.563 0 00.424.308l4.765.692a.562.562 0 01.312.959l-3.448 3.36a.563.563 0 00-.162.498l.813 4.744a.563.563 0 01-.817.593L12 17.347l-4.258 2.237a.563.563 0 01-.817-.593l.813-4.744a.563.563 0 00-.162-.498L4.128 9.773a.562.562 0 01.312-.959l4.765-.692a.563.563 0 00.424-.308l2.13-4.315z"
            />
          </svg>
        ))}
      </div>

      {/* Comment Input */}
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        rows={3}
        placeholder="Share your experience working with this technician..."
        className="w-full px-3 py-2 text-xs md:text-lg rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
      />

      <button
        type="submit"
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
      >
        Submit Review
      </button>
    </form>
  )
    
  
}

export default LeaveReviewForm