import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decks = await db.deck.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { flashcards: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(decks);
  } catch (error) {
    console.error("Error fetching decks:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, color } = await request.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const deck = await db.deck.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        color: color || "#6366f1",
        userId: session.user.id,
      },
    });

    return NextResponse.json(deck);
  } catch (error) {
    console.error("Error creating deck:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
