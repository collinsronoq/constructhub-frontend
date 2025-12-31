import { useEffect, useState } from "react";
import type { ReviewCardProps } from "../../components/ReviewCard";
import { fetchTechnicianReviews, createTechnicianReview } from "../../services/api/reviews";

const dummyTechReviews: ReviewCardProps[] = [
  {
    id: "1",
    reviewerName: "Jane Builder",
    reviewerRole: "Builder",
    rating: 5,
    date: "Oct 1, 2025",
    review: "Reliable and skilled technician."
  },
  {
    id: "2",
    reviewerName: "Mark Contractor",
    reviewerRole: "Contractor",
    rating: 4,
    date: "Sep 20, 2025",
    review: "Good work, would hire again."
  }
];

export function useTechnicianReviews(userId?: number) {
  const [reviews, setReviews] = useState<ReviewCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    fetchTechnicianReviews(userId)
      .then(setReviews)
      .catch((err) => {
        console.error("Failed to load technician reviews", err);
        setReviews(dummyTechReviews);
        setError("Using placeholder reviews");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  async function addReview(rating: number, review: string) {
    if (!userId) return;
    try {
      const created = await createTechnicianReview(userId, { rating, review });
      setReviews((prev) => [...prev, created]);
    } catch (err) {
      console.error("Failed to submit review", err);
      const mock: ReviewCardProps = {
        id: String(Date.now()),
        reviewerName: "You",
        reviewerRole: "Builder",
        rating,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        review,
      };
      setReviews((prev) => [...prev, mock]);
    }
  }

  return { reviews, loading, error, addReview };
}
