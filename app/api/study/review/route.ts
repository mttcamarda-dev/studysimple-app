import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  calculateNextReview,
  simpleRatingToSM2,
  type SimpleRating,
} from "@/lib/spaced-repetition";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { flashcardId, rating } = await request.json();

    if (!flashcardId || !rating) {
      return NextResponse.json(
        { error: "flashcardId and rating are required" },
        { status: 400 }
      );
    }

    // Get the last review for this card
    const lastReview = await db.cardReview.findFirst({
      where: {
        flashcardId,
        userId: session.user.id,
      },
      orderBy: { reviewedAt: "desc" },
    });

    const sm2Rating = simpleRatingToSM2(rating as SimpleRating);
    const currentInterval = lastReview?.interval || 0;
    const currentEaseFactor = lastReview?.easeFactor || 2.5;

    const result = calculateNextReview(sm2Rating, currentInterval, currentEaseFactor);

    // Create new review entry
    const review = await db.cardReview.create({
      data: {
        flashcardId,
        userId: session.user.id,
        rating: sm2Rating,
        interval: result.interval,
        easeFactor: result.easeFactor,
        nextReview: result.nextReview,
      },
    });

    // Update study streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const streak = await db.studyStreak.findUnique({
      where: { userId: session.user.id },
    });

    if (streak) {
      const lastStudy = streak.lastStudyDate
        ? new Date(streak.lastStudyDate)
        : null;

      if (lastStudy) {
        lastStudy.setHours(0, 0, 0, 0);
      }

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let newStreak = streak.currentStreak;

      if (!lastStudy || lastStudy.getTime() < today.getTime()) {
        if (lastStudy && lastStudy.getTime() === yesterday.getTime()) {
          newStreak = streak.currentStreak + 1;
        } else if (!lastStudy || lastStudy.getTime() < yesterday.getTime()) {
          newStreak = 1;
        }

        await db.studyStreak.update({
          where: { userId: session.user.id },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, streak.longestStreak),
            lastStudyDate: new Date(),
            totalCards: streak.totalCards + 1,
          },
        });
      }
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
