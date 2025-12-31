import { useEffect, useState } from "react";
import type { ReviewCardProps } from "../components/ReviewCard";
import { fetchVendorReviews, createVendorReview } from "../services/api/reviews";

const dummyReviews: ReviewCardProps[] = [
  {
    id: "1",
    reviewerName: "John Mwangi",
    reviewerRole: "Builder",
    rating: 5,
    date: "Oct 5, 2025",
    review: "Great service and timely delivery!",
  },
  {
    id: "2",
    reviewerName: "Sarah Otieno",
    reviewerRole: "Contractor",
    rating: 4,
    date: "Oct 3, 2025",
    review: "Good quality materials, slight delay on one item.",
  },
];

export function useVendorReviews(vendorId?: number) {
  const [reviews, setReviews] = useState<ReviewCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) return;
    setLoading(true);
    setError(null);
    fetchVendorReviews(vendorId)
      .then(setReviews)
      .catch((err) => {
        console.error("Failed to load vendor reviews", err);
        setReviews(dummyReviews);
        setError("Using placeholder reviews");
      })
      .finally(() => setLoading(false));
  }, [vendorId]);

  async function addReview(rating: number, review: string) {
    if (!vendorId) return;
    try {
      const created = await createVendorReview(vendorId, { rating, review });
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
