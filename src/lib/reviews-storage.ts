import { useState, useEffect, useCallback } from "react";
import type { Review } from "@/types";
import { INITIAL_REVIEWS, getReviewsForPlace, calculatePlaceRatingMetrics } from "@/data/reviews";

const STORAGE_KEY = "bhraman_user_reviews_v1";
const UPVOTES_KEY = "bhraman_review_upvotes_v1";

export function getStoredUserReviews(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to read user reviews from localStorage", e);
    return [];
  }
}

export function saveUserReview(review: Review): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getStoredUserReviews();
    const updated = [review, ...current];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("bhraman_reviews_updated"));
    return updated;
  } catch (e) {
    console.error("Failed to save review to localStorage", e);
    return [];
  }
}

export function getStoredUpvotes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(UPVOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleReviewUpvote(reviewId: string): { upvoted: boolean; allUpvotes: string[] } {
  if (typeof window === "undefined") return { upvoted: false, allUpvotes: [] };
  try {
    const current = getStoredUpvotes();
    const exists = current.includes(reviewId);
    const updated = exists ? current.filter((id) => id !== reviewId) : [...current, reviewId];
    localStorage.setItem(UPVOTES_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("bhraman_upvotes_updated"));
    return { upvoted: !exists, allUpvotes: updated };
  } catch {
    return { upvoted: false, allUpvotes: [] };
  }
}

export function useReviews(placeId?: string) {
  const [customReviews, setCustomReviews] = useState<Review[]>(() => getStoredUserReviews());
  const [upvotedIds, setUpvotedIds] = useState<string[]>(() => getStoredUpvotes());

  useEffect(() => {
    const handleStorage = () => {
      setCustomReviews(getStoredUserReviews());
      setUpvotedIds(getStoredUpvotes());
    };
    window.addEventListener("bhraman_reviews_updated", handleStorage);
    window.addEventListener("bhraman_upvotes_updated", handleStorage);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("bhraman_reviews_updated", handleStorage);
      window.removeEventListener("bhraman_upvotes_updated", handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const addReview = useCallback((newReview: Omit<Review, "id" | "date" | "upvotes">) => {
    const fullReview: Review = {
      ...newReview,
      id: `user-rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      upvotes: 0,
      verified: true,
    };
    saveUserReview(fullReview);
    return fullReview;
  }, []);

  const upvote = useCallback((id: string) => {
    return toggleReviewUpvote(id);
  }, []);

  const allReviewsForPlace = placeId ? getReviewsForPlace(placeId, customReviews) : [];
  const metrics = calculatePlaceRatingMetrics(allReviewsForPlace);

  return {
    customReviews,
    upvotedIds,
    addReview,
    upvote,
    allReviewsForPlace,
    metrics,
  };
}
