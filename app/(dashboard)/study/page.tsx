import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { StudySession } from "@/components/flashcards/study-session";

interface StudyPageProps {
  searchParams: { deckId?: string };
}

async function getDueCards(userId: string, deckId?: string) {
  const whereClause: any = {
    deck: { userId },
  };

  if (deckId) {
    whereClause.deckId = deckId;
  }

  const flashcards = await db.flashcard.findMany({
    where: whereClause,
    include: {
      deck: true,
      reviews: {
        where: { userId },
        orderBy: { reviewedAt: "desc" },
        take: 1,
      },
    },
  });

  // Filter to cards that are due for review
  const now = new Date();
  const dueCards = flashcards.filter((card) => {
    if (card.reviews.length === 0) return true;
    const lastReview = card.reviews[0];
    return new Date(lastReview.nextReview) <= now;
  });

  return dueCards;
}

async function getDeck(id: string, userId: string) {
  return db.deck.findFirst({
    where: { id, userId },
  });
}

export default async function StudyPage({ searchParams }: StudyPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  const dueCards = await getDueCards(userId, searchParams.deckId);
  const deck = searchParams.deckId
    ? await getDeck(searchParams.deckId, userId)
    : null;

  return (
    <div className="pb-20 lg:pb-0">
      <StudySession
        cards={dueCards}
        deckTitle={deck?.title}
        deckId={searchParams.deckId}
      />
    </div>
  );
}
