// SM-2 Algorithm Implementation for Spaced Repetition

export interface ReviewResult {
  nextReview: Date;
  interval: number;
  easeFactor: number;
}

export type Rating = 0 | 1 | 2 | 3 | 4 | 5;

// Rating meanings:
// 0 - Complete blackout, no memory
// 1 - Incorrect response, but upon seeing the answer, remembered
// 2 - Incorrect response, but the correct answer seemed easy to recall
// 3 - Correct response with serious difficulty
// 4 - Correct response after hesitation
// 5 - Perfect response with no hesitation

export function calculateNextReview(
  rating: Rating,
  currentInterval: number,
  currentEaseFactor: number
): ReviewResult {
  let interval: number;
  let easeFactor = currentEaseFactor;

  // Calculate new ease factor
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02))
  );

  if (rating < 3) {
    // Failed - reset interval
    interval = 1;
  } else {
    // Passed - increase interval
    if (currentInterval === 0) {
      interval = 1;
    } else if (currentInterval === 1) {
      interval = 6;
    } else {
      interval = Math.round(currentInterval * easeFactor);
    }
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    nextReview,
    interval,
    easeFactor: Math.round(easeFactor * 100) / 100,
  };
}

// Simplified rating for user interface
export type SimpleRating = "again" | "hard" | "good" | "easy";

export function simpleRatingToSM2(rating: SimpleRating): Rating {
  const map: Record<SimpleRating, Rating> = {
    again: 1,
    hard: 2,
    good: 4,
    easy: 5,
  };
  return map[rating];
}

export function getNextReviewText(nextReview: Date): string {
  const now = new Date();
  const diffMs = nextReview.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Oggi";
  if (diffDays === 1) return "Domani";
  if (diffDays < 7) return `${diffDays} giorni`;
  if (diffDays < 30) return `${Math.round(diffDays / 7)} settimane`;
  return `${Math.round(diffDays / 30)} mesi`;
}
