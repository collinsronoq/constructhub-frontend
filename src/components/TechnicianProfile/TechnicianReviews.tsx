// import React from "react"

// interface Review {
//   id: number
//   reviewer: string
//   review: string
//   rating: number
//   date: string
// }

// interface TechnicianReviewsProps {
//   reviews?: Review[]
//   verified?: boolean
// }

// const TechnicianReviews: React.FC<TechnicianReviewsProps> = ({
//   reviews = [],
//   verified = false,
// }) => {
//   return (
//     <section className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mt-6">
//       {/* Section Title */}
//       <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
//         Client Reviews
//       </h3>

//       {reviews.length > 0 ? (
//         <ul className="space-y-4">
//           {reviews.map((review, index) => (
//             <li
//               key={index}
//               className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
//             >
//               <div className="flex justify-between items-center mb-2">
//                 <h4 className="font-semibold text-gray-900 dark:text-gray-100">
//                   {review.reviewer}
//                 </h4>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   {review.date}
//                 </p>
//               </div>

//               {/* Rating Stars */}
//               <div className="flex items-center mb-2">
//                 {Array.from({ length: 5 }, (_, i) => (
//                   <svg
//                     key={i}
//                     xmlns="http://www.w3.org/2000/svg"
//                     viewBox="0 0 20 20"
//                     fill={i < Math.round(review.rating) ? "gold" : "gray"}
//                     className="w-4 h-4"
//                   >
//                     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.09 3.356a1 1 0 0 0 .95.69h3.525c.969 0 1.371 1.24.588 1.81l-2.857 2.074a1 1 0 0 0-.364 1.118l1.09 3.356c.3.921-.755 1.688-1.54 1.118l-2.857-2.074a1 1 0 0 0-1.176 0l-2.857 2.074c-.784.57-1.838-.197-1.54-1.118l1.09-3.356a1 1 0 0 0-.364-1.118L2.896 8.783c-.783-.57-.38-1.81.588-1.81h3.525a1 1 0 0 0 .95-.69l1.09-3.356z" />
//                   </svg>
//                 ))}
//                 <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
//                   {review.rating.toFixed(1)}
//                 </span>
//               </div>

//               <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p className="italic text-gray-500 dark:text-gray-400">
//           No reviews yet.{" "}
//           {verified
//             ? "Encourage your clients to leave feedback on completed projects."
//             : "Verify your profile to start receiving reviews from builders."}
//         </p>
//       )}
//     </section>
//   )
// }

// export default TechnicianReviews

import { useState } from "react"
import LeaveReviewForm from "../ReviewForm"


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

      <p className="text-sm text-gray-700 dark:text-gray-300 mt-3">{review}</p>
    </div>
  )
}



interface TechnicianReviewsProps {
  reviews?: ReviewCardProps[]
  verified?: boolean
  isTechnicianView?: boolean
}

const TechnicianReviews: React.FC<TechnicianReviewsProps> = ({
  reviews = [],
  isTechnicianView = false,
}) => {

  const [review, setReview ] = useState<ReviewCardProps[]>(reviews)

  const handleNewReview = (rating: number, review: string) => {

    const newReview = {
      id: "12",
      reviewerName: "Collo the builder",
      reviewerRole: "Builder",
      rating,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      review,
    }

    setReview((prev) => [...prev, newReview])
    console.log("New Review Submitted:", { rating, review })
    // Later: POST to backend API
  }

  return (
    <section className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm my-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Technician Reviews
      </h2>

      <div className="h-[400px] overflow-y-auto pr-2 space-y-4">
        {review.length > 0 ? (
          review.map((review) => <ReviewCard key={review.id} {...review} />)
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No reviews yet.
          </p>
        )}
      </div>
      
      {/* Leave Review Form (Hidden for technicians) */}
      {!isTechnicianView && <LeaveReviewForm onSubmit={handleNewReview} />}
    </section>
  )
}

export default TechnicianReviews


