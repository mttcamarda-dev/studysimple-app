import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateFlashcards } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { text, deckId, count = 5 } = await request.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Verify deck ownership if deckId provided
    if (deckId) {
      const deck = await db.deck.findFirst({
        where: { id: deckId, userId: session.user.id },
      });

      if (!deck) {
        return NextResponse.json({ error: "Deck not found" }, { status: 404 });
      }
    }

    // Generate flashcards using AI
    const generatedCards = await generateFlashcards(text, count);

    if (generatedCards.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate flashcards" },
        { status: 500 }
      );
    }

    // If deckId provided, save flashcards to database
    if (deckId) {
      const flashcards = await Promise.all(
        generatedCards.map(async (card) => {
          const flashcard = await db.flashcard.create({
            data: {
              deckId,
              front: card.front,
              back: card.back,
              aiGenerated: true,
            },
          });

          // Create initial review
          await db.cardReview.create({
            data: {
              flashcardId: flashcard.id,
              userId: session.user.id,
              rating: 0,
              interval: 0,
              easeFactor: 2.5,
              nextReview: new Date(),
            },
          });

          return flashcard;
        })
      );

      return NextResponse.json({ flashcards, saved: true });
    }

    // Return generated cards without saving
    return NextResponse.json({ flashcards: generatedCards, saved: false });
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
