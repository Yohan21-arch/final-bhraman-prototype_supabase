import { useState, useMemo, type FormEvent } from "react";
import {
  Star,
  ThumbsUp,
  Award,
  CheckCircle2,
  Compass,
  DollarSign,
  UserCheck,
  Plus,
  X,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import type { Review, TravelType, Place } from "@/types";
import { useReviews } from "@/lib/reviews-storage";
import { cn } from "@/lib/utils";

interface ReviewsSectionProps {
  place: Place;
  onAskYatra?: (prompt: string) => void;
}

export function ReviewsSection({ place, onAskYatra }: ReviewsSectionProps) {
  const { allReviewsForPlace, metrics, addReview, upvote, upvotedIds } = useReviews(place.id);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Form State
  const [authorName, setAuthorName] = useState("");
  const [authorCity, setAuthorCity] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [priceRating, setPriceRating] = useState<number>(5);
  const [travelType, setTravelType] = useState<TravelType>("couple");
  const [guideHired, setGuideHired] = useState<boolean>(true);
  const [guideCost, setGuideCost] = useState<string>("₹2,050 (Official ASI half-day)");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  const filteredReviews = useMemo(() => {
    return allReviewsForPlace.filter((r) => {
      if (selectedFilter === "all") return true;
      if (selectedFilter === "with-guide") return r.tourGuideHired;
      if (selectedFilter === "5-star") return r.rating >= 5;
      return r.travelType === selectedFilter;
    });
  }, [allReviewsForPlace, selectedFilter]);

  const handleSubmitReview = (e: FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !reviewTitle.trim() || !reviewText.trim()) return;

    addReview({
      placeId: place.id,
      placeName: place.name,
      author: authorName.trim(),
      authorLocation: authorCity.trim() || "India",
      rating,
      priceRating,
      travelType,
      title: reviewTitle.trim(),
      comment: reviewText.trim(),
      tourGuideHired: guideHired,
      tourGuideCost: guideHired ? guideCost.trim() : undefined,
    });

    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setIsModalOpen(false);
      // Reset
      setAuthorName("");
      setAuthorCity("");
      setReviewTitle("");
      setReviewText("");
    }, 1200);
  };

  return (
    <section className="space-y-6 rounded-2xl border border-border/70 bg-card/60 p-6 md:p-8 shadow-md">
      {/* Header with Title and "Write Review" Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <p className="eyebrow flex items-center gap-1.5 text-primary font-semibold">
            <UserCheck className="size-3.5" /> Traveler Voices & Value Ratings
          </p>
          <h3 className="display-font text-2xl font-bold text-foreground">
            Reviews & Price Ratings for {place.name}
          </h3>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="size-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Scorecards & Metrics Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Overall Star Rating */}
        <div className="rounded-xl border border-border/60 bg-background/80 p-4 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Overall Traveler Rating
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{metrics.averageRating}</span>
            <span className="text-xs text-muted-foreground">/ 5.0</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "size-4",
                  star <= Math.round(metrics.averageRating)
                    ? "fill-amber-500 text-amber-500"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
            <span className="ml-1 text-[11px] text-muted-foreground">({metrics.totalReviews} verified)</span>
          </div>
        </div>

        {/* Price / Value for Money Score */}
        <div className="rounded-xl border border-border/60 bg-background/80 p-4 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1">
            <DollarSign className="size-3.5 text-emerald-600" /> Price & Value Rating
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {metrics.averagePriceRating}
            </span>
            <span className="text-xs text-muted-foreground">/ 5.0</span>
          </div>
          <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {metrics.averagePriceRating >= 4.7
              ? "Exceptional Value for Money"
              : metrics.averagePriceRating >= 4.0
              ? "Great Travel Value"
              : "Standard Tourism Pricing"}
          </p>
        </div>

        {/* Tour Guide Hire Percentage */}
        <div className="rounded-xl border border-border/60 bg-background/80 p-4 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1">
            <Award className="size-3.5 text-primary" /> Guide Recommendation
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-primary">{metrics.guideHirePercentage}%</span>
            <span className="text-xs text-muted-foreground">of travelers</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Hired an official ASI or local naturalist guide
          </p>
        </div>

        {/* Quick Yatra Tip */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-primary flex items-center gap-1">
              <Sparkles className="size-3.5" /> Yatra Advisory
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Official ASI guides wear a blue/green badge. Rates are fixed at ₹2,050/half-day.
            </p>
          </div>
          {onAskYatra && (
            <button
              onClick={() =>
                onAskYatra(
                  `What are the verified traveler tips, best time of morning to visit, and tour guide prices for ${place.name}?`
                )
              }
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Ask Yatra about prices →
            </button>
          )}
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <span className="text-xs font-semibold text-muted-foreground mr-1">Filter Reviews:</span>
        {[
          { id: "all", label: `All (${allReviewsForPlace.length})` },
          { id: "with-guide", label: "Hired Guide" },
          { id: "5-star", label: "5 Stars" },
          { id: "couple", label: "Couples" },
          { id: "family", label: "Families" },
          { id: "solo", label: "Solo Travelers" },
          { id: "photography", label: "Photographers" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedFilter(f.id)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer",
              selectedFilter === f.id
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "border border-border/80 bg-background/80 text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No reviews match this filter. Be the first to add one!
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const isUpvoted = upvotedIds.includes(rev.id);
            return (
              <div
                key={rev.id}
                className="rounded-xl border border-border/70 bg-background/90 p-5 shadow-xs transition-all hover:border-border"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{rev.author}</span>
                      {rev.authorLocation && (
                        <span className="text-xs text-muted-foreground">from {rev.authorLocation}</span>
                      )}
                      {rev.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" /> Verified Visit
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{rev.date}</p>
                  </div>

                  {/* Rating Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <Star className="size-3.5 fill-amber-500" />
                      <span>{rev.rating}.0 Experience</span>
                    </div>

                    <div className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="size-3.5" />
                      <span>{rev.priceRating}.0 Value</span>
                    </div>
                  </div>
                </div>

                {/* Title and Comment */}
                <h4 className="mt-3 text-sm font-bold text-foreground">{rev.title}</h4>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {rev.comment}
                </p>

                {/* Meta details: Guide hired & helpfulness */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-[11px] font-medium text-foreground capitalize">
                      {rev.travelType} trip
                    </span>
                    {rev.tourGuideHired && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                        <Award className="size-3" /> Hired Guide ({rev.tourGuideCost || "ASI Approved"})
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => upvote(rev.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer",
                      isUpvoted
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "border border-border/80 bg-background/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <ThumbsUp className="size-3" />
                    <span>Helpful ({rev.upvotes + (isUpvoted ? 1 : 0)})</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <h3 className="display-font text-xl font-bold text-foreground">
              Review & Rate {place.name}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Share authentic pricing tips, guide experiences, and insights to help fellow travelers.
            </p>

            {formSubmitted ? (
              <div className="my-8 rounded-xl bg-emerald-500/10 p-6 text-center text-emerald-600">
                <CheckCircle2 className="mx-auto size-12 mb-2" />
                <p className="font-bold">Thank you for your review!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your ratings and pricing feedback have been saved.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      City / Country
                    </label>
                    <input
                      type="text"
                      value={authorCity}
                      onChange={(e) => setAuthorCity(e.target.value)}
                      placeholder="e.g. Mumbai, India"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Rating Inputs */}
                <div className="grid gap-4 sm:grid-cols-2 rounded-xl border border-border/70 bg-secondary/30 p-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Overall Experience Rating
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-0.5 cursor-pointer hover:scale-110 transition-transform"
                        >
                          <Star
                            className={cn(
                              "size-5",
                              star <= rating
                                ? "fill-amber-500 text-amber-500"
                                : "text-muted-foreground/30"
                            )}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-foreground">{rating}/5</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">
                      Price / Value for Money Rating
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setPriceRating(star)}
                          className="p-0.5 cursor-pointer hover:scale-110 transition-transform"
                        >
                          <Star
                            className={cn(
                              "size-5",
                              star <= priceRating
                                ? "fill-emerald-500 text-emerald-500"
                                : "text-muted-foreground/30"
                            )}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {priceRating}/5
                      </span>
                    </div>
                  </div>
                </div>

                {/* Travel Type */}
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Travel Companion
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(["solo", "couple", "family", "friends", "photography"] as TravelType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTravelType(type)}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs capitalize transition-all cursor-pointer",
                          travelType === type
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "border border-border bg-background text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tour Guide Options */}
                <div className="rounded-xl border border-border/70 bg-secondary/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      Did you hire a tour guide or audio guide?
                    </span>
                    <button
                      type="button"
                      onClick={() => setGuideHired(!guideHired)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer",
                        guideHired ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {guideHired ? "Yes" : "No"}
                    </button>
                  </div>
                  {guideHired && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                        Guide Type & Fee Paid (Optional)
                      </label>
                      <input
                        type="text"
                        value={guideCost}
                        onChange={(e) => setGuideCost(e.target.value)}
                        placeholder="e.g. ₹2,050 ASI Half-Day, ₹200 Audio Guide"
                        className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Review Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Unbelievable sunrise, guide was indispensable"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Your Experience & Tips *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Describe what you saw, ticket counter queue tips, whether the guide was worth the price, best viewpoints..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
