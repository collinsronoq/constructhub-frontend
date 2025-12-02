export interface ReviewCardProps {
  id: string
  reviewerName: string
  reviewerRole?: string
  rating: number
  date: string
  review: string
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  reviewerName,
  reviewerRole,
  rating,
  date,
  review,
}) => {
  const stars = Array(5)
    .fill(0)
    .map((_, i) => (
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        fill={i < rating ? "#facc15" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke={i < rating ? "#facc15" : "currentColor"}
        className="w-5 h-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.13 4.315a.563.563 0 00.424.308l4.765.692a.562.562 0 01.312.959l-3.448 3.36a.563.563 0 00-.162.498l.813 4.744a.563.563 0 01-.817.593L12 17.347l-4.258 2.237a.563.563 0 01-.817-.593l.813-4.744a.563.563 0 00-.162-.498L4.128 9.773a.562.562 0 01.312-.959l4.765-.692a.563.563 0 00.424-.308l2.13-4.315z"
        />
      </svg>
    ))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{reviewerName}</h4>
          {reviewerRole && <p className="text-xs text-gray-500">{reviewerRole}</p>}
        </div>
        <p className="text-xs text-gray-400">{date}</p>
      </div>

      <div className="flex items-center gap-1 mt-2">{stars}</div>

      <p className="text-sm md:text-lg text-gray-700 dark:text-gray-300 mt-3">{review}</p>
    </div>
  )
}


export default ReviewCard