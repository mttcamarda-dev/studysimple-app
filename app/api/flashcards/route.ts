import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deckId, front, back, aiGenerated = false } = await request.json();

    if (!deckId || !front?.trim() || !back?.trim()) {
      return NextResponse.json(
        { error: "deckId, front, and back are required" },
        { status: 400 }
      );
    }

    // Verify deck ownership
    const deck = await db.deck.findFirst({
      where: { id: deckId, userId: session.user.id },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const flashcard = await db.flashcard.create({
      data: {
        deckId,
        front: front.trim(),
        back: back.trim(),
        aiGenerated,
      },
    });

    // Create initial review entry
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

    return NextResponse.json(flashcard);
  } catch (error) {
    console.error("Error creating flashcard:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, front, back } = await request.json();

    if (!id || !front?.trim() || !back?.trim()) {
      return NextResponse.json(
        { error: "id, front, and back are required" },
        { status: 400 }
      );
    }

    // Verify ownership through deck
    const flashcard = await db.flashcard.findFirst({
      where: { id },
      include: { deck: true },
    });

    if (!flashcard || flashcard.deck.userId !== session.user.id) {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 });
    }

    const updated = await db.flashcard.update({
      where: { id },
      data: {
        front: front.trim(),
        back: back.trim(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating flashcard:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Verify ownership through deck
    const flashcard = await db.flashcard.findFirst({
      where: { id },
      include: { deck: true },
    });

    if (!flashcard || flashcard.deck.userId !== session.user.id) {
      return NextResponse.json({ error: "Flashcard not found" }, { status: 404 });
    }

    await db.flashcard.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
