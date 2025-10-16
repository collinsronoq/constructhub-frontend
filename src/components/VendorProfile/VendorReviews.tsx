import { useState } from "react"
import LeaveReviewForm from "../LeaveReviewForm"
import ReviewCard from "../ReviewCard"
import type { ReviewCardProps } from "../ReviewCard"


interface VendorReviewsProps {
  reviews?: ReviewCardProps[]
  verified?: boolean
  isVendorView?: boolean
}

const VendorReviews: React.FC<VendorReviewsProps> = ({
  reviews = [],
  isVendorView = false,
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
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm my-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Vendor Reviews
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
      {!isVendorView && <LeaveReviewForm onSubmit={handleNewReview} />}
    </section>
  )
}

export default VendorReviews